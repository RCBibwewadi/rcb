-- MatchUp Feature - Supabase SQL Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MatchUp Users Table
CREATE TABLE IF NOT EXISTS matchup_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  rid VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  plain_password VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  is_matched BOOLEAN DEFAULT FALSE,
  matched_with UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS matchup_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES matchup_users(id) ON DELETE CASCADE UNIQUE,
  username VARCHAR(50) UNIQUE,
  dob DATE,
  zodiac_sign VARCHAR(20),
  photo1_url TEXT,
  photo2_url TEXT,
  photo3_url TEXT,
  prompt1 TEXT,
  prompt2 TEXT,
  prompt3 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Preference Questions Table (Admin controlled)
CREATE TABLE IF NOT EXISTS matchup_preference_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  weight DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Preferences Table
CREATE TABLE IF NOT EXISTS matchup_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES matchup_users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES matchup_preference_questions(id) ON DELETE CASCADE,
  answer_value DECIMAL(5,2) NOT NULL CHECK (answer_value >= 0 AND answer_value <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 5. Swipes Table
CREATE TABLE IF NOT EXISTS matchup_swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_id UUID NOT NULL REFERENCES matchup_users(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES matchup_users(id) ON DELETE CASCADE,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- 6. Matches Table
CREATE TABLE IF NOT EXISTS matchup_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES matchup_users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES matchup_users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'auto_matched')),
  match_score DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- 7. MatchUp Settings Table (for admin toggles)
CREATE TABLE IF NOT EXISTS matchup_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  setting_value BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO matchup_settings (setting_key, setting_value) 
VALUES ('matching_enabled', FALSE)
ON CONFLICT (setting_key) DO NOTHING;

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS matchup_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES matchup_users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_user_id UUID REFERENCES matchup_users(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_matchup_users_status ON matchup_users(status);
CREATE INDEX IF NOT EXISTS idx_matchup_users_gender ON matchup_users(gender);
CREATE INDEX IF NOT EXISTS idx_matchup_users_email ON matchup_users(email);
CREATE INDEX IF NOT EXISTS idx_matchup_profiles_user_id ON matchup_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_matchup_preferences_user_id ON matchup_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_matchup_preferences_question_id ON matchup_preferences(question_id);
CREATE INDEX IF NOT EXISTS idx_matchup_swipes_swiper_id ON matchup_swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_matchup_swipes_swiped_id ON matchup_swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matchup_matches_user1_id ON matchup_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matchup_matches_user2_id ON matchup_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matchup_matches_status ON matchup_matches(status);
CREATE INDEX IF NOT EXISTS idx_matchup_notifications_user_id ON matchup_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_matchup_notifications_is_read ON matchup_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_matchup_preference_questions_active ON matchup_preference_questions(is_active);

-- Row Level Security (RLS) Policies
ALTER TABLE matchup_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchup_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchup_preference_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchup_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchup_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchup_notifications ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active preference questions" ON matchup_preference_questions
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view matching enabled setting" ON matchup_settings
  FOR SELECT USING (setting_key = 'matching_enabled');

-- Service role bypasses RLS (used by API routes)
-- Note: API routes use supabaseServer which has service role key

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_matchup_users_updated_at BEFORE UPDATE ON matchup_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matchup_profiles_updated_at BEFORE UPDATE ON matchup_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matchup_matches_updated_at BEFORE UPDATE ON matchup_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matchup_preferences_updated_at BEFORE UPDATE ON matchup_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matchup_preference_questions_updated_at BEFORE UPDATE ON matchup_preference_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get zodiac sign from date
CREATE OR REPLACE FUNCTION get_zodiac_sign(date DATE) RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN CASE
    WHEN (EXTRACT(MONTH FROM date) = 12 AND EXTRACT(DAY FROM date) >= 22) OR
         (EXTRACT(MONTH FROM date) = 1 AND EXTRACT(DAY FROM date) <= 19) THEN 'Capricorn'
    WHEN (EXTRACT(MONTH FROM date) = 1 AND EXTRACT(DAY FROM date) >= 20) OR
         (EXTRACT(MONTH FROM date) = 2 AND EXTRACT(DAY FROM date) <= 18) THEN 'Aquarius'
    WHEN (EXTRACT(MONTH FROM date) = 2 AND EXTRACT(DAY FROM date) >= 19) OR
         (EXTRACT(MONTH FROM date) = 3 AND EXTRACT(DAY FROM date) <= 20) THEN 'Pisces'
    WHEN (EXTRACT(MONTH FROM date) = 3 AND EXTRACT(DAY FROM date) >= 21) OR
         (EXTRACT(MONTH FROM date) = 4 AND EXTRACT(DAY FROM date) <= 19) THEN 'Aries'
    WHEN (EXTRACT(MONTH FROM date) = 4 AND EXTRACT(DAY FROM date) >= 20) OR
         (EXTRACT(MONTH FROM date) = 5 AND EXTRACT(DAY FROM date) <= 20) THEN 'Taurus'
    WHEN (EXTRACT(MONTH FROM date) = 5 AND EXTRACT(DAY FROM date) >= 21) OR
         (EXTRACT(MONTH FROM date) = 6 AND EXTRACT(DAY FROM date) <= 20) THEN 'Gemini'
    WHEN (EXTRACT(MONTH FROM date) = 6 AND EXTRACT(DAY FROM date) >= 21) OR
         (EXTRACT(MONTH FROM date) = 7 AND EXTRACT(DAY FROM date) <= 22) THEN 'Cancer'
    WHEN (EXTRACT(MONTH FROM date) = 7 AND EXTRACT(DAY FROM date) >= 23) OR
         (EXTRACT(MONTH FROM date) = 8 AND EXTRACT(DAY FROM date) <= 22) THEN 'Leo'
    WHEN (EXTRACT(MONTH FROM date) = 8 AND EXTRACT(DAY FROM date) >= 23) OR
         (EXTRACT(MONTH FROM date) = 9 AND EXTRACT(DAY FROM date) <= 22) THEN 'Virgo'
    WHEN (EXTRACT(MONTH FROM date) = 9 AND EXTRACT(DAY FROM date) >= 23) OR
         (EXTRACT(MONTH FROM date) = 10 AND EXTRACT(DAY FROM date) <= 22) THEN 'Libra'
    WHEN (EXTRACT(MONTH FROM date) = 10 AND EXTRACT(DAY FROM date) >= 23) OR
         (EXTRACT(MONTH FROM date) = 11 AND EXTRACT(DAY FROM date) <= 21) THEN 'Scorpio'
    WHEN (EXTRACT(MONTH FROM date) = 11 AND EXTRACT(DAY FROM date) >= 22) OR
         (EXTRACT(MONTH FROM date) = 12 AND EXTRACT(DAY FROM date) <= 21) THEN 'Sagittarius'
    ELSE 'Unknown'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
