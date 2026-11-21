-- ==============================================================================
-- BHARATH S - 3D GALAXY PORTFOLIO DATABASE SCHEMA
-- MIGRATION 01: TABLE CREATION
-- ==============================================================================
-- Execution order: RUN THIS SCRIPT FIRST
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE
-- Stores Bharath's public biographical, professional, and contact details
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT 'BHARATH S',
  professional_title TEXT NOT NULL DEFAULT 'JUNIOR VIDEO EDITOR',
  description TEXT NOT NULL DEFAULT 'Passionate visual storyteller and junior video editor dedicated to turning raw footage into cinematic experiences.',
  profile_image_url TEXT,
  phone TEXT DEFAULT '+91 9585268336',
  email TEXT DEFAULT 'sbarath1605@gmail.com',
  location TEXT DEFAULT 'Krishnarajapuram, Bengaluru, Karnataka, India',
  -- Compatibility fields for frontend design
  small_heading TEXT DEFAULT 'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER',
  tagline TEXT DEFAULT 'Turning Raw Footage Into Visual Stories.',
  bio TEXT DEFAULT 'Passionate visual storyteller and junior video editor dedicated to turning raw footage into cinematic experiences. Proficient in industry-standard NLEs including Adobe Premiere Pro, DaVinci Resolve, and Final Cut Pro.',
  vision TEXT DEFAULT 'My creative goal is to craft high-impact narrative reels, commercials, and visual stories that captivate audiences and leave lasting emotional resonance.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure extended compatibility columns exist even if profiles table was created with only canonical columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS small_heading TEXT DEFAULT 'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Turning Raw Footage Into Visual Stories.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vision TEXT;

-- 3. PROJECTS TABLE
-- Stores portfolio items (Cinematic, Advertisement, Promotional, Social Media)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('CINEMATIC', 'ADVERTISEMENT', 'PROMOTIONAL', 'SOCIAL MEDIA')),
  thumbnail_url TEXT NOT NULL,
  completion_date TEXT,
  video_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  -- Additional project metadata
  sub_category TEXT,
  media_type TEXT NOT NULL DEFAULT 'video' CHECK (media_type IN ('video', 'photo')),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PROJECT_MEDIA TABLE
-- Stores individual photos, videos, and source assets linked to a project
CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  file_name TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. SOCIAL_LINKS TABLE
-- Stores Bharath's active social profiles (GitHub, LinkedIn, WhatsApp, Instagram, YouTube)
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  label TEXT,
  username TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. RESUMES TABLE
-- Stores Bharath's published CV and downloadable documents
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CONTACT_MESSAGES TABLE
-- Stores client inquiries and collaboration requests submitted via the contact form
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. ADMIN_PROFILES TABLE
-- Secure administrative role assignment linked to Supabase Auth UUID (auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. WEBSITE_SETTINGS TABLE
-- Stores website configuration and connection parameters
CREATE TABLE IF NOT EXISTS public.website_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  use_supabase BOOLEAN NOT NULL DEFAULT true,
  supabase_url TEXT,
  supabase_anon_key TEXT,
  connected BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON public.projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order);
CREATE INDEX IF NOT EXISTS idx_project_media_project_id ON public.project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);

-- 11. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_social_links_updated_at ON public.social_links;
CREATE TRIGGER set_social_links_updated_at
  BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. BACKWARD COMPATIBILITY VIEWS
-- Ensures legacy queries referencing profile_info, portfolio_projects, or resume_files continue to function
CREATE OR REPLACE VIEW public.profile_info AS SELECT * FROM public.profiles;
CREATE OR REPLACE VIEW public.portfolio_projects AS SELECT * FROM public.projects;
CREATE OR REPLACE VIEW public.resume_files AS SELECT * FROM public.resumes;
