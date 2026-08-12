-- ============================================================================
-- E-Kishaan (AgriSmart) PostgreSQL Database Schema DDL for Supabase
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User Profile Metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  location TEXT,
  land_size TEXT,
  primary_crops TEXT[] DEFAULT '{}',
  experience TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. USER STATS & ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_points INT DEFAULT 1250,
  problems_solved INT DEFAULT 0,
  weather_checks INT DEFAULT 0,
  fertilizer_logs INT DEFAULT 0,
  market_checks INT DEFAULT 0,
  crops_tracked INT DEFAULT 4,
  solved_problem_titles TEXT[] DEFAULT '{}',
  first_visit_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User stats viewable by user" 
  ON public.user_stats FOR SELECT USING (true);

CREATE POLICY "User stats updatable by owner" 
  ON public.user_stats FOR ALL USING (true);

-- 3. FERTILIZER LOGS TABLE
CREATE TABLE IF NOT EXISTS public.fertilizer_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nitrogen NUMERIC(8,2) DEFAULT 0.0,
  phosphorus NUMERIC(8,2) DEFAULT 0.0,
  potassium NUMERIC(8,2) DEFAULT 0.0,
  application_date DATE DEFAULT CURRENT_DATE,
  month_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fertilizer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fertilizer logs viewable by everyone" 
  ON public.fertilizer_logs FOR SELECT USING (true);

CREATE POLICY "Fertilizer logs insertable by everyone" 
  ON public.fertilizer_logs FOR INSERT WITH CHECK (true);

-- 4. MARKET PRICES TABLE
CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  price_per_unit NUMERIC(10,2) NOT NULL,
  unit TEXT DEFAULT 'quintal',
  month_name TEXT NOT NULL,
  year_val INT DEFAULT 2026,
  price_type TEXT CHECK (price_type IN ('history', 'forecast')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market prices public read" 
  ON public.market_prices FOR SELECT USING (true);

-- Seed Default Market Price Data
INSERT INTO public.market_prices (crop_name, price_per_unit, unit, month_name, price_type)
VALUES
  ('rice', 2800, 'quintal', 'Jan', 'history'),
  ('rice', 2900, 'quintal', 'Feb', 'history'),
  ('rice', 3100, 'quintal', 'Mar', 'history'),
  ('rice', 3200, 'quintal', 'Apr', 'history'),
  ('rice', 3400, 'quintal', 'May', 'history'),
  ('rice', 3300, 'quintal', 'Jun', 'history'),
  ('rice', 3500, 'quintal', 'Jul', 'history'),
  ('rice', 3600, 'quintal', 'Aug', 'history'),
  ('rice', 3700, 'quintal', 'Sep', 'history'),
  ('rice', 3800, 'quintal', 'Oct', 'history'),
  ('rice', 3900, 'quintal', 'Nov', 'forecast'),
  ('rice', 4100, 'quintal', 'Dec', 'forecast'),
  ('rice', 4200, 'quintal', 'Jan', 'forecast')
ON CONFLICT DO NOTHING;

-- 5. AUTOMATIC TRIGGER FOR NEW USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, location)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', 'New Farmer'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'location', 'Punjab, India')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  INSERT INTO public.user_stats (user_id)
  VALUES (new.id)
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to Auth.Users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
