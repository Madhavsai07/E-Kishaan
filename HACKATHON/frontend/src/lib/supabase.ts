import { createClient } from '@supabase/supabase-js';

// These values come from the shared AgriSmart Supabase project (Project
// Settings -> API -> Project URL / anon public key). The anon key is safe to
// commit and expose in client-side code — Supabase enforces access via Row
// Level Security (RLS) policies (see supabase/schema.sql), not by keeping
// this key secret. It ships to every visitor's browser in the built JS
// bundle regardless, so hardcoding it here is no less "secret" than a
// production deploy would be.
//
// Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local to point at a
// *different* Supabase project instead (e.g. your own, for isolated testing)
// — that always takes priority over the defaults below.
const DEFAULT_SUPABASE_URL = 'https://mhdnygeskolhmcitupac.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZG55Z2Vza29saG1jaXR1cGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM5NTUsImV4cCI6MjEwMjAzOTk1NX0.2pR8iGEixo5nfH5xPNcqjSYilVj2v8JHrokWxgVRgZw';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Kept for backwards compatibility with call sites (RequireAuth,
// AuthContext) that still check this — now always true since we always have
// at least the shared-project defaults above.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
