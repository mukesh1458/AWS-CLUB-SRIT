-- Phase 5 DB Migration: AWS Cloud Club SRIT
-- Run this in the Supabase SQL Editor

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (event_id, student_id)
);

-- 3. Create Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS Policies for New Tables

-- Events: Anyone authenticated can read
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" 
ON public.events FOR SELECT TO authenticated USING (true);

-- Events: Only super_admin or team_member can insert/update/delete
CREATE POLICY "Admins and Team Admins can manage events" 
ON public.events FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'team_member')
  )
);

-- Event Registrations: Students can view and manage their own
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own registrations" 
ON public.event_registrations FOR SELECT TO authenticated USING (
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'team_member')
    )
);

CREATE POLICY "Users insert own registrations" 
ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Users delete own registrations" 
ON public.event_registrations FOR DELETE TO authenticated USING (student_id = auth.uid());

-- Resources: Anyone authenticated can read
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view resources" 
ON public.resources FOR SELECT TO authenticated USING (true);

-- Resources: Only super_admin or team_member can insert/update/delete
CREATE POLICY "Admins and Team Admins can manage resources" 
ON public.resources FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'team_member')
  )
);
