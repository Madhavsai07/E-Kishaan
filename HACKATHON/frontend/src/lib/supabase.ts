import { createClient } from '@supabase/supabase-js';

// These values come from your Supabase project settings (Project Settings ->
// API -> Project URL / anon public key). The anon key is safe to expose in
// client-side code — Supabase enforces access via Row Level Security (RLS)
// policies, not by keeping this key secret.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Missing VITE_SUPABASE_* environment variables. ' +
      'Copy .env.local.example to .env.local and fill in your Supabase project config.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// Mirrors the `profiles` table created by supabase/schema.sql.
export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  location: string | null;
  land_size: string | null;
  primary_crops: string[];
  experience: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
