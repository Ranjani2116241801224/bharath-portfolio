-- ==============================================================================
-- BHARATH S - 3D GALAXY PORTFOLIO COMPLETE DATABASE & SECURITY SETUP
-- CONSOLIDATED ALL-IN-ONE MIGRATION SCRIPT
-- ==============================================================================
-- Run this entire script in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It creates all tables, functions, RLS policies, storage buckets, and initial seeds.

-- PART 1: EXTENSIONS & TABLES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT 'BHARATH S',
  professional_title TEXT NOT NULL DEFAULT 'JUNIOR VIDEO EDITOR',
  description TEXT NOT NULL DEFAULT 'Passionate visual storyteller and junior video editor dedicated to turning raw footage into cinematic experiences.',
  profile_image_url TEXT,
  phone TEXT DEFAULT '+91 9585268336',
  email TEXT DEFAULT 'sbharath16052@gmail.com',
  location TEXT DEFAULT 'Krishnarajapuram, Bengaluru, Karnataka, India',
  small_heading TEXT DEFAULT 'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER',
  tagline TEXT DEFAULT 'Turning Raw Footage Into Visual Stories.',
  bio TEXT DEFAULT 'Passionate visual storyteller and junior video editor dedicated to turning raw footage into cinematic experiences. Proficient in industry-standard NLEs including Adobe Premiere Pro, DaVinci Resolve, and Final Cut Pro.',
  vision TEXT DEFAULT 'My creative goal is to craft high-impact narrative reels, commercials, and visual stories that captivate audiences and leave lasting emotional resonance.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all extended and canonical fields exist if the table was created earlier
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_title TEXT DEFAULT 'JUNIOR VIDEO EDITOR';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT DEFAULT 'Passionate visual storyteller and junior video editor dedicated to turning raw footage into cinematic experiences.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '+91 9585268336';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'sbharath16052@gmail.com';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Krishnarajapuram, Bengaluru, Karnataka, India';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS small_heading TEXT DEFAULT 'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Turning Raw Footage Into Visual Stories.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Passionate visual storyteller and junior video editor dedicated to turning raw footage into cinematic experiences. Proficient in industry-standard NLEs including Adobe Premiere Pro, DaVinci Resolve, and Final Cut Pro.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vision TEXT DEFAULT 'My creative goal is to craft high-impact narrative reels, commercials, and visual stories that captivate audiences and leave lasting emotional resonance.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Projects table
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
  sub_category TEXT,
  media_type TEXT NOT NULL DEFAULT 'video' CHECK (media_type IN ('video', 'photo')),
  is_demo BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Project media table
CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  file_name TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Social links table
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

-- Resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Admin profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Website settings table
CREATE TABLE IF NOT EXISTS public.website_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  use_supabase BOOLEAN NOT NULL DEFAULT true,
  supabase_url TEXT,
  supabase_anon_key TEXT,
  connected BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY,
  software TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Scissors',
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON public.projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order);
CREATE INDEX IF NOT EXISTS idx_project_media_project_id ON public.project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);

-- Automatic Updated At Trigger Function
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

DROP TRIGGER IF EXISTS set_skills_updated_at ON public.skills;
CREATE TRIGGER set_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Backward compatibility views
CREATE OR REPLACE VIEW public.profile_info AS SELECT * FROM public.profiles;
CREATE OR REPLACE VIEW public.portfolio_projects AS SELECT * FROM public.projects;
CREATE OR REPLACE VIEW public.resume_files AS SELECT * FROM public.resumes;

