# Migrating auth off Supabase, onto MongoDB

Auth moved from Supabase (Postgres + Supabase Auth) to a self-owned MongoDB + JWT system.
Nothing else migrated — no other module ever read from Supabase; they were already
computed server-side. This is a one-time, optional step: skip it entirely if you're fine
starting with zero existing accounts.

## What happens to existing accounts

Supabase never exposes a password hash through its REST or Admin API in a form usable
outside Supabase's own auth stack, so **passwords cannot be carried over**. Every migrated
account is created with no password (`requiresPasswordSetup: true`) and is emailed a
"set your password" link — the same link `/api/auth/forgot-password` generates.

## Running it

1. Get your Supabase project's **service_role** secret key: Supabase dashboard → Project
   Settings → API → `service_role` (not `anon`). Treat it like a root password.
2. Add it, plus `SUPABASE_URL`, to `HACKATHON/backend/.env` (see
   `scripts/.env.migration.example`) alongside the rest of the backend's normal `.env`
   (it needs `MONGODB_URI` too, to know where to write).
3. If you want migrated users to actually receive an email (rather than the link being
   printed to your terminal), also set `EMAIL_USER`/`EMAIL_PASS` in that same `.env`.
4. From `HACKATHON/backend`:
   ```bash
   npm install   # migration script needs devDependencies (ts-node, @supabase/supabase-js)
   npm run migrate:supabase
   ```
5. Read the summary it prints (migrated / skipped / emailed / failed counts). It's safe
   to re-run — already-migrated accounts (matched by email) are skipped, not duplicated.

## What a migrated user experiences

They click the emailed link → lands on `/set-password?token=...` in the app → sets a
password → is logged in immediately (the same endpoint that verifies the token also
issues them a real session).

## The old Supabase schema files

`HACKATHON/frontend/supabase/schema.sql` and `HACKATHON/backend/supabase/schema.sql` are
left in the repo untouched, but nothing in the running app reads from them anymore —
they're historical reference for the pre-migration auth schema only.
