-- Voting + Categorization + Anonymous Interaction System
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Voting Users
CREATE TABLE IF NOT EXISTS voting_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(50),
  rid VARCHAR(50) NOT NULL UNIQUE,
  dob DATE NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  plain_password VARCHAR(255),
  photo_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  has_voted BOOLEAN DEFAULT FALSE,
  has_categorized BOOLEAN DEFAULT FALSE,
  has_messaged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Voting Categories (admin-controlled, e.g. "Best Leader")
CREATE TABLE IF NOT EXISTS voting_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Nominees per category
CREATE TABLE IF NOT EXISTS voting_nominees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES voting_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Votes (one per user per category)
CREATE TABLE IF NOT EXISTS voting_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES voting_users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES voting_categories(id) ON DELETE CASCADE,
  nominee_id UUID NOT NULL REFERENCES voting_nominees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- 5. Label Categories (3 options shown during user categorization step)
CREATE TABLE IF NOT EXISTS voting_label_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Labels (categorization assignments)
CREATE TABLE IF NOT EXISTS voting_user_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  labeler_id UUID NOT NULL REFERENCES voting_users(id) ON DELETE CASCADE,
  labeled_user_id UUID NOT NULL REFERENCES voting_users(id) ON DELETE CASCADE,
  label_category_id UUID NOT NULL REFERENCES voting_label_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(labeler_id, labeled_user_id),
  CHECK (labeler_id != labeled_user_id)
);

-- 7. Anonymous Messages
CREATE TABLE IF NOT EXISTS voting_anonymous_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES voting_users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_voting_users_status ON voting_users(status);
CREATE INDEX IF NOT EXISTS idx_voting_users_email ON voting_users(email);
CREATE INDEX IF NOT EXISTS idx_voting_users_rid ON voting_users(rid);
CREATE INDEX IF NOT EXISTS idx_voting_votes_user_id ON voting_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_voting_votes_category_id ON voting_votes(category_id);
CREATE INDEX IF NOT EXISTS idx_voting_nominees_category_id ON voting_nominees(category_id);
CREATE INDEX IF NOT EXISTS idx_voting_user_labels_labeler_id ON voting_user_labels(labeler_id);
CREATE INDEX IF NOT EXISTS idx_voting_user_labels_labeled_user_id ON voting_user_labels(labeled_user_id);
CREATE INDEX IF NOT EXISTS idx_voting_label_categories_active ON voting_label_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_voting_categories_active ON voting_categories(is_active);

-- RLS
ALTER TABLE voting_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_label_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_user_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_anonymous_messages ENABLE ROW LEVEL SECURITY;

-- updated_at trigger function (reuses existing if present)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_voting_users_updated_at BEFORE UPDATE ON voting_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voting_categories_updated_at BEFORE UPDATE ON voting_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
