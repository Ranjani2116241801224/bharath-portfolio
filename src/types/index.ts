export type ProjectCategory = 
  | 'ALL'
  | 'CINEMATIC' 
  | 'ADVERTISEMENT' 
  | 'PROMOTIONAL' 
  | 'SOCIAL MEDIA';

export interface ProjectMedia {
  id: string;
  url: string;
  type: 'video' | 'photo';
  name?: string;
  size?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'CINEMATIC' | 'ADVERTISEMENT' | 'PROMOTIONAL' | 'SOCIAL MEDIA';
  subCategory?: string;
  completionDate: string;
  thumbnail: string;
  videoUrl?: string;
  mediaFiles?: ProjectMedia[];
  mediaType: 'video' | 'photo';
  isPublished: boolean;
  isDemo: boolean;
  sortOrder: number;
  featured?: boolean;
  createdAt: string;
}

export interface Profile {
  name: string;
  title: string;
  smallHeading: string;
  tagline: string;
  bio: string;
  profileImage: string;
  location: string;
  phone: string;
  email: string;
  vision: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
}

export interface TechnicalSkill {
  id: string;
  software: string;
  category: string;
  description: string;
  iconName: string;
  topics: string[];
}

export interface PersonalStrength {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
}

export interface TrainingItem {
  id: string;
  course: string;
  institute: string;
  year: string;
  software: string[];
  credentialId?: string;
}

export interface ResumeData {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  fileSize: string;
  isPublished: boolean;
}

export interface SocialLink {
  id: string;
  platform: 'github' | 'linkedin' | 'whatsapp' | 'instagram' | 'youtube' | 'email';
  label: string;
  url: string;
  username: string;
  isActive: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface WebsiteSettings {
  useSupabase: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  connected: boolean;
  lastSync?: string;
}
