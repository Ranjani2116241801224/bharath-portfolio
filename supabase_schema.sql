-- BHARATH S - 3D GALAXY PORTFOLIO DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILE INFORMATION TABLE
CREATE TABLE IF NOT EXISTS public.profile_info (
  id TEXT PRIMARY KEY DEFAULT 'bharath_profile',
  name TEXT NOT NULL DEFAULT 'BHARATH S',
  title TEXT NOT NULL DEFAULT 'JUNIOR VIDEO EDITOR',
  small_heading TEXT NOT NULL DEFAULT 'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER',
  tagline TEXT NOT NULL DEFAULT 'Turning Raw Footage Into Visual Stories.',
  bio TEXT NOT NULL,
  profile_image TEXT,
  location TEXT DEFAULT 'Krishnarajapuram, Bengaluru, Karnataka, India',
  phone TEXT DEFAULT '+91 9585268336',
  email TEXT DEFAULT 'sbarath1605@gmail.com',
  vision TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PORTFOLIO PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('CINEMATIC', 'ADVERTISEMENT', 'PROMOTIONAL', 'SOCIAL MEDIA')),
  sub_category TEXT,
  completion_date TEXT,
  thumbnail TEXT NOT NULL,
  video_url TEXT,
  media_type TEXT DEFAULT 'video' CHECK (media_type IN ('video', 'photo')),
  is_published BOOLEAN DEFAULT true,
  is_demo BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RESUME FILES TABLE
CREATE TABLE IF NOT EXISTS public.resume_files (
  id TEXT PRIMARY KEY DEFAULT 'primary_resume',
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  upload_date TEXT NOT NULL,
  file_size TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SOCIAL MEDIA LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_links (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  username TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read BOOLEAN DEFAULT false
);

-- 7. WEBSITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.website_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  use_supabase BOOLEAN DEFAULT true,
  supabase_url TEXT,
  supabase_anon_key TEXT,
  connected BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profile_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Public read permissions for published content
CREATE POLICY "Allow public read access to profile" ON public.profile_info FOR SELECT USING (true);
CREATE POLICY "Allow public read access to published projects" ON public.portfolio_projects FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access to published resume" ON public.resume_files FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access to social links" ON public.social_links FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public to submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Authenticated / Admin full access
CREATE POLICY "Allow all actions for authenticated users on profile" ON public.profile_info FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on projects" ON public.portfolio_projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on resume" ON public.resume_files FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on social" ON public.social_links FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on messages" ON public.contact_messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on settings" ON public.website_settings FOR ALL TO authenticated USING (true);

-- 9. STORAGE BUCKETS SETUP
-- Insert buckets into storage.buckets if they do not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public Read Portfolio Media" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-media');
CREATE POLICY "Admin Upload Portfolio Media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-media');
CREATE POLICY "Admin Update Portfolio Media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-media');
CREATE POLICY "Admin Delete Portfolio Media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-media');

CREATE POLICY "Public Read Resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Admin Upload Resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Admin Update Resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resumes');
CREATE POLICY "Admin Delete Resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resumes');
