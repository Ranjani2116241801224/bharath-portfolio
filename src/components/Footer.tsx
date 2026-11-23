import React from 'react';
import {
  Video,
  ArrowUp,
  Mail,
  MessageSquare
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, InstagramIcon, YoutubeIcon } from './SocialIcons';
import { SocialLink } from '../types';

interface FooterProps {
  socialLinks: SocialLink[];
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ socialLinks, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Services', href: '#services' },
    { label: 'Skills', href: '#skills' },
    { label: 'Education', href: '#education' },
    { label: 'Resume', href: '#resume' },
    { label: 'Contact', href: '#contact' },
  ];

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return GithubIcon;
      case 'linkedin': return LinkedinIcon;
      case 'instagram': return InstagramIcon;
      case 'youtube': return YoutubeIcon;
      case 'whatsapp': return MessageSquare;
      default: return Mail;
    }
  };

  return (
    <footer className="relative border-t border-[#168BFF]/25 bg-[#02040A]/40 backdrop-blur-md pt-16 pb-12 overflow-hidden">
      {/* Background radial blue glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-radial from-[#168BFF]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#168BFF]/15">
          
          {/* Brand Info (Col 5) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#168BFF] to-[#0879D1] p-[1.5px] shadow-[0_0_15px_rgba(22,139,255,0.4)]">
                <div className="w-full h-full bg-[#02040A] rounded-[10px] flex items-center justify-center">
                  <Video className="w-5 h-5 text-[#27DFFF]" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-wider text-white">
                  BHARATH S
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-[#168BFF] font-semibold">
                  Junior Video Editor
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-sm">
              Creative Visual Storyteller turning raw footage into cinematic reels, dynamic advertisement cuts, and engaging social narratives.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              {socialLinks.filter(s => s.isActive).map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 hover:border-[#27DFFF] hover:bg-[#168BFF]/20 text-slate-200 hover:text-[#27DFFF] flex items-center justify-center transition-all duration-300"
                    title={link.label}
                    aria-label={link.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links (Col 4) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-slate-200 hover:text-[#27DFFF] transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Direct Connect (Col 3) */}
          <div className="md:col-span-3 space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Direct Contact
            </h4>
            <div className="space-y-1.5 text-xs text-slate-200">
              <div>Krishnarajapuram, Bengaluru, Karnataka, India</div>
              <div className="text-white font-medium">+91 9585268336</div>
              <div className="text-[#27DFFF] font-medium break-all">sbharath16052@gmail.com</div>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-4 inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#27DFFF]" />
            </button>
          </div>

        </div>

        {/* Bottom Copyright & Admin Trigger */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <div>
            &copy; 2026 BHARATH S. All Rights Reserved.
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-slate-400">
              Designed with 3D Blue Galaxy Aesthetic
            </span>
            <button
              onClick={onOpenAdmin}
              className="text-[11px] text-[#168BFF] hover:text-[#27DFFF] transition-colors font-medium"
            >
              Admin Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
