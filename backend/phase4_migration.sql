-- Phase 4 DB Migration: AWS Cloud Club SRIT
-- Run this in the Supabase SQL Editor

-- Add new columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS position   TEXT,
  ADD COLUMN IF NOT EXISTS year       TEXT,
  ADD COLUMN IF NOT EXISTS branch     TEXT,
  ADD COLUMN IF NOT EXISTS interest   TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the handle_new_user trigger to store year, branch, interest
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_is_approved BOOLEAN;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student');

  IF v_role IN ('super_admin', 'team_member') THEN
    v_is_approved := TRUE;
  ELSE
    v_is_approved := FALSE;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, is_approved, year, branch, interest)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    v_role,
    v_is_approved,
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'interest'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
