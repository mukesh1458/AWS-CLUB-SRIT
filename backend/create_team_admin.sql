-- Run this in the Supabase SQL Editor to manually spawn a Team Admin
-- Change 'teamadmin1@srit.ac.in' and 'password123' if you'd like

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'teamadmin@srit.ac.in',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  current_timestamp,
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Mukesh (Team Admin)", "role":"team_member"}',
  current_timestamp,
  current_timestamp,
  '',
  '',
  '',
  ''
) RETURNING id;

-- The trigger handle_new_user will automatically:
-- 1. See raw_user_meta_data->>'role' = 'team_member'
-- 2. Insert into `profiles` with role = 'team_member' & is_approved = true
