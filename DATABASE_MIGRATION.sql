-- ============================================
-- DATABASE MIGRATION SCRIPT
-- Adding new fields to game_users table
-- ============================================

-- If you already ran the original schema, run this migration
-- Otherwise, use the updated SUPABASE_SCHEMA.sql

-- Add new columns to game_users table
ALTER TABLE game_users 
ADD COLUMN IF NOT EXISTS name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS rid VARCHAR(50);

-- Update existing columns to NOT NULL (after adding data)
-- First, update any existing records with placeholder data if needed
UPDATE game_users 
SET name = 'Update Required',
    phone_number = '0000000000',
    rid = 'UPDATE_REQUIRED'
WHERE name IS NULL OR phone_number IS NULL OR rid IS NULL;

-- Now make them NOT NULL
ALTER TABLE game_users 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN phone_number SET NOT NULL,
ALTER COLUMN rid SET NOT NULL;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_game_users_phone ON game_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_game_users_rid ON game_users(rid);

-- Add unique constraints if needed (optional, based on your requirements)
-- ALTER TABLE game_users ADD CONSTRAINT unique_phone UNIQUE (phone_number);
-- ALTER TABLE game_users ADD CONSTRAINT unique_rid UNIQUE (rid);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'game_users'
ORDER BY ordinal_position;

-- ============================================
-- NOTES
-- ============================================
-- 1. If you have existing users, they will have placeholder data
-- 2. Ask them to update their profiles or re-register
-- 3. The unique constraints are commented out - uncomment if you want
--    phone numbers and RIDs to be unique across all users
