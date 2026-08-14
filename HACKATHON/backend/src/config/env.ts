import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates every required environment variable at boot and fails fast with
 * a clear message, instead of the app starting successfully and then
 * behaving unpredictably (e.g. Mongoose silently retrying a malformed URI,
 * or JWTs signed with `undefined` as the secret).
 *
 * Optional integrations (email) are validated as a group: either both
 * EMAIL_USER and EMAIL_PASS are set, or neither is — see `emailConfigured`.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required (MongoDB Atlas connection string or local mongod URI)'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),

  FRONTEND_URL: z.string().url('FRONTEND_URL must be a full URL, e.g. https://your-app.vercel.app'),
  ML_BACKEND_URL: z.string().url().default('http://localhost:8000'),

  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().int().positive().default(587),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('\n❌ Invalid or missing environment variables:\n');
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('\nSee .env.example for the full list of required variables.\n');
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();

/** True only when both EMAIL_USER and EMAIL_PASS are set — gates password-reset/account-setup email sending. */
export const emailConfigured = Boolean(env.EMAIL_USER && env.EMAIL_PASS);

if (!emailConfigured) {
  console.warn(
    '⚠️  EMAIL_USER/EMAIL_PASS not set — password-reset and migrated-account-setup emails will be logged to the console instead of actually sent. Fine for local dev, must be set in production.',
  );
}