-- PART 2: ROW LEVEL SECURITY & ADMIN PERMISSIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_uid UUID;
  v_email TEXT;
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- 1. Unauthenticated visitors are NEVER administrators
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Fast check: Explicit Admin Auth UUID
  IF v_uid = 'e2de21ab-3253-4692-a875-cd733ba3de4d'::uuid THEN
    RETURN TRUE;
  END IF;

  -- 2. Fast check: JWT email claim
  BEGIN
    v_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
    IF v_email IN ('sbharath16052@gmail.com', 'sbarath1605@gmail.com', 'admin@bharaths.com') THEN
      RETURN TRUE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fall through if JWT claim parsing fails
  END;

  -- 3. Authoritative check: auth.users table lookup
  BEGIN
    SELECT LOWER(email) INTO v_email
    FROM auth.users
    WHERE id = v_uid;

    IF v_email IN ('sbharath16052@gmail.com', 'sbarath1605@gmail.com', 'admin@bharaths.com') THEN
      -- Auto-repair: Ensure user exists in admin_profiles
      INSERT INTO public.admin_profiles (id, role)
      VALUES (v_uid, 'admin')
      ON CONFLICT (id) DO NOTHING;
      RETURN TRUE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fall through if auth.users read is restricted
  END;

  -- 4. Role table check: public.admin_profiles
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = v_uid AND role IN ('admin', 'super_admin')
  ) INTO v_is_admin;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Auto-register Bharath's email as admin
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF LOWER(NEW.email) IN ('sbharath16052@gmail.com', 'sbarath1605@gmail.com', 'admin@bharaths.com') THEN
    INSERT INTO public.admin_profiles (id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_admin_created ON auth.users;
CREATE TRIGGER on_auth_user_admin_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_auth_user();

-- Retroactively link existing auth users matching the admin email
INSERT INTO public.admin_profiles (id, role)
SELECT id, 'admin' FROM auth.users
WHERE LOWER(email) IN ('sbharath16052@gmail.com', 'sbarath1605@gmail.com', 'admin@bharaths.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view published project media" ON public.project_media;
DROP POLICY IF EXISTS "Admin can manage project media" ON public.project_media;
DROP POLICY IF EXISTS "Public can view active social links" ON public.social_links;
DROP POLICY IF EXISTS "Admin can manage social links" ON public.social_links;
DROP POLICY IF EXISTS "Public can view published resume" ON public.resumes;
DROP POLICY IF EXISTS "Admin can manage resumes" ON public.resumes;
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can manage contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can view admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin can manage admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Public can view website settings" ON public.website_settings;
DROP POLICY IF EXISTS "Admin can manage website settings" ON public.website_settings;

-- Policies for profiles
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admin can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- Policies for projects
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admin can manage projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for project_media
CREATE POLICY "Public can view published project media" ON public.project_media FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_media.project_id
      AND (projects.is_published = true OR public.is_admin())
  )
);
CREATE POLICY "Admin can manage project media" ON public.project_media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for social_links
CREATE POLICY "Public can view active social links" ON public.social_links FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin can manage social links" ON public.social_links FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for resumes
CREATE POLICY "Public can view published resume" ON public.resumes FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "Admin can manage resumes" ON public.resumes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for contact_messages
CREATE POLICY "Public can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage contact messages" ON public.contact_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for admin_profiles
CREATE POLICY "Admin can view admin profiles" ON public.admin_profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admin can manage admin profiles" ON public.admin_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for website_settings
CREATE POLICY "Public can view website settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage website settings" ON public.website_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Policies for skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view skills" ON public.skills;
DROP POLICY IF EXISTS "Admin can manage skills" ON public.skills;
CREATE POLICY "Public can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin can manage skills" ON public.skills FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PART 3: STORAGE BUCKETS & STORAGE POLICIES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('portfolio-photos', 'portfolio-photos', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('portfolio-videos', 'portfolio-videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('portfolio-resumes', 'portfolio-resumes', true, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('portfolio-media', 'portfolio-media', true, 524288000, NULL),
  ('resumes', 'resumes', true, 20971520, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DROP POLICY IF EXISTS "Public read portfolio-photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload portfolio-photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin update portfolio-photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete portfolio-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read portfolio-videos" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload portfolio-videos" ON storage.objects;
DROP POLICY IF EXISTS "Admin update portfolio-videos" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete portfolio-videos" ON storage.objects;
DROP POLICY IF EXISTS "Public read portfolio-resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload portfolio-resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin update portfolio-resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete portfolio-resumes" ON storage.objects;

CREATE POLICY "Public read portfolio-photos" ON storage.objects FOR SELECT USING (bucket_id IN ('portfolio-photos', 'portfolio-media'));
CREATE POLICY "Admin upload portfolio-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('portfolio-photos', 'portfolio-media') AND public.is_admin());
CREATE POLICY "Admin update portfolio-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('portfolio-photos', 'portfolio-media') AND public.is_admin());
CREATE POLICY "Admin delete portfolio-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('portfolio-photos', 'portfolio-media') AND public.is_admin());

CREATE POLICY "Public read portfolio-videos" ON storage.objects FOR SELECT USING (bucket_id IN ('portfolio-videos', 'portfolio-media'));
CREATE POLICY "Admin upload portfolio-videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('portfolio-videos', 'portfolio-media') AND public.is_admin());
CREATE POLICY "Admin update portfolio-videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('portfolio-videos', 'portfolio-media') AND public.is_admin());
CREATE POLICY "Admin delete portfolio-videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('portfolio-videos', 'portfolio-media') AND public.is_admin());

CREATE POLICY "Public read portfolio-resumes" ON storage.objects FOR SELECT USING (bucket_id IN ('portfolio-resumes', 'resumes'));
CREATE POLICY "Admin upload portfolio-resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('portfolio-resumes', 'resumes') AND public.is_admin());
CREATE POLICY "Admin update portfolio-resumes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('portfolio-resumes', 'resumes') AND public.is_admin());
CREATE POLICY "Admin delete portfolio-resumes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('portfolio-resumes', 'resumes') AND public.is_admin());

-- PART 4: SEED INITIAL DATA
INSERT INTO public.profiles (
  id, full_name, professional_title, description, profile_image_url, phone, email, location, small_heading, tagline, bio, vision
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'BHARATH S',
  'JUNIOR VIDEO EDITOR',
  'Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications, including Adobe Premiere Pro, After Effects, Photoshop and Audition.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  '+91 9585268336',
  'sbharath16052@gmail.com',
  'Krishnarajapuram, Bengaluru, Karnataka, India',
  'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER',
  'Turning Raw Footage Into Visual Stories.',
  'Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications, including Adobe Premiere Pro, After Effects, Photoshop and Audition. Skilled in creating engaging social media reels, promotional videos, advertisement reels and cinematic edits. Familiar with video editing, audio enhancement, visual effects, motion graphics and image manipulation. Eager to apply creative skills, learn new techniques and contribute to a professional video production team.',
  'To begin my career as a Junior Video Editor in a creative media or digital marketing company where I can develop my editing skills, contribute to creative projects and grow professionally.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (
  id, title, description, category, sub_category, completion_date, thumbnail_url, video_url, media_type, is_published, is_demo, display_order, featured
)
VALUES
  ('11111111-1111-1111-1111-111111111101'::uuid, 'Neon Drift – Urban Cinematic Reel', 'Dynamic color graded cinematic cut with speed ramping, multi-angle pacing, glitch transitions, and cinematic sound design.', 'CINEMATIC', 'Cinematic Reels', '2024-10-15', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'video', true, true, 1, true),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'Aura Sportswear – Commercial Ad', 'High-octane advertisement cut showcasing apparel motion, synchronized beat drops, and bold typography animations.', 'ADVERTISEMENT', 'Advertisement Reels', '2024-11-02', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'video', true, true, 2, true),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'Chrono Pulse – Product Promotion Showcase', 'Luxury watch promo video featuring macro focus reveals, smooth 3D rotational transitions, and clean studio lighting enhancements.', 'PROMOTIONAL', 'Product Promotion Videos', '2024-09-20', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'video', true, true, 3, false),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'Velocity Beat – High Retention Social Reel', 'Optimized vertical cut for Instagram Reels and YouTube Shorts featuring kinetic captions, audio hits, and fast hook framing.', 'SOCIAL MEDIA', 'Instagram Reels', '2024-11-10', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4', 'video', true, true, 4, true),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'Cyber Mirage – Visual Effects & Motion Graphics', 'Created with After Effects: holographic UI HUD elements, seamless whip pans, and chromatic aberration effects.', 'CINEMATIC', 'Basic Motion Graphics', '2024-08-18', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=900&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'video', true, true, 5, false),
  ('11111111-1111-1111-1111-111111111106'::uuid, 'Lumina Fragrance – Elegance Commercial Spot', 'Color graded commercial edit highlighting slow-motion liquid dynamics, atmospheric lighting, and pristine audio mixing.', 'ADVERTISEMENT', 'Social Media Advertisement', '2024-10-28', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'video', true, true, 6, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.social_links (id, platform, profile_url, label, username, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222201'::uuid, 'whatsapp', 'https://wa.me/919585268336?text=Hi%20Bharath,%20I%20saw%20your%20Video%20Editing%20portfolio%20and%20would%20love%20to%20collaborate!', 'WhatsApp', '+91 9585268336', true),
  ('22222222-2222-2222-2222-222222222202'::uuid, 'email', 'mailto:sbharath16052@gmail.com', 'Email', 'sbharath16052@gmail.com', true),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'linkedin', 'https://www.linkedin.com/in/bharath-s-editor', 'LinkedIn', 'bharath-s-editor', true),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'instagram', 'https://www.instagram.com/bharaths.edits', 'Instagram', '@bharaths.edits', true),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'youtube', 'https://www.youtube.com/@BharathSEdits', 'YouTube', 'Bharath S Edits', true),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'github', 'https://github.com/bharath-s', 'GitHub', 'bharath-s', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.resumes (id, file_name, file_url, file_size, is_published)
