import React from 'react';
import { Play, Download, Sparkles, Send, Award, Film, CheckCircle2 } from 'lucide-react';
import { Profile, ResumeData } from '../types';
import { Card3D } from './Card3D';

interface HeroProps {
  profile: Profile;
  resume: ResumeData;
  onOpenResumeModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ profile, resume, onOpenResumeModal }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDownloadResume = () => {
    if (resume.fileUrl && !resume.fileUrl.startsWith('blob:')) {
      // Create download trigger
      const link = document.createElement('a');
      link.href = resume.fileUrl;
      link.download = resume.fileName || 'BHARATH_S_Video_Editor_Resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      onOpenResumeModal();
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#168BFF]/15 via-[#0879D1]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-[#27DFFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column (Col 7) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Small Badge Heading */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#030B1C]/80 border border-[#168BFF]/30 shadow-[0_0_15px_rgba(22,139,255,0.25)]">
              <Sparkles className="w-4 h-4 text-[#27DFFF] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#27DFFF] uppercase">
                {profile.smallHeading || 'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER'}
              </span>
            </div>

            {/* Main Name Heading with Glow */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-none">
              <span className="block text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                {profile.name || 'BHARATH S'}
              </span>
              <span className="block mt-2 text-2xl sm:text-3xl xl:text-4xl font-semibold bg-gradient-to-r from-[#27DFFF] via-[#168BFF] to-[#0879D1] bg-clip-text text-transparent">
                {profile.title || 'JUNIOR VIDEO EDITOR'}
              </span>
            </h1>

            {/* Cinematic Tagline */}
            <blockquote className="text-lg sm:text-xl font-medium text-[#27DFFF] italic border-l-2 border-[#168BFF] pl-4 py-1 max-w-xl mx-auto lg:mx-0">
              "{profile.tagline || 'Turning Raw Footage Into Visual Stories.'}"
            </blockquote>

            {/* Description */}
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {profile.bio ||
                'Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications. Passionate about creating engaging social media reels, promotional videos, advertisement reels and cinematic edits.'}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              {/* Explore My Work */}
              <button
                onClick={() => scrollTo('projects')}
                className="group relative inline-flex items-center space-x-2.5 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] shadow-[0_0_25px_rgba(22,139,255,0.4)] hover:shadow-[0_0_35px_rgba(39,223,255,0.6)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Film className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Explore My Work</span>
              </button>

              {/* Download Resume */}
              <button
                onClick={handleDownloadResume}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-semibold text-white glass-panel border border-[#168BFF]/40 hover:border-[#27DFFF] hover:bg-[#168BFF]/15 hover:shadow-[0_0_20px_rgba(39,223,255,0.3)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 text-[#27DFFF]" />
                <span>Download Resume</span>
              </button>

              {/* Let's Connect */}
              <button
                onClick={() => scrollTo('contact')}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-full text-sm font-semibold text-slate-200 hover:text-[#27DFFF] transition-colors"
              >
                <Send className="w-4 h-4 text-[#168BFF]" />
                <span>Let's Connect</span>
              </button>
            </div>

            {/* Quick Metrics & Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 border-t border-[#168BFF]/20">
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center lg:justify-start space-x-1">
                  <span>4</span>
                  <span className="text-[#27DFFF] text-base">+</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-300 uppercase tracking-wider font-medium">
                  Adobe CC Tools
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center lg:justify-start space-x-1">
                  <span>2024</span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-300 uppercase tracking-wider font-medium">
                  Arena Certified
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center lg:justify-start space-x-1">
                  <CheckCircle2 className="w-5 h-5 text-[#27DFFF]" />
                </div>
                <div className="text-[11px] sm:text-xs text-slate-300 uppercase tracking-wider font-medium">
                  Ready to Work
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Glowing Profile Card (Col 5) */}
          <div className="lg:col-span-5 flex justify-center">
            <Card3D
              className="relative w-72 sm:w-80 md:w-96 cursor-pointer"
              maxTilt={16}
              scale={1.04}
              glare={true}
            >
              {/* Outer Cyber Nebula Glow Rings (Z: -20px) */}
              <div
                className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#168BFF]/45 via-[#27DFFF]/35 to-[#0879D1]/25 blur-xl opacity-80 group-hover:opacity-100 transition-all duration-700 animate-pulse-slow -z-10"
                style={{ transform: 'translateZ(-20px)' }}
              />

              {/* 3D Photo Container */}
              <div
                className="relative p-2.5 rounded-3xl bg-gradient-to-b from-[#168BFF]/50 via-[#071A35]/70 to-[#030B1C]/95 border-2 border-[#27DFFF]/50 shadow-[0_20px_60px_rgba(2,4,10,0.95)] backdrop-blur-2xl"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Photo Frame (Z: 20px) */}
                <div
                  className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#071A35] border border-[#168BFF]/40 shadow-[inset_0_0_20px_rgba(22,139,255,0.3)]"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <img
                    src={profile.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                    alt={profile.name || 'Bharath S - Video Editor'}
                    className="w-full h-full object-cover object-center filter brightness-95 contrast-105 transition-transform duration-700 hover:scale-105"
                  />

                  {/* Gradient bottom overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-transparent to-transparent opacity-85" />

                  {/* Floating Live Status Pill (Z: 50px) */}
                  <div
                    className="absolute top-3.5 right-3.5 flex items-center space-x-2 px-3 py-1 rounded-full bg-[#030B1C]/90 border border-[#27DFFF]/60 shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(39,223,255,0.5)] backdrop-blur-md"
                    style={{ transform: 'translateZ(50px)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#27DFFF] animate-ping" />
                    <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                      Available for Hire
                    </span>
                  </div>

                  {/* Bottom Info In Frame (Z: 40px) */}
                  <div
                    className="absolute bottom-4 left-4 right-4"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#27DFFF]" />
                      <span className="text-xs uppercase font-bold tracking-wider text-white">
                        Visual Storyteller
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Bengaluru, Karnataka, India
                    </div>
                  </div>
                </div>

                {/* Sub-Card: Video Editing Badge (Z: 35px) */}
                <div
                  className="mt-3 p-3 rounded-xl bg-[#030B1C]/95 border border-[#168BFF]/40 shadow-[0_10px_25px_rgba(0,0,0,0.7)] flex items-center justify-between"
                  style={{ transform: 'translateZ(35px)' }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-[#168BFF]/25 border border-[#27DFFF]/30 flex items-center justify-center">
                      <Play className="w-4 h-4 text-[#27DFFF] fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Reel Specialist</div>
                      <div className="text-[10px] text-slate-300">Adobe Premiere &amp; After Effects</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#27DFFF] px-2.5 py-0.5 rounded-full bg-[#168BFF]/20 border border-[#27DFFF]/40 shadow-[0_0_10px_rgba(39,223,255,0.3)]">
                    Pro
                  </span>
                </div>

              </div>
            </Card3D>
          </div>

        </div>
      </div>
    </section>
  );
};
