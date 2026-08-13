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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

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
CREATE POLICY "User stats viewable by user" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "User stats updatable by owner" ON public.user_stats FOR ALL USING (true);

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
CREATE POLICY "Fertilizer logs viewable by everyone" ON public.fertilizer_logs FOR SELECT USING (true);
CREATE POLICY "Fertilizer logs insertable by everyone" ON public.fertilizer_logs FOR INSERT WITH CHECK (true);

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
CREATE POLICY "Market prices public read" ON public.market_prices FOR SELECT USING (true);

-- ============================================================================
-- DYNAMIC SOIL HEALTH INTELLIGENCE SCHEMA (PUNJAB 23 DISTRICTS)
-- ============================================================================

-- 5. DISTRICTS TABLE
CREATE TABLE IF NOT EXISTS public.districts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  state TEXT DEFAULT 'Punjab',
  latitude NUMERIC(8,4) NOT NULL,
  longitude NUMERIC(8,4) NOT NULL,
  agro_zone TEXT,
  total_area_ha NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Districts public read" ON public.districts FOR SELECT USING (true);

-- 6. SOIL REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.soil_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
  district_name TEXT NOT NULL,
  soil_type TEXT NOT NULL,
  soil_texture TEXT NOT NULL,
  soil_depth TEXT DEFAULT 'Deep (>100 cm)',
  drainage TEXT DEFAULT 'Well Drained',
  water_holding_capacity TEXT DEFAULT 'High',
  soil_color TEXT DEFAULT 'Brownish Yellow',
  soil_ph NUMERIC(4,2) NOT NULL,
  electrical_conductivity NUMERIC(6,2) NOT NULL, -- dS/m
  organic_carbon NUMERIC(5,2) NOT NULL, -- %
  soil_health_score INT NOT NULL CHECK (soil_health_score BETWEEN 0 AND 100),
  soil_health_status TEXT NOT NULL,
  recommended_crop TEXT NOT NULL,
  recommended_fertilizer TEXT NOT NULL,
  recommended_irrigation TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Soil reports public read" ON public.soil_reports FOR SELECT USING (true);

-- 7. SOIL NUTRIENTS TABLE
CREATE TABLE IF NOT EXISTS public.soil_nutrients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.soil_reports(id) ON DELETE CASCADE,
  nitrogen NUMERIC(8,2) NOT NULL, -- kg/ha
  phosphorus NUMERIC(8,2) NOT NULL, -- kg/ha
  potassium NUMERIC(8,2) NOT NULL, -- kg/ha
  sulphur NUMERIC(8,2) NOT NULL, -- ppm
  zinc NUMERIC(8,2) NOT NULL, -- ppm
  iron NUMERIC(8,2) NOT NULL, -- ppm
  copper NUMERIC(8,2) NOT NULL, -- ppm
  manganese NUMERIC(8,2) NOT NULL, -- ppm
  boron NUMERIC(8,2) NOT NULL, -- ppm
  calcium NUMERIC(8,2) NOT NULL, -- meq/100g
  magnesium NUMERIC(8,2) NOT NULL -- meq/100g
);

ALTER TABLE public.soil_nutrients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Soil nutrients public read" ON public.soil_nutrients FOR SELECT USING (true);

-- 8. CROP RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.crop_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.soil_reports(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  expected_yield TEXT NOT NULL,
  suitability_score INT CHECK (suitability_score BETWEEN 0 AND 100),
  water_requirement_mm INT,
  risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High'))
);

ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Crop recommendations public read" ON public.crop_recommendations FOR SELECT USING (true);

-- 9. FERTILIZER RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS public.fertilizer_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.soil_reports(id) ON DELETE CASCADE,
  fertilizer_name TEXT NOT NULL,
  dosage_kg_per_acre NUMERIC(8,2) NOT NULL,
  application_stage TEXT NOT NULL,
  frequency TEXT NOT NULL
);

ALTER TABLE public.fertilizer_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fertilizer recommendations public read" ON public.fertilizer_recommendations FOR SELECT USING (true);

-- 10. SOIL HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.soil_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  district_name TEXT NOT NULL,
  record_date DATE NOT NULL,
  month_name TEXT NOT NULL,
  nitrogen NUMERIC(8,2) NOT NULL,
  phosphorus NUMERIC(8,2) NOT NULL,
  potassium NUMERIC(8,2) NOT NULL,
  organic_carbon NUMERIC(5,2) NOT NULL,
  soil_ph NUMERIC(4,2) NOT NULL,
  health_score INT NOT NULL
);

ALTER TABLE public.soil_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Soil history public read" ON public.soil_history FOR SELECT USING (true);

-- 11. WEATHER CACHE TABLE
CREATE TABLE IF NOT EXISTS public.weather_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  district_name TEXT UNIQUE NOT NULL,
  temperature NUMERIC(5,2),
  rainfall_mm NUMERIC(8,2),
  humidity INT,
  soil_moisture NUMERIC(5,2),
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weather cache public read" ON public.weather_cache FOR SELECT USING (true);

-- Trigger for New User Profile Handling
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
