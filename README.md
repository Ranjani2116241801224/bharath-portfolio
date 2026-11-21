# BHARATH S – Premium 3D Space Galaxy Portfolio

A futuristic, cinematic personal portfolio for **BHARATH S – Junior Video Editor & Creative Visual Storyteller**, built with React, TypeScript, Tailwind CSS, Three.js WebGL galaxy simulation, and Supabase database / cloud storage integration.

---

## 🌌 Key Highlights

- **Realistic 3D Blue Galaxy & Nebula Background:**
  - Procedural Three.js WebGL galaxy with electric-blue & deep navy nebula clouds (`#02040A`, `#030B1C`, `#071A35`, `#0879D1`, `#168BFF`, `#27DFFF`).
  - 3,800+ realistic twinkling stars with dynamic luminosity oscillation.
  - Interactive mouse parallax & scroll depth translation with automatic mobile GPU optimization and reduced-motion fallback.
  - No planets, spaceships, or cartoon graphics — authentic astronomical depth.
- **Complete Full-Stack Application:**
  - Public portfolio + Secure Admin Dashboard with authentication.
  - Profile photo management (instant synchronization across Hero, About, and cards).
  - Multi-photo & video project uploading (MP4, WebM, JPG, PNG, WebP) with live preview and category filters (`CINEMATIC`, `ADVERTISEMENT`, `PROMOTIONAL`, `SOCIAL MEDIA`).
  - Resume view & download with PDF replacement in Admin Dashboard.
  - Contact form with validation, success notifications, and real database persistence.
  - Floating WhatsApp chat link (`+91 9585268336`).
  - Direct Supabase PostgreSQL & Storage support with built-in instant local storage fallback.

---

## 🚀 Getting Started

### 1. Installation & Local Development

```bash
# Clone or open project directory
cd d:\bbbb

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔐 Admin Dashboard Access

- Click the **Shield Icon** in the navigation bar or footer **Admin Portal** link.
- **Default Login Credentials:**
  - **Email:** `admin@bharaths.com` (or `sbarath1605@gmail.com`)
  - **Password:** `Bharath@2026`

From the Admin Dashboard, you can:
1. **Overview:** View published/draft projects, media assets, and incoming inquiries.
2. **Profile Management:** Update bio, name, tagline, titles, and upload your profile photo.
3. **Project Management:** Upload new video/photo projects, edit descriptions, change categories, reorder, or publish/unpublish.
4. **Media Management:** View all photo & video assets.
5. **Resume Management:** Upload and publish your latest official PDF resume.
6. **Social Media Management:** Update your LinkedIn, WhatsApp, YouTube, Instagram, and GitHub URLs.
7. **Contact Messages:** View and manage client messages received through the contact form.
8. **Website Settings:** Enter your Supabase URL & Anon Key, test the connection, and view the SQL schema.

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

To connect your own Supabase project:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Go to the **SQL Editor** and paste the contents of `supabase_schema.sql` (located in the project root). Run the script to generate:
   - `profile_info`
   - `portfolio_projects`
   - `resume_files`
   - `social_links`
   - `contact_messages`
   - `website_settings`
   - Storage buckets: `portfolio-media` & `resumes`
3. Enter your **Project URL** and **Anon Key** in **Website Settings** in the Admin Dashboard, or set them in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Click **Test Supabase Connection** and **Save Settings**.

---

## 📦 Production Build & Deployment

```bash
# Production bundle
npm run build

# Preview build locally
npm run preview
```

Deployable directly to **Vercel**, **Netlify**, or any static hosting platform with zero configuration.
