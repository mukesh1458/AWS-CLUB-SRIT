-- Phase 4 Trigger Fix — Run this in the Supabase SQL Editor
-- This replaces the handle_new_user trigger with a safer version
-- that handles ALL column types (student + team_member + admin)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_is_approved BOOLEAN;
BEGIN
  -- Safely cast role, defaulting to 'student'
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student');
  EXCEPTION WHEN OTHERS THEN
    v_role := 'student';
  END;

  -- Auto-approve admins and team members; students require manual approval
  IF v_role IN ('super_admin', 'team_member') THEN
    v_is_approved := TRUE;
  ELSE
    v_is_approved := FALSE;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, role, is_approved,
    year, branch, interest, position
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    v_role,
    v_is_approved,
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'interest',
    NEW.raw_user_meta_data->>'position'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
