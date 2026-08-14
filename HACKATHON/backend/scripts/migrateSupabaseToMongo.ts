/**
 * One-time migration: Supabase (auth.users + public.profiles) -> MongoDB `User` collection.
 *
 * Run with:  npm run migrate:supabase
 * Requires (see scripts/.env.migration.example):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (Project Settings -> API -> service_role secret)
 *   MONGODB_URI                              (the same URI the running app uses)
 *
 * What it does NOT do: carry over passwords. Supabase never exposes a
 * portable/bcrypt-compatible password hash through its REST or Admin API,
 * so every migrated account is created with `requiresPasswordSetup: true`
 * and (if EMAIL_USER/EMAIL_PASS are configured) is immediately emailed a
 * "set your password" link — the same link the app's own forgot-password
 * flow generates. See docs/MIGRATION.md.
 *
 * Safe to re-run: upserts by email, so already-migrated accounts are
 * skipped rather than duplicated or overwritten.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
// Deliberately import only from src/models and src/utils/token — NOT
// src/utils/email or src/utils/jwt — because both of those pull in
// config/env.ts, which enforces the *full* application env schema
// (JWT secrets, FRONTEND_URL, etc.) and would exit(1) if this script is run
// with only the 3 migration-specific vars it actually needs.
import { User } from '../src/models/User';
import { PasswordSetupToken } from '../src/models/PasswordSetupToken';
import { generateOpaqueToken, hashToken } from '../src/utils/token';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !MONGODB_URI) {
  console.error('❌ Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / MONGODB_URI. See scripts/.env.migration.example.');
  process.exit(1);
}

async function sendSetupEmail(to: string, name: string, link: string) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log(`   ✉️  [email disabled] Setup link for ${to}: ${link}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"E-Kishaan" <${EMAIL_USER}>`,
    to,
    subject: 'Set up your E-Kishaan account password',
    html: `<p>Hi ${name},</p><p>Your E-Kishaan account has moved to our new sign-in system. Set a password to keep using it:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
  });
}

interface SupabaseAuthUser {
  id: string;
  email: string;
  created_at: string;
}

interface SupabaseProfileRow {
  id: string;
  name: string | null;
  location: string | null;
  land_size: string | null;
  primary_crops: string[] | null;
  experience: string | null;
  phone: string | null;
}

async function fetchAllAuthUsers(): Promise<SupabaseAuthUser[]> {
  const users: SupabaseAuthUser[] = [];
  let page = 1;
  const perPage = 200;

  for (;;) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
      headers: { apikey: SERVICE_ROLE_KEY!, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    });
    if (!res.ok) throw new Error(`Supabase admin users fetch failed: ${res.status} ${await res.text()}`);
    const body = (await res.json()) as { users: SupabaseAuthUser[] };
    if (!body.users || body.users.length === 0) break;
    users.push(...body.users);
    if (body.users.length < perPage) break;
    page += 1;
  }

  return users;
}

async function fetchAllProfiles(): Promise<Map<string, SupabaseProfileRow>> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
    headers: { apikey: SERVICE_ROLE_KEY!, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase profiles fetch failed: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as SupabaseProfileRow[];
  return new Map(rows.map((r) => [r.id, r]));
}

async function main() {
  console.log('🔎 Fetching Supabase auth users + profiles...');
  const [authUsers, profilesById] = await Promise.all([fetchAllAuthUsers(), fetchAllProfiles()]);
  console.log(`   Found ${authUsers.length} auth users, ${profilesById.size} profile rows.`);

  await mongoose.connect(MONGODB_URI!);
  console.log('🍃 Connected to MongoDB.');

  let migrated = 0;
  let skipped = 0;
  let emailed = 0;
  let failed = 0;

  for (const authUser of authUsers) {
    try {
      const existing = await User.findOne({ email: authUser.email });
      if (existing) {
        skipped += 1;
        continue;
      }

      const profile = profilesById.get(authUser.id);
      const user = await User.create({
        name: profile?.name || authUser.email.split('@')[0],
        email: authUser.email,
        passwordHash: null,
        location: profile?.location ?? null,
        landSize: profile?.land_size ?? null,
        primaryCrops: profile?.primary_crops ?? [],
        experience: profile?.experience ?? null,
        phone: profile?.phone ?? null,
        migratedFromSupabase: true,
        requiresPasswordSetup: true,
      });
      migrated += 1;

      const rawToken = generateOpaqueToken();
      await PasswordSetupToken.create({
        userId: user._id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      await sendSetupEmail(user.email, user.name, `${FRONTEND_URL}/set-password?token=${rawToken}`);
      emailed += 1;
    } catch (err) {
      failed += 1;
      console.error(`   ❌ Failed to migrate ${authUser.email}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\n✅ Migration complete — migrated: ${migrated}, skipped (already existed): ${skipped}, setup emails sent: ${emailed}, failed: ${failed}`);
  if (!process.env.EMAIL_USER) {
    console.log('   (EMAIL_USER/EMAIL_PASS were not set — setup links were printed to the console above instead of emailed.)');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
