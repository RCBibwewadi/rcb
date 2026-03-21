-- Migration: Add individual user status tracking to matches
-- This enables two-way acceptance logic where both users must accept

-- Add user1_status and user2_status columns
ALTER TABLE matchup_matches 
ADD COLUMN IF NOT EXISTS user1_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
CHECK (user1_status IN ('pending', 'accepted', 'rejected'));

ALTER TABLE matchup_matches 
ADD COLUMN IF NOT EXISTS user2_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
CHECK (user2_status IN ('pending', 'accepted', 'rejected'));

-- Add new 'confirmed' status to the existing status check constraint
-- First drop the old constraint
ALTER TABLE matchup_matches DROP CONSTRAINT IF EXISTS matchup_matches_status_check;

-- Add new constraint with 'confirmed' status
ALTER TABLE matchup_matches 
ADD CONSTRAINT matchup_matches_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'auto_matched', 'confirmed'));

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_matchup_matches_user1_status ON matchup_matches(user1_status);
CREATE INDEX IF NOT EXISTS idx_matchup_matches_user2_status ON matchup_matches(user2_status);

-- Update existing pending matches to have pending user statuses
UPDATE matchup_matches 
SET user1_status = 'pending', user2_status = 'pending' 
WHERE user1_status IS NULL OR user2_status IS NULL;

-- Update existing accepted matches to have both users accepted
-- and set status to 'confirmed' 
UPDATE matchup_matches 
SET user1_status = 'accepted', user2_status = 'accepted', status = 'confirmed' 
WHERE status = 'accepted';

-- Update existing rejected matches
UPDATE matchup_matches 
SET user1_status = 'rejected', user2_status = 'rejected' 
WHERE status = 'rejected';

-- Update auto_matched to have both users accepted and status confirmed
UPDATE matchup_matches 
SET user1_status = 'accepted', user2_status = 'accepted', status = 'confirmed' 
WHERE status = 'auto_matched';
