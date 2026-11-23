-- ==============================================================================
-- BHARATH S - 3D GALAXY PORTFOLIO: RLS & ADMIN AUTHENTICATION HOTFIX
-- ==============================================================================
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yvwaiehizopdlzsdrrms/sql
--
-- PURPOSE:
-- 1. Eliminates "Database permission denied (RLS)" error on profiles and all portfolio tables.
-- 2. Explicitly recognizes Bharath's Admin Auth UUID: e2de21ab-3253-4692-a875-cd733ba3de4d
-- 3. Explicitly anchors the Portfolio Profile UUID: 00000000-0000-0000-0000-000000000001
-- 4. Makes `is_admin()` bulletproof by verifying:
--    - Exact Admin Auth UUID match (e2de21ab-3253-4692-a875-cd733ba3de4d)
--    - Direct JWT email claim: LOWER(auth.jwt() ->> 'email')
--    - Direct auth.users table lookup for current auth.uid()
--    - public.admin_profiles table
-- 5. Breaks circular RLS dependency on public.admin_profiles table.
-- 6. Configures dynamic skills table with public read and admin manage RLS.
-- 7. Enables Supabase Realtime publication on all portfolio tables.
-- ==============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure all canonical and extended columns exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT 'BHARATH S';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_title TEXT DEFAULT 'JUNIOR VIDEO EDITOR';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT DEFAULT 'Passionate visual storyteller and junior video editor dedicated to turning raw footage into cinematic experiences.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '+91 9585268336';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'sbarath1605@gmail.com';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Krishnarajapuram, Bengaluru, Karnataka, India';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS small_heading TEXT DEFAULT 'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Turning Raw Footage Into Visual Stories.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications, including Adobe Premiere Pro, After Effects, Photoshop and Audition.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vision TEXT DEFAULT 'To begin my career as a Junior Video Editor in a creative media or digital marketing company where I can develop my editing skills, contribute to creative projects and grow professionally.';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Seed or update canonical portfolio profile record
INSERT INTO public.profiles (
  id,
  full_name,
  professional_title,
  description,
  profile_image_url,
  phone,
  email,
  location,
  small_heading,
  tagline,
  bio,
  vision
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'BHARATH S',
  'JUNIOR VIDEO EDITOR',
  'Passionate visual storyteller and junior video editor dedicated to turning raw footage into cinematic experiences.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  '+91 9585268336',
  'sbarath1605@gmail.com',
  'Krishnarajapuram, Bengaluru, Karnataka, India',
  'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER',
  'Turning Raw Footage Into Visual Stories.',
  'Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications, including Adobe Premiere Pro, After Effects, Photoshop and Audition.',
  'To begin my career as a Junior Video Editor in a creative media or digital marketing company where I can develop my editing skills, contribute to creative projects and grow professionally.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Ensure admin_profiles table exists
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Bulletproof Multi-Layer is_admin() Function
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

  -- 3. Fast check: JWT email claim
  BEGIN
    v_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
    IF v_email IN ('sbarath1605@gmail.com', 'admin@bharaths.com') THEN
      RETURN TRUE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fall through if JWT claim parsing fails
  END;

  -- 4. Authoritative check: auth.users table lookup
  BEGIN
    SELECT LOWER(email) INTO v_email
    FROM auth.users
    WHERE id = v_uid;

    IF v_email IN ('sbarath1605@gmail.com', 'admin@bharaths.com') THEN
      -- Auto-repair: Ensure user exists in admin_profiles
      INSERT INTO public.admin_profiles (id, role)
      VALUES (v_uid, 'admin')
      ON CONFLICT (id) DO NOTHING;
      RETURN TRUE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fall through if auth.users read is restricted
  END;

  -- 5. Role table check: public.admin_profiles
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = v_uid AND role IN ('admin', 'super_admin')
  ) INTO v_is_admin;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 5. Auto-register Bharath's email in admin_profiles on sign-up / update
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF LOWER(NEW.email) IN ('sbarath1605@gmail.com', 'admin@bharaths.com') OR NEW.id = 'e2de21ab-3253-4692-a875-cd733ba3de4d'::uuid THEN
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

-- Retroactively populate admin_profiles from existing auth.users
INSERT INTO public.admin_profiles (id, role)
SELECT id, 'admin' FROM auth.users
WHERE LOWER(email) IN ('sbarath1605@gmail.com', 'admin@bharaths.com') OR id = 'e2de21ab-3253-4692-a875-cd733ba3de4d'::uuid
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 6. Clean and Recreate RLS on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 7. Fix RLS on admin_profiles (Breaks circular dependency lock)
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "User can view own admin profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin can manage admin profiles" ON public.admin_profiles;

CREATE POLICY "User can view own admin profile"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admin can manage admin profiles"
  ON public.admin_profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. Dynamic Skills Table & Policies
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

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view skills" ON public.skills;
DROP POLICY IF EXISTS "Admin can manage skills" ON public.skills;

CREATE POLICY "Public can view skills"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage skills"
  ON public.skills FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed initial skills if empty
INSERT INTO public.skills (id, software, category, description, icon_name, topics, display_order)
VALUES
  ('skill-pr', 'ADOBE PREMIERE PRO', 'Core Video Editing', 'Industry-standard non-linear editing software used to assemble, sequence, and polish narrative and promotional videos.', 'Scissors', ARRAY['Video editing', 'Transitions', 'Colour correction', 'Trimming', 'Sequencing', 'Reel editing'], 1),
  ('skill-ae', 'ADOBE AFTER EFFECTS', 'Visual Effects & Motion', 'Powerful motion graphics and compositing software to create animated visual elements, kinetic titles, and digital effects.', 'Sparkles', ARRAY['Motion graphics', 'Animation', 'Visual effects', 'Text animation'], 2),
  ('skill-ps', 'ADOBE PHOTOSHOP', 'Image & Graphic Design', 'Leading graphic design and photo manipulation tool for creating high-CTR YouTube thumbnails, posters, and visual assets.', 'Palette', ARRAY['Image editing', 'Photo manipulation', 'Poster design', 'Thumbnail creation'], 3),
  ('skill-au', 'ADOBE AUDITION', 'Audio Mastering & Cleanup', 'Comprehensive audio workstation for sound mixing, dialogue denoising, Foley effects, and loudness normalization.', 'Mic', ARRAY['Audio cleanup', 'Noise reduction', 'Voiceover enhancement', 'Sound effect design'], 4)
ON CONFLICT (id) DO NOTHING;

-- 9. Enable Realtime Publications
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_media;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_links;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resumes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.skills;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if table is already part of publication
END $$;
