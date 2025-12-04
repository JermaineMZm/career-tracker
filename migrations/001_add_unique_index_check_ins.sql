-- Migration: Add unique index to ensure one check-in per user per day
-- Run this on your Supabase/Postgres database to enforce uniqueness at the DB level.

-- This creates a unique index on (user_id, date(created_at)). It prevents two rows
-- from the same user having the same date(created_at). If your application inserts
-- rows with different timezones, DATE(created_at) normalizes to the Postgres date.

CREATE UNIQUE INDEX IF NOT EXISTS unique_checkin_per_day
ON check_ins (user_id, (DATE(created_at)));

-- To roll back:
-- DROP INDEX IF EXISTS unique_checkin_per_day;
