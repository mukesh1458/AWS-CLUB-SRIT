-- Phase 3 Update: User Approval Workflow

-- 1. Add the is_approved column to the existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- 2. Update existing profiles (like our Super Admin) to be approved automatically
UPDATE public.profiles SET is_approved = TRUE WHERE role IN ('super_admin', 'team_member');

-- 3. Replace the handle_new_user trigger to handle dynamic approval based on role
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
  v_is_approved BOOLEAN;
BEGIN
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student');
  
  -- Auto-approve admins and team members. Students require manual approval.
  IF v_role IN ('super_admin', 'team_member') THEN
    v_is_approved := TRUE;
  ELSE
    v_is_approved := FALSE;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
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
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