VALUES ('33333333-3333-3333-3333-333333333301'::uuid, 'BHARATH_S_Video_Editor_Resume.pdf', '/resumes/BHARATH_S_Video_Editor_Resume.pdf', '420 KB', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.website_settings (id, use_supabase, connected)
VALUES ('primary_settings', true, true)
ON CONFLICT (id) DO NOTHING;

-- Seed initial technical skills
INSERT INTO public.skills (id, software, category, description, icon_name, topics, display_order)
VALUES
  ('skill_davinci', 'DaVinci Resolve Studio', 'Color Grading & Finishing', 'Industry standard color grading, node-based workflows, ACES color management, and HDR finishing.', 'Video', ARRAY['Color Science', 'Node Workflows', 'ACES', 'HDR Master', 'Film Emulation'], 1),
  ('skill_premiere', 'Adobe Premiere Pro', 'Non-Linear Editing (NLE)', 'Timeline pacing, multi-camera editing, dynamic transitions, audio ducking, and proxy workflows.', 'Film', ARRAY['Timeline Pacing', 'Multi-Cam Editing', 'Audio Ducking', 'Proxy Workflow'], 2),
  ('skill_aftereffects', 'Adobe After Effects', 'VFX & Motion Graphics', 'Visual effects compositing, motion tracking, particle systems, 3D camera tracker, and lower thirds.', 'Sparkles', ARRAY['Motion Tracking', '3D Camera', 'Compositing', 'Keyframing'], 3),
  ('skill_photoshop', 'Adobe Photoshop', 'Thumbnail & Graphic Design', 'Key art design, visual manipulation, custom title cards, thumbnail optimization, and grading LUTs.', 'Image', ARRAY['Key Art', 'Visual Retouching', 'Color Grading LUTs', 'Graphic Assets'], 4),
  ('skill_audition', 'Adobe Audition', 'Audio Post-Production', 'Sound design, noise cancellation, vocal EQ, parametric compression, and stereo mastering.', 'Music', ARRAY['Audio Mastering', 'Noise Removal', 'Stereo Balancing', 'Vocal Enhancement'], 5)
ON CONFLICT (id) DO NOTHING;

-- Realtime publication registration (safe & idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_media'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_media;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'social_links'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_links;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'resumes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resumes;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'skills'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.skills;
  END IF;
END;
$$;
