-- ==============================================================================
-- BHARATH S - 3D GALAXY PORTFOLIO DATABASE SCHEMA
-- MIGRATION 04: SEED INITIAL DATA
-- ==============================================================================
-- Execution order: RUN THIS SCRIPT FOURTH (After 03_storage_setup.sql)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. SEED BHARATH'S PROFILE
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
  'Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications, including Adobe Premiere Pro, After Effects, Photoshop and Audition.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  '+91 9585268336',
  'sbarath1605@gmail.com',
  'Krishnarajapuram, Bengaluru, Karnataka, India',
  'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER',
  'Turning Raw Footage Into Visual Stories.',
  'Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications, including Adobe Premiere Pro, After Effects, Photoshop and Audition. Skilled in creating engaging social media reels, promotional videos, advertisement reels and cinematic edits. Familiar with video editing, audio enhancement, visual effects, motion graphics and image manipulation. Eager to apply creative skills, learn new techniques and contribute to a professional video production team.',
  'To begin my career as a Junior Video Editor in a creative media or digital marketing company where I can develop my editing skills, contribute to creative projects and grow professionally.'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  professional_title = EXCLUDED.professional_title,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  location = EXCLUDED.location,
  updated_at = timezone('utc'::text, now());

-- 2. SEED INITIAL PORTFOLIO PROJECTS
INSERT INTO public.projects (
  id,
  title,
  description,
  category,
  sub_category,
  completion_date,
  thumbnail_url,
  video_url,
  media_type,
  is_published,
  is_demo,
  display_order,
  featured
)
VALUES
  (
    '11111111-1111-1111-1111-111111111101'::uuid,
    'Neon Drift – Urban Cinematic Reel',
    'Dynamic color graded cinematic cut with speed ramping, multi-angle pacing, glitch transitions, and cinematic sound design.',
    'CINEMATIC',
    'Cinematic Reels',
    '2024-10-15',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'video',
    true,
    true,
    1,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111102'::uuid,
    'Aura Sportswear – Commercial Ad',
    'High-octane advertisement cut showcasing apparel motion, synchronized beat drops, and bold typography animations.',
    'ADVERTISEMENT',
    'Advertisement Reels',
    '2024-11-02',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'video',
    true,
    true,
    2,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111103'::uuid,
    'Chrono Pulse – Product Promotion Showcase',
    'Luxury watch promo video featuring macro focus reveals, smooth 3D rotational transitions, and clean studio lighting enhancements.',
    'PROMOTIONAL',
    'Product Promotion Videos',
    '2024-09-20',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'video',
    true,
    true,
    3,
    false
  ),
  (
    '11111111-1111-1111-1111-111111111104'::uuid,
    'Velocity Beat – High Retention Social Reel',
    'Optimized vertical cut for Instagram Reels and YouTube Shorts featuring kinetic captions, audio hits, and fast hook framing.',
    'SOCIAL MEDIA',
    'Instagram Reels',
    '2024-11-10',
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    'video',
    true,
    true,
    4,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111105'::uuid,
    'Cyber Mirage – Visual Effects & Motion Graphics',
    'Created with After Effects: holographic UI HUD elements, seamless whip pans, and chromatic aberration effects.',
    'CINEMATIC',
    'Basic Motion Graphics',
    '2024-08-18',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=900&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'video',
    true,
    true,
    5,
    false
  ),
  (
    '11111111-1111-1111-1111-111111111106'::uuid,
    'Lumina Fragrance – Elegance Commercial Spot',
    'Color graded commercial edit highlighting slow-motion liquid dynamics, atmospheric lighting, and pristine audio mixing.',
    'ADVERTISEMENT',
    'Social Media Advertisement',
    '2024-10-28',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'video',
    true,
    true,
    6,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- 3. SEED INITIAL PROJECT MEDIA
INSERT INTO public.project_media (
  project_id,
  media_type,
  file_name,
  file_url,
  thumbnail_url
)
VALUES
  (
    '11111111-1111-1111-1111-111111111101'::uuid,
    'video',
    'ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
  ),
  (
    '11111111-1111-1111-1111-111111111102'::uuid,
    'video',
    'ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80'
  )
ON CONFLICT DO NOTHING;

-- 4. SEED INITIAL SOCIAL LINKS
INSERT INTO public.social_links (id, platform, profile_url, label, username, is_active)
VALUES
  ('22222222-2222-2222-2222-222222222201'::uuid, 'whatsapp', 'https://wa.me/919585268336?text=Hi%20Bharath,%20I%20saw%20your%20Video%20Editing%20portfolio%20and%20would%20love%20to%20collaborate!', 'WhatsApp', '+91 9585268336', true),
  ('22222222-2222-2222-2222-222222222202'::uuid, 'email', 'mailto:sbarath1605@gmail.com', 'Email', 'sbarath1605@gmail.com', true),
  ('22222222-2222-2222-2222-222222222203'::uuid, 'linkedin', 'https://www.linkedin.com/in/bharath-s-editor', 'LinkedIn', 'bharath-s-editor', true),
  ('22222222-2222-2222-2222-222222222204'::uuid, 'instagram', 'https://www.instagram.com/bharaths.edits', 'Instagram', '@bharaths.edits', true),
  ('22222222-2222-2222-2222-222222222205'::uuid, 'youtube', 'https://www.youtube.com/@BharathSEdits', 'YouTube', 'Bharath S Edits', true),
  ('22222222-2222-2222-2222-222222222206'::uuid, 'github', 'https://github.com/bharath-s', 'GitHub', 'bharath-s', true)
ON CONFLICT (id) DO UPDATE SET
  profile_url = EXCLUDED.profile_url,
  username = EXCLUDED.username,
  is_active = EXCLUDED.is_active;

-- 5. SEED INITIAL RESUME
INSERT INTO public.resumes (
  id,
  file_name,
  file_url,
  file_size,
  is_published
)
VALUES (
  '33333333-3333-3333-3333-333333333301'::uuid,
  'BHARATH_S_Video_Editor_Resume.pdf',
  '/resumes/BHARATH_S_Video_Editor_Resume.pdf',
  '420 KB',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED WEBSITE SETTINGS
INSERT INTO public.website_settings (
  id,
  use_supabase,
  connected
)
VALUES (
  'primary_settings',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;
