-- Supabase Initial Schema for AWS Cloud Club SRIT ☁️
-- Run this script in the Supabase SQL Editor to set up the database tables and roles.

-- 1. Create a custom enum type for role
CREATE TYPE user_role AS ENUM ('super_admin', 'team_member', 'student');

-- 2. Create a 'profiles' table that connects to Supabase auth.users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'student',
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Trigger to automatically create a profile when a new user signs up
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

-- 4. Bind the trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Row Level Security (RLS) setup for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Students can read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Super Admins and Team Members can view all profiles
CREATE POLICY "Admins and Team Members can view all profiles" 
ON profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'team_member')
  )
);
