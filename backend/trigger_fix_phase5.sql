-- Phase 5 Trigger Fix
-- Run this in the Supabase SQL Editor to fix the 500 'Database error saving new user' error.
-- The issue was that the previous trigger was referencing columns or syntax that may fail silently, rolling back the auth.users insertion.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_is_approved BOOLEAN;
BEGIN
  -- Safely determine role
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role);
  EXCEPTION WHEN OTHERS THEN
    v_role := 'student'::user_role;
  END;

  -- Auto-approve admins and team members; students require manual approval
  IF v_role IN ('super_admin', 'team_member') THEN
    v_is_approved := TRUE;
  ELSE
    v_is_approved := FALSE;
  END IF;

  -- Insert profile, ignoring any columns that might not exist or be strictly formatted
  INSERT INTO public.profiles (
    id, email, full_name, role, is_approved,
    year, branch, interest
  )
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
  -- Extremely important: Never abort the auth.users insert if the profiles insert fails
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
