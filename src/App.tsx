import React, { useState, useEffect } from 'react';
import { GalaxyBackground } from './components/GalaxyBackground';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { VideoModal } from './components/VideoModal';
import { Services } from './components/Services';
import { Skills } from './components/Skills';
import { Strengths } from './components/Strengths';
import { EducationAndTraining } from './components/Education';
import { Resume } from './components/Resume';
import { Contact } from './components/Contact';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { LoginScreen } from './components/admin/LoginScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StorageService } from './services/storageService';
import { Profile, Project, ResumeData, SocialLink } from './types';
import { initialProfile, initialProjects, initialResume, initialSocialLinks } from './data/initialData';

export function App() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks);

  // Modals & Navigation
  const [activeVideoProject, setActiveVideoProject] = useState<Project | null>(null);
  const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => localStorage.getItem('bharath_admin_auth') === 'true'
  );

  const reloadData = async () => {
    try {
      const p = await StorageService.getProfile();
      const pr = await StorageService.getProjects();
      const r = await StorageService.getResume();
      const s = await StorageService.getSocialLinks();

      setProfile(p);
      setProjects(pr);
      setResume(r);
      setSocialLinks(s);
    } catch (err) {
      console.warn('Data reload failed', err);
    }
  };

  useEffect(() => {
    reloadData();

    // Listen for updates from Admin actions
    const handleProfileUpdate = () => reloadData();
    const handleProjectsUpdate = () => reloadData();
    const handleResumeUpdate = () => reloadData();
    const handleSocialUpdate = () => reloadData();

    window.addEventListener('portfolio_profile_updated', handleProfileUpdate);
    window.addEventListener('portfolio_projects_updated', handleProjectsUpdate);
    window.addEventListener('portfolio_resume_updated', handleResumeUpdate);
    window.addEventListener('portfolio_social_updated', handleSocialUpdate);

    return () => {
      window.removeEventListener('portfolio_profile_updated', handleProfileUpdate);
      window.removeEventListener('portfolio_projects_updated', handleProjectsUpdate);
      window.removeEventListener('portfolio_resume_updated', handleResumeUpdate);
      window.removeEventListener('portfolio_social_updated', handleSocialUpdate);
    };
  }, []);

  const handleAdminLogout = async () => {
    await StorageService.adminLogout();
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#02040A] text-white selection:bg-[#168BFF]/30 selection:text-[#27DFFF]">
      
      {/* 1. REALISTIC 3D BLUE GALAXY BACKGROUND */}
      <GalaxyBackground />

      {/* 2. NAVIGATION BAR */}
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminAuthenticated}
      />

      {/* MAIN WEBSITE CONTENT */}
      <main className="relative z-10">
        
        {/* 3. HERO SECTION */}
        <Hero
          profile={profile}
          resume={resume}
          onOpenResumeModal={() => {
            const el = document.getElementById('resume');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4. ABOUT ME */}
        <About profile={profile} />

        {/* 5. MY CREATIVE WORKS - GALLERY */}
        <Projects
          projects={projects}
          onSelectProject={(p) => setActiveVideoProject(p)}
          onOpenAdminUpload={() => setIsAdminOpen(true)}
        />

        {/* 6. SERVICES (WHAT I CAN CREATE) */}
        <Services />

        {/* 7. TECHNICAL SKILLS (MY CREATIVE TOOLKIT) */}
        <Skills />

        {/* 8. PERSONAL STRENGTHS (MY STRENGTHS) */}
        <Strengths />

        {/* 9. EDUCATION & PROFESSIONAL TRAINING & CAREER OBJECTIVE */}
        <EducationAndTraining />

        {/* 10. RESUME SECTION */}
        <Resume
          resume={resume}
          profile={profile}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* 11. CONTACT & SOCIAL CONNECTIONS */}
        <Contact
          profile={profile}
          socialLinks={socialLinks}
        />

      </main>

      {/* 12. FLOATING WHATSAPP BUTTON */}
      <FloatingWhatsApp phone={profile.phone} />

      {/* 13. FOOTER */}
      <Footer
        socialLinks={socialLinks}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* VIDEO PREVIEW MODAL */}
      <VideoModal
        project={activeVideoProject}
        onClose={() => setActiveVideoProject(null)}
      />

      {/* ADMIN AUTHENTICATION & DASHBOARD */}
      {isAdminOpen && (
        <>
          {isAdminAuthenticated ? (
            <AdminDashboard
              onClose={() => setIsAdminOpen(false)}
              onLogout={handleAdminLogout}
            />
          ) : (
            <LoginScreen
              onLoginSuccess={() => setIsAdminAuthenticated(true)}
              onClose={() => setIsAdminOpen(false)}
            />
          )}
        </>
      )}

    </div>
  );
}

export default App;
