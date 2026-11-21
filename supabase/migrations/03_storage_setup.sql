-- ==============================================================================
-- BHARATH S - 3D GALAXY PORTFOLIO DATABASE SCHEMA
-- MIGRATION 03: STORAGE BUCKETS & STORAGE SECURITY POLICIES
-- ==============================================================================
-- Execution order: RUN THIS SCRIPT THIRD (After 02_row_level_security.sql)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. CREATE STORAGE BUCKETS
-- portfolio-photos: 50MB max, JPG, PNG, WebP
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-photos',
  'portfolio-photos',
  true,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- portfolio-videos: 500MB max, MP4, WebM, QuickTime
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-videos',
  'portfolio-videos',
  true,
  524288000, -- 500 MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime'];

-- portfolio-resumes: 20MB max, PDF, DOCX
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-resumes',
  'portfolio-resumes',
  true,
  20971520, -- 20 MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Compatibility buckets for existing installations
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('portfolio-media', 'portfolio-media', true),
  ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CLEAN UP EXISTING STORAGE POLICIES
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

DROP POLICY IF EXISTS "Public Read Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Portfolio Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Resumes" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Resumes" ON storage.objects;

-- 3. STORAGE POLICIES: PORTFOLIO PHOTOS
CREATE POLICY "Public read portfolio-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('portfolio-photos', 'portfolio-media'));

CREATE POLICY "Admin upload portfolio-photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('portfolio-photos', 'portfolio-media') AND public.is_admin());

CREATE POLICY "Admin update portfolio-photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('portfolio-photos', 'portfolio-media') AND public.is_admin());

CREATE POLICY "Admin delete portfolio-photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('portfolio-photos', 'portfolio-media') AND public.is_admin());

-- 4. STORAGE POLICIES: PORTFOLIO VIDEOS
CREATE POLICY "Public read portfolio-videos"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('portfolio-videos', 'portfolio-media'));

CREATE POLICY "Admin upload portfolio-videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('portfolio-videos', 'portfolio-media') AND public.is_admin());

CREATE POLICY "Admin update portfolio-videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('portfolio-videos', 'portfolio-media') AND public.is_admin());

CREATE POLICY "Admin delete portfolio-videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('portfolio-videos', 'portfolio-media') AND public.is_admin());

-- 5. STORAGE POLICIES: PORTFOLIO RESUMES
CREATE POLICY "Public read portfolio-resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('portfolio-resumes', 'resumes'));

CREATE POLICY "Admin upload portfolio-resumes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('portfolio-resumes', 'resumes') AND public.is_admin());

CREATE POLICY "Admin update portfolio-resumes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('portfolio-resumes', 'resumes') AND public.is_admin());

CREATE POLICY "Admin delete portfolio-resumes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('portfolio-resumes', 'resumes') AND public.is_admin());
