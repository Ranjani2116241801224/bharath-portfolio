import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Film,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Share2,
  Mail,
  Settings,
  LogOut,
  X,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  RefreshCw,
  Search,
  Check,
  Loader2,
  Wrench
} from 'lucide-react';
import {
  Profile,
  Project,
  ResumeData,
  SocialLink,
  ContactMessage,
  WebsiteSettings,
  TechnicalSkill
} from '../../types';
import { StorageService } from '../../services/storageService';
import { testSupabaseConnection, getSupabaseClient } from '../../services/supabaseClient';
import { ProjectEditorModal } from './ProjectEditorModal';
import { PhotoManager } from './PhotoManager';
import { VideoManager } from './VideoManager';

interface AdminDashboardProps {
  onClose: () => void;
  onLogout: () => void;
}

type TabType =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'photos'
  | 'videos'
  | 'resume'
  | 'skills'
  | 'social'
  | 'messages'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Data states
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [skills, setSkills] = useState<TechnicalSkill[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  // UI helpers
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false);
  const [skillForm, setSkillForm] = useState<{ id?: string; software: string; category: string; description: string; iconName: string; topicsStr: string }>({
    software: '',
    category: '',
    description: '',
    iconName: 'Cpu',
    topicsStr: ''
  });
  const [saveAlert, setSaveAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success?: boolean; message?: string }>({});
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [passError, setPassError] = useState('');
  const [supabaseSession, setSupabaseSession] = useState<{ email?: string } | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Load all initial data
  const loadData = async () => {
    const p = await StorageService.getProfile();
    const pr = await StorageService.getAllProjectsAdmin();
    const r = await StorageService.getResume();
    const sk = await StorageService.getSkills();
    const s = await StorageService.getSocialLinks();
    const m = await StorageService.getContactMessages();
    const st = await StorageService.getSettings();

    setProfile(p);
    setProjects(pr);
    setResume(r);
    setSkills(sk);
    setSocialLinks(s);
    setMessages(m);
    setSettings(st);
  };

  useEffect(() => {
    loadData();

    // Verify Supabase Auth session status
    const checkSession = async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            setSupabaseSession({ email: data.session.user.email });
          } else {
            setSupabaseSession(null);
          }
        } catch {
          setSupabaseSession(null);
        }
      }
      setSessionChecked(true);
    };
    checkSession();

    const handleUpdate = () => loadData();
    window.addEventListener('portfolio_profile_updated', handleUpdate);
    window.addEventListener('portfolio_projects_updated', handleUpdate);
    window.addEventListener('portfolio_resume_updated', handleUpdate);
    window.addEventListener('portfolio_skills_updated', handleUpdate);
    window.addEventListener('portfolio_messages_updated', handleUpdate);

    return () => {
      window.removeEventListener('portfolio_profile_updated', handleUpdate);
      window.removeEventListener('portfolio_projects_updated', handleUpdate);
      window.removeEventListener('portfolio_resume_updated', handleUpdate);
      window.removeEventListener('portfolio_skills_updated', handleUpdate);
      window.removeEventListener('portfolio_messages_updated', handleUpdate);
    };
  }, []);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setSaveAlert({ message, type });
    const duration = type === 'error' ? 8000 : 4000;
    setTimeout(() => setSaveAlert(null), duration);
  };

  // PROFILE HANDLERS
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSavingProfile(true);
    try {
      await StorageService.updateProfile(profile);
      showAlert('Profile details updated and saved to Supabase successfully!', 'success');
      await loadData();
    } catch (err: any) {
      console.error('Profile save error:', err);
      showAlert(err.message || 'Error updating profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const res = await StorageService.uploadFile(file, 'photos');
      const updated = { ...profile, profileImage: res.url };
      setProfile(updated);
      await StorageService.updateProfile(updated);
      showAlert('Profile photo updated successfully!', 'success');
      await loadData();
    } catch (err: any) {
      console.error(err);
      showAlert(err.message || 'Error uploading profile picture.', 'error');
    }
  };

  // PROJECT HANDLERS
  const handleSaveProject = async (p: Project) => {
    await StorageService.saveProject(p);
    setIsEditorOpen(false);
    setEditingProject(null);
    showAlert('Project saved and synced successfully!');
    loadData();
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await StorageService.deleteProject(id);
      showAlert('Project deleted successfully.');
      loadData();
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    await StorageService.togglePublishProject(id, !current);
    showAlert(`Project ${!current ? 'published' : 'unpublished'}.`);
    loadData();
  };

  // RESUME HANDLERS
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !resume) return;
    try {
      const res = await StorageService.uploadFile(file, 'resumes');
      const updated: ResumeData = {
        ...resume,
        fileName: res.name,
        fileUrl: res.url,
        fileSize: res.size,
        uploadDate: new Date().toISOString().split('T')[0],
        isPublished: true
      };
      setResume(updated);
      await StorageService.updateResume(updated);
      showAlert('New resume document uploaded and published!');
    } catch (err) {
      console.error(err);
      showAlert('Error uploading resume PDF.');
    }
  };

  // SKILLS HANDLERS
  const handleOpenSkillEditor = (skill?: TechnicalSkill) => {
    if (skill) {
      setSkillForm({
        id: skill.id,
        software: skill.software,
        category: skill.category,
        description: skill.description,
        iconName: skill.iconName || 'Cpu',
        topicsStr: skill.topics ? skill.topics.join(', ') : ''
      });
    } else {
      setSkillForm({
        software: '',
        category: 'Color Grading & Editing',
        description: '',
        iconName: 'Cpu',
        topicsStr: ''
      });
    }
    setIsSkillEditorOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.software.trim()) {
      showAlert('Skill name / software is required', 'error');
      return;
    }
    const topics = skillForm.topicsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const skillToSave: TechnicalSkill = {
      id: skillForm.id || `skill_${Date.now()}`,
      software: skillForm.software.trim(),
      category: skillForm.category.trim() || 'Software & Tools',
      description: skillForm.description.trim(),
      iconName: skillForm.iconName.trim() || 'Cpu',
      topics
    };

    await StorageService.saveSkill(skillToSave);
    setIsSkillEditorOpen(false);
    showAlert('Technical skill updated and synced successfully!');
    loadData();
  };

  const handleDeleteSkill = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this technical skill?')) {
      await StorageService.deleteSkill(id);
      showAlert('Technical skill deleted.');
      loadData();
    }
  };

  // SOCIAL LINKS HANDLERS
  const handleSocialSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await StorageService.updateSocialLinks(socialLinks);
    showAlert('Social media connections saved successfully!');
  };

  const updateSocialUrl = (id: string, url: string) => {
    setSocialLinks(prev => prev.map(item => item.id === id ? { ...item, url } : item));
  };

  // MESSAGE HANDLERS
  const handleMarkMessageRead = async (id: string) => {
    await StorageService.markMessageRead(id);
    loadData();
  };

  const handleDeleteMessage = async (id: string) => {
    await StorageService.deleteContactMessage(id);
    loadData();
    showAlert('Message removed.');
  };

  // SETTINGS & SUPABASE TEST
  const handleTestSupabase = async () => {
    if (!settings?.supabaseUrl || !settings?.supabaseAnonKey) {
      setConnectionResult({ success: false, message: 'Please provide both URL and Anon Key.' });
      return;
    }
    setTestingConnection(true);
    const res = await testSupabaseConnection(settings.supabaseUrl, settings.supabaseAnonKey);
    setConnectionResult(res);
    setTestingConnection(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await StorageService.updateSettings(settings);
    showAlert('Website settings & database credentials saved!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!newAdminPass || newAdminPass.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setPassError('Passwords do not match.');
      return;
    }
    await StorageService.changeAdminPassword(newAdminPass);
    setNewAdminPass('');
    setConfirmAdminPass('');
    showAlert('Administrator password successfully updated!');
  };

  // Counts
  const publishedCount = projects.filter(p => p.isPublished).length;
  const draftCount = projects.filter(p => !p.isPublished).length;
  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex bg-[#02040A] text-white overflow-hidden animate-fadeIn">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 sm:w-72 bg-[#030B1C] border-r border-[#168BFF]/25 flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center space-x-3 p-2 border-b border-[#168BFF]/20 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#168BFF] to-[#0879D1] flex items-center justify-center text-white shadow-[0_0_15px_rgba(22,139,255,0.4)]">
              <Shield className="w-5 h-5 text-[#27DFFF]" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide text-white">BHARATH S</div>
              <div className="text-[10px] uppercase font-semibold text-[#27DFFF]">Control Center</div>
              {sessionChecked && (
                <div className="mt-1 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${supabaseSession ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`} />
                  <span className="text-[10px] text-slate-300 truncate max-w-[130px]">
                    {supabaseSession ? (supabaseSession.email || 'Auth Active') : 'Offline Mode'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Management</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'projects'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Project Management</span>
            </button>

            <button
              onClick={() => {
                setEditingProject(null);
                setIsEditorOpen(true);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>+ Upload New Project</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'photos'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photo Management</span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'videos'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Management</span>
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'resume'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Resume Management</span>
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'skills'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Skills Management</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'social'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Social Media</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'messages'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4" />
                <span>Contact Messages</span>
              </div>
              {unreadMessagesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#27DFFF] text-[#02040A] text-[10px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#168BFF]/25 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.2)]'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#168BFF]/20 space-y-2">
          <button
            onClick={onClose}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#27DFFF] bg-[#168BFF]/15 hover:bg-[#168BFF]/25 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Website</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-[#02040A] p-6 sm:p-10 text-left">
        
        {/* Top Notification Toast */}
        {saveAlert && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 max-w-xl rounded-2xl border text-xs font-semibold flex items-start space-x-2.5 shadow-2xl animate-fadeIn ${
              saveAlert.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-rose-500/20 border-rose-400 text-rose-200'
            }`}
          >
            {saveAlert.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0 mt-0.5" />
            )}
            <span className="break-words flex-1 leading-relaxed">{saveAlert.message}</span>
            <button
              onClick={() => setSaveAlert(null)}
              className="ml-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Supabase Session Warning Banner */}
        {sessionChecked && !supabaseSession && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-300">Offline / No Active Supabase Auth Session</div>
                <div className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5">
                  You are logged into the local control panel, but there is no active Supabase Auth session. Changes will be cached locally, but direct Supabase database updates will be blocked by RLS policies until you sign in with your Supabase administrator credentials (<code className="bg-black/30 px-1 py-0.5 rounded text-[#27DFFF]">sbharath16052@gmail.com</code>).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Dashboard Overview
              </h2>
              <p className="text-xs text-slate-200 mt-1">
                Real-time metrics, project statuses, and incoming client inquiries.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl glass-panel border border-[#168BFF]/30">
                <div className="text-xs text-slate-200 uppercase font-bold">Published Projects</div>
                <div className="text-3xl font-extrabold text-[#27DFFF] mt-2">{publishedCount}</div>
              </div>
              <div className="p-5 rounded-2xl glass-panel border border-[#168BFF]/30">
                <div className="text-xs text-slate-200 uppercase font-bold">Draft Projects</div>
                <div className="text-3xl font-extrabold text-amber-400 mt-2">{draftCount}</div>
              </div>
              <div className="p-5 rounded-2xl glass-panel border border-[#168BFF]/30">
                <div className="text-xs text-slate-200 uppercase font-bold">Total Media Assets</div>
                <div className="text-3xl font-extrabold text-white mt-2">{projects.length * 2}</div>
              </div>
              <div className="p-5 rounded-2xl glass-panel border border-[#168BFF]/30">
                <div className="text-xs text-slate-200 uppercase font-bold">Contact Inquiries</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">{messages.length}</div>
              </div>
              <div className="p-5 rounded-2xl glass-panel border border-[#168BFF]/30">
                <div className="text-xs text-slate-200 uppercase font-bold">Unread Messages</div>
                <div className="text-3xl font-extrabold text-[#168BFF] mt-2">{unreadMessagesCount}</div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071A35] via-[#030B1C] to-[#02040A] border border-[#168BFF]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white">Ready to showcase fresh edits?</h4>
                <p className="text-xs text-slate-200 mt-0.5">
                  Upload new videos or photos anytime. Published content immediately renders on the public gallery.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsEditorOpen(true);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] shadow-[0_0_15px_rgba(22,139,255,0.4)] flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Project</span>
              </button>
            </div>

            {/* Recent Inquiries List */}
            <div className="glass-panel rounded-2xl p-6 border border-[#168BFF]/20 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-[#168BFF]/20 pb-3">
                Recent Contact Inquiries
              </h3>
              {messages.length === 0 ? (
                <div className="text-xs text-slate-200 py-4">No contact messages received yet.</div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 4).map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 rounded-xl bg-[#030B1C]/80 border border-[#168BFF]/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{msg.name} ({msg.email})</div>
                        <div className="text-xs text-[#27DFFF] mt-0.5 font-medium">{msg.subject}</div>
                        <div className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">{msg.message}</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="text-xs text-[#168BFF] hover:text-[#27DFFF] ml-4 flex-shrink-0"
                      >
                        View &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. PROFILE MANAGEMENT TAB */}
        {activeTab === 'profile' && profile && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-white">Profile Management</h2>
              <p className="text-xs text-slate-200 mt-1">
                Updates here immediately modify your Hero section, About section, and website metadata.
              </p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              {/* Profile Photo Upload & Preview Card */}
              <div className="glass-panel p-6 rounded-2xl border border-[#168BFF]/30 space-y-4">
                <div className="text-xs uppercase font-bold text-white tracking-wider">
                  Profile Picture
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#27DFFF] shadow-[0_0_20px_rgba(39,223,255,0.4)] flex-shrink-0">
                    <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#0879D1] text-xs font-semibold text-white">
                      <Upload className="w-4 h-4" />
                      <span>Upload New Picture</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleProfilePhotoUpload}
                      />
                    </label>
                    <p className="text-[11px] text-slate-200">
                      Supports JPG, JPEG, PNG, WebP. Updates avatar throughout the portfolio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Names & Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Professional Title</label>
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm"
                  />
                </div>
              </div>

              {/* Tagline & Small Heading */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Small Badge Heading</label>
                  <input
                    type="text"
                    value={profile.smallHeading}
                    onChange={(e) => setProfile({ ...profile, smallHeading: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Hero Tagline</label>
                  <input
                    type="text"
                    value={profile.tagline}
                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Phone</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm"
                  />
                </div>
              </div>

              {/* Bio / Summary */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-slate-200">Professional Summary</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm resize-none"
                />
              </div>

              {/* Career Vision */}
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-slate-200">Career Vision</label>
                <textarea
                  rows={2}
                  value={profile.vision}
                  onChange={(e) => setProfile({ ...profile, vision: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] shadow-[0_0_20px_rgba(22,139,255,0.4)] disabled:opacity-50 flex items-center space-x-2"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SAVING TO SUPABASE...</span>
                  </>
                ) : (
                  <span>SAVE PROFILE CHANGES</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 3. PROJECT MANAGEMENT TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Portfolio Projects</h2>
                <p className="text-xs text-slate-200 mt-1">
                  Manage, edit, reorder, or publish and unpublish video projects.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] shadow-[0_0_15px_rgba(22,139,255,0.4)]"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl glass-panel border border-[#168BFF]/25 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-[#071A35]">
                    <img src={proj.thumbnail} alt={proj.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex space-x-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#02040A]/80 text-[#27DFFF]">
                        {proj.category}
                      </span>
                      {proj.isDemo && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300">
                          Demo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{proj.title}</h4>
                      <p className="text-xs text-slate-200 line-clamp-2 mt-1">{proj.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#168BFF]/20 flex items-center justify-between">
                      <button
                        onClick={() => handleTogglePublish(proj.id, proj.isPublished)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          proj.isPublished
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {proj.isPublished ? 'Published' : 'Draft / Hidden'}
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingProject(proj);
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-[#168BFF]/20 text-slate-200 hover:text-[#27DFFF]"
                          title="Edit Project"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-200 hover:text-rose-400"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PHOTO MANAGEMENT (SEPARATE DEDICATED PAGE) */}
        {activeTab === 'photos' && (
          <PhotoManager
            projects={projects}
            onRefresh={loadData}
            onShowAlert={showAlert}
          />
        )}

        {/* 5. VIDEO MANAGEMENT (SEPARATE DEDICATED PAGE) */}
        {activeTab === 'videos' && (
          <VideoManager
            projects={projects}
            onRefresh={loadData}
            onShowAlert={showAlert}
          />
        )}

        {/* 6. RESUME MANAGEMENT TAB */}
        {activeTab === 'resume' && resume && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-white">Resume Management</h2>
              <p className="text-xs text-slate-200 mt-1">
                Upload and replace your official PDF resume. Visitors will download this updated file.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-[#168BFF]/30 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-[#168BFF]/20 border border-[#27DFFF]/40 flex items-center justify-center text-[#27DFFF]">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{resume.fileName}</h4>
                  <div className="text-xs text-slate-200 mt-0.5">
                    Updated: {resume.uploadDate} &bull; Size: {resume.fileSize}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#168BFF]/20 space-y-4">
                <label className="cursor-pointer inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]">
                  <Upload className="w-4 h-4" />
                  <span>Upload &amp; Replace PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                </label>

                <p className="text-xs text-slate-200">
                  Supports standard PDF documents. The public website will automatically link to and download this new document.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6.5. TECHNICAL SKILLS MANAGEMENT TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Technical Skills Management</h2>
                <p className="text-xs text-slate-200 mt-1">
                  Manage software competencies, tool expertise, categories, and specialization tags.
                </p>
              </div>

              <button
                onClick={() => handleOpenSkillEditor()}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:shadow-[0_0_15px_rgba(39,223,255,0.4)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Skill</span>
              </button>
            </div>

            {/* Skill Editor Modal / Inline Card */}
            {isSkillEditorOpen && (
              <form onSubmit={handleSaveSkill} className="glass-panel p-6 rounded-3xl border border-[#27DFFF]/40 shadow-[0_0_20px_rgba(39,223,255,0.15)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#168BFF]/20 pb-3">
                  <h3 className="text-sm font-bold text-white">
                    {skillForm.id ? 'Edit Technical Skill' : 'Create New Technical Skill'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSkillEditorOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">Software / Tool Name</label>
                    <input
                      type="text"
                      placeholder="e.g. DaVinci Resolve Studio"
                      value={skillForm.software}
                      onChange={(e) => setSkillForm({ ...skillForm, software: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Color Grading &amp; Finishing"
                      value={skillForm.category}
                      onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                      required
                      className="w-full px-4 py-2 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of your expertise with this software..."
                    value={skillForm.description}
                    onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Topics &amp; Capabilities (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Color Science, ACES Workflow, HDR Master, Film Emulation"
                    value={skillForm.topicsStr}
                    onChange={(e) => setSkillForm({ ...skillForm, topicsStr: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSkillEditorOpen(false)}
                    className="px-5 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]"
                  >
                    Save Skill
                  </button>
                </div>
              </form>
            )}

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((s) => (
                <div
                  key={s.id}
                  className="glass-panel p-5 rounded-2xl border border-[#168BFF]/25 hover:border-[#27DFFF]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-[#27DFFF] font-bold">
                        {s.category}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenSkillEditor(s)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-[#168BFF]/20 text-slate-200 hover:text-[#27DFFF]"
                          title="Edit Skill"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(s.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-200 hover:text-rose-400"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1.5">{s.software}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{s.description}</p>
                  </div>

                  {s.topics && s.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#168BFF]/15">
                      {s.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#168BFF]/15 border border-[#168BFF]/30 text-[#27DFFF]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SOCIAL MEDIA MANAGEMENT TAB */}
        {activeTab === 'social' && (
          <div className="space-y-6 max-w-3xl animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-white">Social Media Connections</h2>
              <p className="text-xs text-slate-200 mt-1">
                Configure your social media links and WhatsApp direct chat destination.
              </p>
            </div>

            <form onSubmit={handleSocialSave} className="space-y-4">
              {socialLinks.map((link) => (
                <div key={link.id} className="glass-panel p-4 rounded-2xl border border-[#168BFF]/25 flex items-center space-x-4">
                  <div className="w-24 text-xs font-bold text-white uppercase">{link.label}</div>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => updateSocialUrl(link.id, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs"
                  />
                </div>
              ))}

              <button
                type="submit"
                className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]"
              >
                SAVE SOCIAL MEDIA LINKS
              </button>
            </form>
          </div>
        )}

        {/* 8. CONTACT MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-white">Client Inquiries</h2>
              <p className="text-xs text-slate-200 mt-1">
                Direct messages submitted through the website contact form.
              </p>
            </div>

            {messages.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl text-xs text-slate-200">
                No contact messages in your inbox yet.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`glass-panel p-6 rounded-2xl border transition-all ${
                      msg.isRead ? 'border-[#168BFF]/20' : 'border-[#27DFFF]/60 shadow-[0_0_20px_rgba(39,223,255,0.15)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#168BFF]/20 pb-3 mb-3">
                      <div>
                        <span className="text-sm font-bold text-white">{msg.name}</span>
                        <span className="text-xs text-[#27DFFF] ml-2 font-mono">&lt;{msg.email}&gt;</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-200">
                          {new Date(msg.date).toLocaleString()}
                        </span>
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkMessageRead(msg.id)}
                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#168BFF]/20 text-[#27DFFF]"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 rounded text-slate-200 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-white mb-2">Subject: {msg.subject}</div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. WEBSITE SETTINGS & SUPABASE CONFIG TAB */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-8 max-w-3xl animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-white">Website &amp; Database Settings</h2>
              <p className="text-xs text-slate-200 mt-1">
                Configure your Supabase PostgreSQL connection, storage bucket, and persistence mode.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#168BFF]/30 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-slate-200">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={settings.supabaseUrl}
                  onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-slate-200">Supabase Anon Public Key</label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={settings.supabaseAnonKey}
                  onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={testingConnection}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#168BFF]/20 hover:bg-[#168BFF]/30 border border-[#27DFFF]/40 text-[#27DFFF]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>Test Supabase Connection</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]"
                >
                  Save Settings
                </button>
              </div>

              {connectionResult.message && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
                    connectionResult.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {connectionResult.success ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{connectionResult.message}</span>
                </div>
              )}
            </form>

            {/* SQL Schema helper */}
            <div className="glass-panel p-6 rounded-2xl border border-[#168BFF]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Database Migrations (`supabase/migrations/`)</h4>
                  <p className="text-[11px] text-slate-200">
                    Complete PostgreSQL migrations and all-in-one script are ready in `supabase/migrations/00_complete_setup.sql`.
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('supabase/migrations/00_complete_setup.sql');
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#27DFFF] flex items-center space-x-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied Path' : 'Copy Script Path'}</span>
                </button>
              </div>
            </div>

            {/* Private Admin Password Management */}
            <form onSubmit={handleChangePassword} className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#168BFF]/30 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Private Admin Password</h4>
                <p className="text-[11px] text-slate-200 mt-0.5">
                  Update your personal administrator login password at any time.
                </p>
              </div>

              {passError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs">
                  {passError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min. 6 chars)"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmAdminPass}
                    onChange={(e) => setConfirmAdminPass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF]"
                >
                  Update Admin Password
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* PROJECT EDITOR MODAL */}
      {isEditorOpen && (
        <ProjectEditorModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingProject(null);
          }}
        />
      )}

    </div>
  );
};

