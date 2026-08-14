import crypto from 'crypto';

/**
 * Pure crypto helpers with NO dependency on config/env.ts — deliberately
 * kept import-safe for scripts/migrateSupabaseToMongo.ts, which must be
 * runnable with only its own 3 env vars (see that script's header comment),
 * not the full application env schema that config/env.ts enforces.
 */

/** Refresh tokens and password-setup tokens are random opaque values, not JWTs — see jwt.ts for why. */
export function generateOpaqueToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
