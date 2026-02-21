-- Temporary Debug Script
-- Run this in the Supabase SQL Editor to drop the trigger and test if the 500 error vanishes.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- If you run this and signups start working, we know 100% the trigger function is still failing on a hidden constraint.
