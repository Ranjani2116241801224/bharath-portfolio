import {
  Profile,
  Project,
  ProjectMedia,
  ResumeData,
  SocialLink,
  ContactMessage,
  WebsiteSettings,
  TechnicalSkill
} from '../types';
import {
  initialProfile,
  initialProjects,
  initialResume,
  initialSocialLinks,
  initialSettings,
  initialSkills
} from '../data/initialData';
import { getSupabaseClient } from './supabaseClient';

export const PORTFOLIO_PROFILE_ID = '00000000-0000-0000-0000-000000000001';
export const ADMIN_AUTH_UUID = 'e2de21ab-3253-4692-a875-cd733ba3de4d';

const STORAGE_KEYS = {
  PROFILE: 'bharath_portfolio_profile',
  PROJECTS: 'bharath_portfolio_projects',
  RESUME: 'bharath_portfolio_resume',
  SOCIAL_LINKS: 'bharath_portfolio_social_links',
  SKILLS: 'bharath_portfolio_skills',
  MESSAGES: 'bharath_portfolio_messages',
  SETTINGS: 'bharath_portfolio_settings',
  LAST_MESSAGE_TIME: 'bharath_last_msg_timestamp'
};

// Generate standard RFC4122 UUID
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Ensure valid UUID format for PostgreSQL UUID primary keys
function ensureUUID(id?: string): string {
  if (!id) return generateUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  return generateUUID();
}

// Initialize LocalStorage defaults if not present (acts as offline cache)
function initializeLocalStore() {
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialProfile));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESUME)) {
    localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(initialResume));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS)) {
    localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(initialSocialLinks));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
  }
}

initializeLocalStore();

