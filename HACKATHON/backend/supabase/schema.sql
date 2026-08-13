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
  electrical_conductivity NUMERIC(6,2) NOT NULL,
  organic_carbon NUMERIC(5,2) NOT NULL,
  soil_health_score INT NOT NULL CHECK (soil_health_score BETWEEN 0 AND 100),
  soil_health_status TEXT NOT NULL,
  recommended_crop TEXT NOT NULL,
  recommended_fertilizer TEXT NOT NULL,
  recommended_irrigation TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Soil reports public read" ON public.soil_reports FOR SELECT USING (true);

-- 7. CROP AGRONOMIC RULES TABLE (AI CROP ADVISORY ENGINE)
CREATE TABLE IF NOT EXISTS public.crop_agronomic_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  crop_name TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'Cereal',
  min_ph NUMERIC(4,2) DEFAULT 6.0,
  max_ph NUMERIC(4,2) DEFAULT 8.0,
  ideal_n NUMERIC(8,2) DEFAULT 90.0,
  ideal_p NUMERIC(8,2) DEFAULT 25.0,
  ideal_k NUMERIC(8,2) DEFAULT 180.0,
  min_oc NUMERIC(5,2) DEFAULT 0.50,
  ideal_season TEXT CHECK (ideal_season IN ('Rabi', 'Kharif', 'Zaid', 'All')),
  water_req_mm INT DEFAULT 380,
  growing_days INT DEFAULT 120,
  avg_yield_quintal_per_acre TEXT DEFAULT '22-26 quintal/acre',
  base_market_price NUMERIC(10,2) DEFAULT 2400.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crop_agronomic_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Crop rules public read" ON public.crop_agronomic_rules FOR SELECT USING (true);

-- 8. FARM ONBOARDING PROFILES TABLE (DIGITAL FARM TWIN)
CREATE TABLE IF NOT EXISTS public.farm_onboarding_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT UNIQUE DEFAULT 'default_farmer',
  farmer_name TEXT NOT NULL DEFAULT 'Gurpreet Singh',
  district TEXT NOT NULL DEFAULT 'Ludhiana',
  village TEXT DEFAULT 'Gill',
  state TEXT DEFAULT 'Punjab',
  language TEXT DEFAULT 'English',
  farm_size_acres NUMERIC(6,2) DEFAULT 5.0,
  num_fields INT DEFAULT 2,
  irrigation_source TEXT DEFAULT 'Tube-well + Canal',
  water_availability TEXT DEFAULT 'High',
  current_crop TEXT DEFAULT 'Wheat (HD-2967)',
  previous_crop TEXT DEFAULT 'Paddy (Rice)',
  planting_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  expected_harvest_date DATE DEFAULT CURRENT_DATE + INTERVAL '90 days',
  growth_stage TEXT DEFAULT 'Vegetative Stage',
  farming_goals TEXT[] DEFAULT '{"Maximum Profit", "Reduce Fertilizer Cost"}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.farm_onboarding_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm onboarding profiles viewable by everyone" ON public.farm_onboarding_profiles FOR SELECT USING (true);
CREATE POLICY "Farm onboarding profiles updateable by everyone" ON public.farm_onboarding_profiles FOR ALL USING (true);

-- 9. FARM DAILY DIARIES TABLE (END-OF-DAY CHECK-IN LOGS)
CREATE TABLE IF NOT EXISTS public.farm_daily_diaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT DEFAULT 'default_farmer',
  check_in_date DATE DEFAULT CURRENT_DATE,
  irrigated BOOLEAN DEFAULT false,
  fertilizer_applied BOOLEAN DEFAULT false,
  fertilizer_details TEXT,
  pests_observed BOOLEAN DEFAULT false,
  disease_symptoms TEXT,
  rainfall_observed BOOLEAN DEFAULT false,
  laborers_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.farm_daily_diaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farm daily diaries public view" ON public.farm_daily_diaries FOR SELECT USING (true);
CREATE POLICY "Farm daily diaries public insert" ON public.farm_daily_diaries FOR INSERT WITH CHECK (true);

-- Seed Agronomic Rules for 15 Punjab Crops
INSERT INTO public.crop_agronomic_rules 
  (crop_name, category, min_ph, max_ph, ideal_n, ideal_p, ideal_k, min_oc, ideal_season, water_req_mm, growing_days, avg_yield_quintal_per_acre, base_market_price)
VALUES
  ('Wheat', 'Cereal', 6.5, 7.8, 90, 25, 180, 0.55, 'Rabi', 380, 135, '22-26 quintal/acre', 2425),
  ('Paddy', 'Cereal', 6.0, 7.5, 95, 28, 175, 0.60, 'Kharif', 450, 120, '26-30 quintal/acre', 2300),
  ('Maize', 'Cereal', 6.0, 7.8, 85, 22, 160, 0.50, 'Kharif', 320, 100, '20-24 quintal/acre', 2225),
  ('Cotton', 'Fiber', 7.0, 8.5, 70, 18, 220, 0.40, 'Kharif', 300, 160, '12-16 quintal/acre', 7100),
  ('Sugarcane', 'Cash Crop', 6.5, 7.8, 110, 30, 190, 0.65, 'All', 600, 330, '350-400 quintal/acre', 380),
  ('Mustard', 'Oilseed', 6.2, 8.0, 65, 18, 150, 0.45, 'Rabi', 240, 110, '8-12 quintal/acre', 5650),
  ('Potato', 'Vegetable', 5.5, 7.2, 90, 30, 200, 0.60, 'Rabi', 350, 90, '120-150 quintal/acre', 1450),
  ('Tomato', 'Vegetable', 6.0, 7.5, 80, 25, 180, 0.55, 'Zaid', 320, 85, '90-110 quintal/acre', 1800),
  ('Onion', 'Vegetable', 6.0, 7.5, 75, 22, 170, 0.50, 'Rabi', 300, 100, '80-100 quintal/acre', 2100),
  ('Peas', 'Pulse', 6.2, 7.6, 40, 35, 140, 0.50, 'Rabi', 220, 75, '35-45 quintal/acre', 3200),
  ('Gram', 'Pulse', 6.5, 8.2, 35, 30, 130, 0.40, 'Rabi', 200, 110, '10-14 quintal/acre', 5440),
  ('Barley', 'Cereal', 6.8, 8.2, 70, 20, 150, 0.45, 'Rabi', 250, 115, '18-22 quintal/acre', 1950),
  ('Sunflower', 'Oilseed', 6.5, 8.0, 60, 20, 160, 0.48, 'Zaid', 280, 95, '10-13 quintal/acre', 6400),
  ('Millets', 'Cereal', 6.0, 8.4, 45, 15, 140, 0.35, 'Kharif', 180, 80, '14-18 quintal/acre', 2500),
  ('Vegetables', 'Horticulture', 6.0, 7.6, 85, 25, 175, 0.58, 'Zaid', 310, 70, '70-90 quintal/acre', 2200)
ON CONFLICT (crop_name) DO NOTHING;
