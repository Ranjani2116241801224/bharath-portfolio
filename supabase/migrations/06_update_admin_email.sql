-- ============================================================================
-- 06_update_admin_email.sql
-- Run this script in the Supabase SQL Editor to update your administrator email
-- to: sbharath16052@gmail.com
-- ============================================================================

-- 1. Update public.profiles canonical record email (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    UPDATE public.profiles
    SET 
      email = 'sbharath16052@gmail.com',
      updated_at = timezone('utc'::text, now())
    WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;

  -- 2. Update social_links email entry (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_links') THEN
    UPDATE public.social_links
    SET 
      url = 'mailto:sbharath16052@gmail.com',
      username = 'sbharath16052@gmail.com'
    WHERE platform = 'email' OR label = 'Email';
  END IF;
END;
$$;

-- 3. If an auth user with the old email exists in auth.users, update their email
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE LOWER(email) = 'sbarath1605@gmail.com') THEN
    UPDATE auth.users
    SET 
      email = 'sbharath16052@gmail.com',
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE LOWER(email) = 'sbarath1605@gmail.com';
  END IF;
END;
$$;

-- 4. Update or insert into admin_profiles
INSERT INTO public.admin_profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE LOWER(email) IN ('sbharath16052@gmail.com', 'sbarath1605@gmail.com') OR id = 'e2de21ab-3253-4692-a875-cd733ba3de4d'::uuid
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 5. Recreate is_admin() function with sbharath16052@gmail.com recognized
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
    IF v_email IN ('sbharath16052@gmail.com', 'sbarath1605@gmail.com', 'admin@bharaths.com') THEN
      RETURN TRUE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fall through if parsing fails
  END;

  -- 4. Authoritative check: auth.users table lookup
  BEGIN
    SELECT LOWER(email) INTO v_email
    FROM auth.users
    WHERE id = v_uid;

    IF v_email IN ('sbharath16052@gmail.com', 'sbarath1605@gmail.com', 'admin@bharaths.com') THEN
      INSERT INTO public.admin_profiles (id, role)
      VALUES (v_uid, 'admin')
      ON CONFLICT (id) DO NOTHING;
      RETURN TRUE;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Fall through if restricted
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

-- 6. Update user creation trigger to automatically grant admin role to sbharath16052@gmail.com
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF LOWER(NEW.email) IN ('sbharath16052@gmail.com', 'sbarath1605@gmail.com', 'admin@bharaths.com') OR NEW.id = 'e2de21ab-3253-4692-a875-cd733ba3de4d'::uuid THEN
    INSERT INTO public.admin_profiles (id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;
