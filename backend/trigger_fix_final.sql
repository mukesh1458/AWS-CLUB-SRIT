-- Final Phase 5 Trigger Override
-- Run this in the Supabase SQL Editor to absolutely bypass any column mismatch errors during signup.
-- It ensures that ONLY the universally guaranteed columns are inserted on signup.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_is_approved BOOLEAN;
BEGIN
  -- 1. Safely determine role
  BEGIN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role);
  EXCEPTION WHEN OTHERS THEN
    v_role := 'student'::user_role;
  END;

  -- 2. Determine approval status
  IF v_role IN ('super_admin', 'team_member') THEN
    v_is_approved := TRUE;
  ELSE
    v_is_approved := FALSE;
  END IF;

  -- 3. Insert minimum viable profile to guarantee success
  -- We only insert the columns defined in the original database.sql to avoid "column does not exist" errors
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_approved
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    v_role,
    v_is_approved
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Logging the error but NOT aborting the transaction!
  RAISE LOG 'CRITICAL handle_new_user error: %', SQLERRM;
  RETURN NEW; -- Must return NEW to allow auth.users insertion to complete
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
