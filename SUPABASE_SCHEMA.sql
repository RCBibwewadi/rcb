-- ============================================
-- FANDOM QUEST GAME SYSTEM - SUPABASE SCHEMA
-- ============================================

-- 1. Game Users Table (Authentication & Registration)
CREATE TABLE game_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  rid VARCHAR(50) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_blocked BOOLEAN DEFAULT FALSE
);

-- 2. Series Cards Table (Movie/TV Series)
CREATE TABLE series_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  display_order INTEGER DEFAULT 0
);

-- 3. Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series_cards(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  question_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Quiz Attempts Table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES game_users(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series_cards(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 11),
  time_taken INTEGER NOT NULL, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answers JSONB -- stores user's answers for review
);

-- 5. Game Settings Table (Admin Controls)
CREATE TABLE game_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default game visibility setting
INSERT INTO game_settings (setting_key, setting_value) 
VALUES ('game_page_visible', 'false');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_series ON quiz_attempts(series_id);
CREATE INDEX idx_quiz_attempts_score ON quiz_attempts(score DESC);
CREATE INDEX idx_quiz_attempts_time ON quiz_attempts(time_taken ASC);
CREATE INDEX idx_questions_series ON questions(series_id);
CREATE INDEX idx_game_users_username ON game_users(username);
CREATE INDEX idx_game_users_email ON game_users(email);
CREATE INDEX idx_game_users_phone ON game_users(phone_number);
CREATE INDEX idx_game_users_rid ON game_users(rid);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE game_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

-- Game Users Policies
CREATE POLICY "Users can read their own data" ON game_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can register" ON game_users
  FOR INSERT WITH CHECK (true);

-- Series Cards Policies (Public Read)
CREATE POLICY "Anyone can view active series" ON series_cards
  FOR SELECT USING (is_active = true);

-- Questions Policies (Public Read for active series)
CREATE POLICY "Anyone can view questions for active series" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM series_cards 
      WHERE series_cards.id = questions.series_id 
      AND series_cards.is_active = true
    )
  );

-- Quiz Attempts Policies
CREATE POLICY "Users can view their own attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Game Settings Policies (Public Read)
CREATE POLICY "Anyone can view game settings" ON game_settings
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS FOR LEADERBOARDS
-- ============================================

-- Function to get series-specific leaderboard
CREATE OR REPLACE FUNCTION get_series_leaderboard(series_uuid UUID)
RETURNS TABLE (
  username VARCHAR,
  score INTEGER,
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gu.username,
    qa.score,
    qa.time_taken,
    qa.completed_at,
    RANK() OVER (ORDER BY qa.score DESC, qa.time_taken ASC) as rank
  FROM quiz_attempts qa
  JOIN game_users gu ON qa.user_id = gu.id
  WHERE qa.series_id = series_uuid
  ORDER BY qa.score DESC, qa.time_taken ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get global leaderboard (aggregate)
CREATE OR REPLACE FUNCTION get_global_leaderboard()
RETURNS TABLE (
  username VARCHAR,
  total_series_attempted BIGINT,
  total_questions_correct BIGINT,
  avg_time_per_quiz NUMERIC,
  total_score BIGINT,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gu.username,
    COUNT(DISTINCT qa.series_id) as total_series_attempted,
    SUM(qa.score) as total_questions_correct,
    ROUND(AVG(qa.time_taken)::numeric, 2) as avg_time_per_quiz,
    SUM(qa.score) as total_score,
    RANK() OVER (
      ORDER BY 
        COUNT(DISTINCT qa.series_id) DESC,
        SUM(qa.score) DESC,
        AVG(qa.time_taken) ASC
    ) as rank
  FROM game_users gu
  JOIN quiz_attempts qa ON gu.id = qa.user_id
  WHERE gu.is_blocked = false
  GROUP BY gu.id, gu.username
  ORDER BY 
    COUNT(DISTINCT qa.series_id) DESC,
    SUM(qa.score) DESC,
    AVG(qa.time_taken) ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTES FOR SETUP
-- ============================================
-- 1. Run this entire script in your Supabase SQL Editor
-- 2. Make sure to set up email authentication in Supabase Auth settings
-- 3. Configure Formspree integration for sending credentials
-- 4. Update your .env file with SUPABASE credentials