export const StorageService = {
  // ============================================================================
  // 1. PROFILE MANAGEMENT
  // ============================================================================
  async getProfile(): Promise<Profile> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // 1. Query canonical profiles table
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
          .maybeSingle();

        // 2. If profiles table has no rows or table does not exist, try legacy profile_info
        if (!data || error) {
          const { data: legacyData, error: legacyErr } = await supabase
            .from('profile_info')
            .select('*')
            .limit(1)
            .maybeSingle();
          if (legacyData && !legacyErr) {
            data = legacyData;
            error = null;
          }
        }

        if (data && !error) {
          const profile: Profile = {
            id: data.id,
            name: data.full_name || data.name || initialProfile.name,
            title: data.professional_title || data.title || initialProfile.title,
            smallHeading: data.small_heading || initialProfile.smallHeading,
            tagline: data.tagline || initialProfile.tagline,
            bio: data.description || data.bio || initialProfile.bio,
            profileImage: data.profile_image_url || data.profile_image || initialProfile.profileImage,
            location: data.location || initialProfile.location,
            phone: data.phone || initialProfile.phone,
            email: data.email || initialProfile.email,
            vision: data.vision || initialProfile.vision
          };
          // Sync with local cache
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
          return profile;
        }
      } catch (err) {
        console.warn('Supabase profiles fetch failed, attempting fallback to local store:', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : initialProfile;
  },

  async updateProfile(profile: Profile): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Local/offline mode
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      window.dispatchEvent(new Event('portfolio_profile_updated'));
      return true;
    }

    try {
      // 1. Verify that an active Supabase Auth session exists
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;
      const currentUser = currentSession?.user;

      if (!currentSession || !currentUser) {
        throw new Error(
          'Supabase Auth session not found. You are not logged in with an active Supabase session. Please sign in with administrator credentials (sbarath1605@gmail.com) to save changes to the database.'
        );
      }

      // 2. Determine target row ID: Query existing profile row in Supabase
      const { data: existingRows } = await supabase
        .from('profiles')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1);

      let targetId: string;
      const existingRow = existingRows && existingRows.length > 0 ? existingRows[0] : null;

      if (existingRow?.id) {
        targetId = existingRow.id;
      } else if (profile.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.id)) {
        targetId = profile.id;
      } else {
        targetId = '00000000-0000-0000-0000-000000000001';
      }

      profile.id = targetId;

      // 3. Prepare full payload (canonical + extended compatibility fields)
      const fullPayload: Record<string, any> = {
        full_name: profile.name,
        professional_title: profile.title,
        description: profile.bio,
        profile_image_url: profile.profileImage,
        location: profile.location,
        phone: profile.phone,
        email: profile.email,
        small_heading: profile.smallHeading,
        tagline: profile.tagline,
        bio: profile.bio,
        vision: profile.vision,
        updated_at: new Date().toISOString()
      };

      // Canonical payload with ONLY the 8 Step 1 schema columns
      const canonicalPayload: Record<string, any> = {
        full_name: profile.name,
        professional_title: profile.title,
        description: profile.bio,
        profile_image_url: profile.profileImage,
        location: profile.location,
        phone: profile.phone,
        email: profile.email,
        updated_at: new Date().toISOString()
      };

      let opError: any = null;

      if (existingRow) {
        // UPDATE existing row
        let { error } = await supabase
          .from('profiles')
          .update(fullPayload)
          .eq('id', targetId);

        // If error is missing column (PGRST204)
        if (error && (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache'))) {
          const retry = await supabase
            .from('profiles')
            .update(canonicalPayload)
            .eq('id', targetId);
          error = retry.error;
        }
        opError = error;
      } else {
        // INSERT new row
        let { error } = await supabase
          .from('profiles')
          .insert({ id: targetId, ...fullPayload });

        // If error is missing column (PGRST204)
        if (error && (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache'))) {
          const retry = await supabase
            .from('profiles')
            .insert({ id: targetId, ...canonicalPayload });
          error = retry.error;
        }
        opError = error;
      }

      // 4. Fallback: If table 'profiles' does not exist, try legacy 'profile_info'
      if (opError && (opError.code === '42P01' || opError.message?.includes('relation "profiles" does not exist') || opError.message?.includes('profile_info'))) {
        const legacyPayload = {
          id: 'bharath_profile',
          name: profile.name,
          title: profile.title,
          small_heading: profile.smallHeading,
          tagline: profile.tagline,
          bio: profile.bio,
          profile_image: profile.profileImage,
          location: profile.location,
          phone: profile.phone,
          email: profile.email,
          vision: profile.vision,
          updated_at: new Date().toISOString()
        };
        const legacyRes = await supabase.from('profile_info').upsert(legacyPayload);
        opError = legacyRes.error;
      }

      // 5. Check if operation failed
      if (opError) {
        console.error('Supabase profile update error:', opError);
        const code = opError.code ? `[Code: ${opError.code}] ` : '';
        const details = opError.details ? ` Details: ${opError.details}` : '';
        const hint = opError.hint ? ` Hint: ${opError.hint}` : '';
        const message = opError.message || 'Database update failed';
        
        let errorMsg = `${code}${message}${details}${hint}`;
        if (opError.code === '42501' || opError.message?.includes('policy') || opError.message?.includes('row-level security') || opError.message?.includes('permission denied')) {
          errorMsg = `Database permission denied (RLS) [Code: ${opError.code || '42501'}]: ${opError.message}.${details} (User: ${currentUser?.email || 'Unknown'}). Please verify your account is registered as admin in Supabase and the latest RLS policies are applied.`;
        }
        throw new Error(errorMsg);
      }

      // 6. Save updated ID to localStorage cache
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      window.dispatchEvent(new Event('portfolio_profile_updated'));
      return true;
    } catch (err: any) {
      console.error('StorageService.updateProfile exception:', err);
      throw err;
    }
  },

  // ============================================================================
  // 2. PROJECT MANAGEMENT (Photos & Videos)
  // ============================================================================
  async getProjects(): Promise<Project[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_media (*)
          `)
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        if (!error && Array.isArray(data)) {
          const mapped: Project[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            subCategory: item.sub_category || item.category,
            completionDate: item.completion_date || '',
            thumbnail: item.thumbnail_url || item.thumbnail || '',
            videoUrl: item.video_url || undefined,
            mediaType: item.media_type || (item.video_url ? 'video' : 'photo'),
            isPublished: item.is_published,
            isDemo: item.is_demo ?? false,
            sortOrder: item.display_order ?? item.sort_order ?? 0,
            featured: item.featured ?? false,
            createdAt: item.created_at,
            mediaFiles: item.project_media?.map((m: any) => ({
              id: m.id,
              url: m.file_url,
              type: m.media_type,
              name: m.file_name
            })) || []
          }));
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase projects fetch error, fallback to local', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const allProjects: Project[] = raw ? JSON.parse(raw) : initialProjects;
    return allProjects.filter(p => p.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getAllProjectsAdmin(): Promise<Project[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_media (*)
          `)
          .order('display_order', { ascending: true });

        if (!error && Array.isArray(data)) {
          const mapped: Project[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            subCategory: item.sub_category || item.category,
            completionDate: item.completion_date || '',
            thumbnail: item.thumbnail_url || item.thumbnail || '',
            videoUrl: item.video_url || undefined,
            mediaType: item.media_type || (item.video_url ? 'video' : 'photo'),
            isPublished: item.is_published,
            isDemo: item.is_demo ?? false,
            sortOrder: item.display_order ?? item.sort_order ?? 0,
            featured: item.featured ?? false,
            createdAt: item.created_at,
            mediaFiles: item.project_media?.map((m: any) => ({
              id: m.id,
              url: m.file_url,
              type: m.media_type,
              name: m.file_name
            })) || []
          }));
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase admin projects fetch error, fallback to local', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const allProjects: Project[] = raw ? JSON.parse(raw) : initialProjects;
    return allProjects.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async saveProject(project: Project): Promise<Project> {
    const validUUID = ensureUUID(project.id);
    const updatedProject = { ...project, id: validUUID };

    // Update local store
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = raw ? JSON.parse(raw) : [...initialProjects];
    const index = projects.findIndex(p => p.id === project.id || p.id === validUUID);
    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload = {
          id: validUUID,
          title: updatedProject.title,
          description: updatedProject.description,
          category: updatedProject.category,
          sub_category: updatedProject.subCategory || updatedProject.category,
          completion_date: updatedProject.completionDate,
          thumbnail_url: updatedProject.thumbnail,
          video_url: updatedProject.videoUrl || null,
          media_type: updatedProject.mediaType,
          is_published: updatedProject.isPublished,
          is_demo: updatedProject.isDemo,
          display_order: updatedProject.sortOrder,
          featured: updatedProject.featured ?? false,
          updated_at: new Date().toISOString()
        };

        const { error: projectError } = await supabase.from('projects').upsert(payload);
        if (projectError) console.error('Supabase project upsert error:', projectError);

        // Sync project_media table
        if (updatedProject.mediaFiles && updatedProject.mediaFiles.length > 0) {
          const mediaPayloads = updatedProject.mediaFiles.map(m => ({
            id: ensureUUID(m.id),
            project_id: validUUID,
            media_type: m.type,
            file_name: m.name || updatedProject.title,
            file_url: m.url,
            thumbnail_url: updatedProject.thumbnail
          }));
          await supabase.from('project_media').upsert(mediaPayloads);
        } else if (updatedProject.thumbnail) {
          // Auto-insert thumbnail as media record
          await supabase.from('project_media').upsert({
            id: ensureUUID(),
            project_id: validUUID,
            media_type: updatedProject.mediaType,
            file_name: updatedProject.title,
            file_url: updatedProject.videoUrl || updatedProject.thumbnail,
            thumbnail_url: updatedProject.thumbnail
          });
        }
      } catch (err) {
        console.warn('Supabase save project error:', err);
      }
    }
    window.dispatchEvent(new Event('portfolio_projects_updated'));
    return updatedProject;
  },

  async deleteProject(id: string): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = raw ? JSON.parse(raw) : [];
    const targetProject = projects.find(p => p.id === id);
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Clean up storage media if files exist in Supabase Storage
        if (targetProject) {
          if (targetProject.thumbnail && targetProject.thumbnail.includes('supabase.co')) {
            await this.deleteFile(targetProject.thumbnail, 'photos');
          }
          if (targetProject.videoUrl && targetProject.videoUrl.includes('supabase.co')) {
            await this.deleteFile(targetProject.videoUrl, 'videos');
          }
        }

        // Delete from database (foreign key project_media cascades automatically)
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete project error:', err);
      }
    }
    window.dispatchEvent(new Event('portfolio_projects_updated'));
    return true;
  },

  async togglePublishProject(id: string, isPublished: boolean): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = raw ? JSON.parse(raw) : [];
    const target = projects.find(p => p.id === id);
    if (target) {
      target.isPublished = isPublished;
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('projects').update({ is_published: isPublished }).eq('id', id);
        } catch (err) {
          console.warn('Supabase toggle publish error:', err);
        }
      }
      window.dispatchEvent(new Event('portfolio_projects_updated'));
      return true;
    }
    return false;
  },

  // ============================================================================
  // 3. RESUME MANAGEMENT
  // ============================================================================
  async getResume(): Promise<ResumeData> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('is_published', true)
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const res: ResumeData = {
            id: data.id,
            fileName: data.file_name,
            fileUrl: data.file_url,
            uploadDate: data.uploaded_at ? new Date(data.uploaded_at).toISOString().split('T')[0] : '',
            fileSize: data.file_size || 'Unknown',
            isPublished: data.is_published
          };
          localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(res));
          return res;
        }
      } catch (err) {
        console.warn('Supabase resume fetch error, fallback to local', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.RESUME);
    return raw ? JSON.parse(raw) : initialResume;
  },

  async updateResume(resume: ResumeData): Promise<boolean> {
    const validUUID = ensureUUID(resume.id);
    const updated = { ...resume, id: validUUID };
    localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(updated));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload = {
          id: validUUID,
          file_name: updated.fileName,
          file_url: updated.fileUrl,
          file_size: updated.fileSize,
          is_published: updated.isPublished,
          uploaded_at: new Date().toISOString()
        };
        await supabase.from('resumes').upsert(payload);
      } catch (err) {
        console.warn('Supabase resume upsert error:', err);
      }
    }
    window.dispatchEvent(new Event('portfolio_resume_updated'));
    return true;
  },

  // ============================================================================
  // 4. SOCIAL MEDIA MANAGEMENT
  // ============================================================================
  async getSocialLinks(): Promise<SocialLink[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('social_links')
          .select('*')
          .order('created_at', { ascending: true });

        if (data && !error && data.length > 0) {
          const mapped: SocialLink[] = data.map((s: any) => ({
            id: s.id,
            platform: s.platform,
            label: s.label || s.platform,
            url: s.profile_url || s.url,
            username: s.username || '',
            isActive: s.is_active ?? true
          }));
          localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase social links error, fallback to local', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS);
    return raw ? JSON.parse(raw) : initialSocialLinks;
  },

  async updateSocialLinks(links: SocialLink[]): Promise<boolean> {
    localStorage.setItem(STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(links));
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payloads = links.map(l => ({
          id: ensureUUID(l.id),
          platform: l.platform,
          profile_url: l.url,
          label: l.label,
          username: l.username,
          is_active: l.isActive,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('social_links').upsert(payloads);
      } catch (err) {
        console.warn('Supabase social links update error:', err);
      }
    }
    window.dispatchEvent(new Event('portfolio_social_updated'));
    return true;
  },

  // ============================================================================
  // 5. CONTACT MESSAGES (with anti-spam & rate limiting)
  // ============================================================================
  async getContactMessages(): Promise<ContactMessage[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          const mapped: ContactMessage[] = data.map((m: any) => ({
            id: m.id,
            name: m.sender_name || m.name,
            email: m.sender_email || m.email,
            subject: m.subject,
            message: m.message,
            date: m.created_at || m.date,
            isRead: m.is_read ?? false
          }));
          localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase contact messages fetch error, fallback to local', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return raw ? JSON.parse(raw) : [];
  },

  async submitContactMessage(msg: Omit<ContactMessage, 'id' | 'date' | 'isRead'>): Promise<ContactMessage> {
    // Spam protection: Minimum 5-second interval between submissions from same client
    const lastTime = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_MESSAGE_TIME) || '0', 10);
    const now = Date.now();
    if (now - lastTime < 5000) {
      throw new Error('Please wait a moment before sending another message.');
    }
    localStorage.setItem(STORAGE_KEYS.LAST_MESSAGE_TIME, now.toString());

    const messageId = generateUUID();
    const newMsg: ContactMessage = {
      ...msg,
      id: messageId,
      date: new Date().toISOString(),
      isRead: false
    };

    // Save locally
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: ContactMessage[] = raw ? JSON.parse(raw) : [];
    messages.unshift(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload = {
          id: messageId,
          sender_name: msg.name.trim(),
          sender_email: msg.email.trim(),
          subject: msg.subject.trim(),
          message: msg.message.trim(),
          is_read: false,
          created_at: new Date().toISOString()
        };
        const { error } = await supabase.from('contact_messages').insert(payload);
        if (error) console.error('Supabase contact message insert error:', error);
      } catch (err) {
        console.warn('Supabase message insert error:', err);
      }
    }
    window.dispatchEvent(new Event('portfolio_messages_updated'));
    return newMsg;
  },

  async markMessageRead(id: string): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: ContactMessage[] = raw ? JSON.parse(raw) : [];
    const target = messages.find(m => m.id === id);
    if (target) {
      target.isRead = true;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
        } catch (err) {
          console.warn('Supabase mark message read error:', err);
        }
      }
      window.dispatchEvent(new Event('portfolio_messages_updated'));
      return true;
    }
    return false;
  },

  async deleteContactMessage(id: string): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: ContactMessage[] = raw ? JSON.parse(raw) : [];
    const filtered = messages.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filtered));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('contact_messages').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete message error:', err);
      }
    }
    window.dispatchEvent(new Event('portfolio_messages_updated'));
    return true;
  },

  // ============================================================================
  // 6. WEBSITE SETTINGS
  // ============================================================================
  async getSettings(): Promise<WebsiteSettings> {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : initialSettings;
  },

  async updateSettings(settings: WebsiteSettings): Promise<boolean> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.supabaseUrl) {
      localStorage.setItem('bharath_supabase_url', settings.supabaseUrl);
    }
    if (settings.supabaseAnonKey) {
      localStorage.setItem('bharath_supabase_anon_key', settings.supabaseAnonKey);
    }
    window.dispatchEvent(new Event('portfolio_settings_updated'));
    return true;
  },

  // ============================================================================
  // 7. SUPABASE STORAGE (portfolio-photos, portfolio-videos, portfolio-resumes)
  // ============================================================================
  async uploadFile(file: File, folder: 'photos' | 'videos' | 'resumes' = 'photos'): Promise<{ url: string; size: string; name: string }> {
    const supabase = getSupabaseClient();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${Date.now()}_${cleanFileName}`;
    const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // Map to dedicated buckets
    const bucketMap: Record<string, string> = {
      photos: 'portfolio-photos',
      videos: 'portfolio-videos',
      resumes: 'portfolio-resumes'
    };
    const primaryBucket = bucketMap[folder] || 'portfolio-photos';

    if (supabase) {
      try {
        // Try uploading to primary dedicated bucket
        const { error: uploadError } = await supabase.storage
          .from(primaryBucket)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from(primaryBucket)
            .getPublicUrl(storagePath);

          if (publicData?.publicUrl) {
            return { url: publicData.publicUrl, size: fileSizeStr, name: file.name };
          }
        } else {
          // Fallback to legacy bucket if primary bucket is not yet created
          const fallbackBucket = folder === 'resumes' ? 'resumes' : 'portfolio-media';
          const { error: fallbackError } = await supabase.storage
            .from(fallbackBucket)
            .upload(`${folder}/${storagePath}`, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (!fallbackError) {
            const { data: fallbackData } = supabase.storage
              .from(fallbackBucket)
              .getPublicUrl(`${folder}/${storagePath}`);
            if (fallbackData?.publicUrl) {
              return { url: fallbackData.publicUrl, size: fileSizeStr, name: file.name };
            }
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, converting to local preview URL', err);
      }
    }

    // High-performance fallback: FileReader Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          size: fileSizeStr,
          name: file.name
        });
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },

  async deleteFile(fileUrl: string, folder: 'photos' | 'videos' | 'resumes' = 'photos'): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase && fileUrl && fileUrl.includes('supabase.co')) {
      try {
        const bucketMap: Record<string, string> = {
          photos: 'portfolio-photos',
          videos: 'portfolio-videos',
          resumes: 'portfolio-resumes'
        };
        const primaryBucket = bucketMap[folder] || 'portfolio-photos';
        
        // Extract filename from public URL
        const urlParts = fileUrl.split(`${primaryBucket}/`);
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
          await supabase.storage.from(primaryBucket).remove([filePath]);
          return true;
        }

        // Check fallback bucket
        const fallbackBucket = folder === 'resumes' ? 'resumes' : 'portfolio-media';
        const fallbackParts = fileUrl.split(`${fallbackBucket}/`);
        if (fallbackParts.length > 1) {
          const filePath = decodeURIComponent(fallbackParts[1].split('?')[0]);
          await supabase.storage.from(fallbackBucket).remove([filePath]);
          return true;
        }
      } catch (err) {
        console.warn('Failed to delete file from Supabase storage', err);
      }
    }
    return true;
  },

  // ============================================================================
  // 8. ADMIN AUTHENTICATION & SECURITY
  // ============================================================================
  async verifyAdminCredentials(email: string, pass: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();

    // 1. Primary: Verify via Supabase Authentication
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass
        });

        if (!error && data?.session && data.user) {
          // Check admin_profiles table to verify user holds the admin role
          const { data: adminProfile } = await supabase
            .from('admin_profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          // If admin_profiles record exists with role 'admin' or if authorized admin email
          const isAuthorizedEmail = cleanEmail === 'sbarath1605@gmail.com' || cleanEmail === 'admin@bharaths.com';
          if (adminProfile?.role === 'admin' || adminProfile?.role === 'super_admin' || isAuthorizedEmail) {
            localStorage.setItem('bharath_admin_auth', 'true');
            localStorage.setItem('bharath_auth_token', data.session.access_token);
            return true;
          } else {
            // User signed in but is not an authorized portfolio administrator
            await supabase.auth.signOut();
            return false;
          }
        }
      } catch {
        // Fall through to authorized fallback if Supabase Auth is unconfigured
      }
    }

    // 2. Secondary fallback for initial setup / offline administration
    const storedPass = localStorage.getItem('bharath_custom_admin_pass');
    const storedEmail = localStorage.getItem('bharath_custom_admin_email');

    if (storedPass && storedEmail) {
      if (cleanEmail === storedEmail.toLowerCase() && pass === storedPass) {
        localStorage.setItem('bharath_admin_auth', 'true');
        return true;
      }
    }

    const isAuthorizedEmail = cleanEmail === 'sbarath1605@gmail.com' || cleanEmail === 'admin@bharaths.com';
    const isAuthorizedPass = pass === (storedPass || 'Bharath@2026');

    if (isAuthorizedEmail && isAuthorizedPass) {
      localStorage.setItem('bharath_admin_auth', 'true');
      return true;
    }

    return false;
  },

  async changeAdminPassword(newPassword: string): Promise<boolean> {
    localStorage.setItem('bharath_custom_admin_pass', newPassword);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (err) {
        console.warn('Supabase auth password update error:', err);
      }
    }
    return true;
  },

  async adminLogout(): Promise<void> {
    localStorage.removeItem('bharath_admin_auth');
    localStorage.removeItem('bharath_auth_token');
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignored
      }
    }
  },

  async getPhotos(): Promise<Project[]> {
    const all = await this.getAllProjectsAdmin();
    return all.filter(p => p.mediaType === 'photo' || !p.videoUrl);
  },

  async getVideos(): Promise<Project[]> {
    const all = await this.getAllProjectsAdmin();
    return all.filter(p => p.mediaType === 'video' || (p.videoUrl && p.videoUrl.length > 0));
  },

  // ============================================================================
  // 7. TECHNICAL SKILLS MANAGEMENT
  // ============================================================================
  async getSkills(): Promise<TechnicalSkill[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('display_order', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: TechnicalSkill[] = data.map((s: any) => ({
            id: s.id,
            software: s.software,
            category: s.category,
            description: s.description,
            iconName: s.icon_name || 'Scissors',
            topics: Array.isArray(s.topics) ? s.topics : []
          }));
          localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase skills fetch error, fallback to cache:', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
    return raw ? JSON.parse(raw) : initialSkills;
  },

  async saveSkill(skill: TechnicalSkill): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
    const skills: TechnicalSkill[] = raw ? JSON.parse(raw) : [...initialSkills];
    const idx = skills.findIndex(s => s.id === skill.id);
    if (idx >= 0) {
      skills[idx] = skill;
    } else {
      skills.push(skill);
    }
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('skills').upsert({
          id: skill.id,
          software: skill.software,
          category: skill.category,
          description: skill.description,
          icon_name: skill.iconName,
          topics: skill.topics,
          updated_at: new Date().toISOString()
        });
        if (error) console.error('Supabase skill upsert error:', error);
      } catch (err) {
        console.warn('Supabase save skill error:', err);
      }
    }
    window.dispatchEvent(new Event('portfolio_skills_updated'));
    return true;
  },

  async deleteSkill(id: string): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
    const skills: TechnicalSkill[] = raw ? JSON.parse(raw) : [...initialSkills];
    const filtered = skills.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(filtered));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('skills').delete().eq('id', id);
        if (error) console.error('Supabase skill delete error:', error);
      } catch (err) {
        console.warn('Supabase delete skill error:', err);
      }
    }
    window.dispatchEvent(new Event('portfolio_skills_updated'));
    return true;
  },

  // ============================================================================
  // 8. SUPABASE REALTIME SUBSCRIPTION
  // ============================================================================
  subscribeToRealtime(onUpdate: (table: string) => void): (() => void) | null {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const channel = supabase
        .channel('portfolio_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => onUpdate('profiles')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          () => onUpdate('projects')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'project_media' },
          () => onUpdate('project_media')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'social_links' },
          () => onUpdate('social_links')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'resumes' },
          () => onUpdate('resumes')
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'skills' },
          () => onUpdate('skills')
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Supabase Realtime subscription error:', err);
      return null;
    }
  }
};
