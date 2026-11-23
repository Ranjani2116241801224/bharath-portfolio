-- ==============================================================================
-- BHARATH S - 3D GALAXY PORTFOLIO DATABASE SCHEMA
-- MIGRATION 02: ROW LEVEL SECURITY (RLS) & ADMIN AUTHORIZATION
-- ==============================================================================
-- Execution order: RUN THIS SCRIPT SECOND (After 01_create_tables.sql)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. SECURITY DEFINER HELPER: Check if current auth session belongs to an authorized admin
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

  -- 2. Fast check: JWT email claim
  BEGIN
    v_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
    IF v_email IN ('sbarath1605@gmail.com', 'admin@bharaths.com') THEN
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

  -- 4. Role table check: public.admin_profiles
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = v_uid AND role IN ('admin', 'super_admin')
  ) INTO v_is_admin;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

-- Grant execution permission on is_admin() to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 2. AUTOMATIC ADMIN REGISTRATION TRIGGER
-- Automatically grants admin role exclusively to Bharath's authorized email address
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF LOWER(NEW.email) = 'sbarath1605@gmail.com' OR LOWER(NEW.email) = 'admin@bharaths.com' THEN
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
WHERE LOWER(email) IN ('sbarath1605@gmail.com', 'admin@bharaths.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 3. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- 4. CLEAN UP PREVIOUS POLICIES (Idempotent execution)
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
DROP POLICY IF EXISTS "Admin can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can manage contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can view admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin can manage admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Public can view website settings" ON public.website_settings;
DROP POLICY IF EXISTS "Admin can manage website settings" ON public.website_settings;

-- 5. RLS POLICIES: PROFILES TABLE
-- Public visitors can view profile details
CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Only authorized admin can insert, update, or delete profile details
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

-- 6. RLS POLICIES: PROJECTS TABLE
-- Public visitors can only view published projects (Admin can view all projects)
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  USING (is_published = true OR public.is_admin());

-- Only authorized admin can insert, update, or delete projects
CREATE POLICY "Admin can manage projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. RLS POLICIES: PROJECT_MEDIA TABLE
-- Public visitors can view media belonging to published projects
CREATE POLICY "Public can view published project media"
  ON public.project_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_media.project_id
        AND (projects.is_published = true OR public.is_admin())
    )
  );

-- Only authorized admin can manage project media
CREATE POLICY "Admin can manage project media"
  ON public.project_media FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. RLS POLICIES: SOCIAL_LINKS TABLE
-- Public visitors can view active social links
CREATE POLICY "Public can view active social links"
  ON public.social_links FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Only authorized admin can manage social links
CREATE POLICY "Admin can manage social links"
  ON public.social_links FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. RLS POLICIES: RESUMES TABLE
-- Public visitors can only view published resumes
CREATE POLICY "Public can view published resume"
  ON public.resumes FOR SELECT
  USING (is_published = true OR public.is_admin());

-- Only authorized admin can manage resumes
CREATE POLICY "Admin can manage resumes"
  ON public.resumes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. RLS POLICIES: CONTACT_MESSAGES TABLE
-- Public visitors can submit contact messages (Rate-limited on frontend)
CREATE POLICY "Public can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Only authorized admin can view, update, and delete contact messages
CREATE POLICY "Admin can manage contact messages"
  ON public.contact_messages FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 11. RLS POLICIES: ADMIN_PROFILES TABLE
-- Authenticated users can check their own admin role; admins can view all
CREATE POLICY "Admin can view admin profiles"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- Only existing admins can insert or update admin profiles
CREATE POLICY "Admin can manage admin profiles"
  ON public.admin_profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 12. RLS POLICIES: WEBSITE_SETTINGS TABLE
-- Public read for connection settings
CREATE POLICY "Public can view website settings"
  ON public.website_settings FOR SELECT
  USING (true);

-- Only authorized admin can update settings
CREATE POLICY "Admin can manage website settings"
  ON public.website_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
