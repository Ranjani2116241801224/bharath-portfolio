import React from 'react';
import {
  Sparkles,
  Lightbulb,
  Eye,
  Clock,
  UserCheck,
  Users,
  GraduationCap,
  Clapperboard,
  Film
} from 'lucide-react';
import { Profile } from '../types';
import { Card3D } from './Card3D';

interface AboutProps {
  profile: Profile;
}

export const About: React.FC<AboutProps> = ({ profile }) => {
  const highlights = [
    {
      icon: Lightbulb,
      title: 'Creative Thinking',
      description: 'Developing fresh angles, imaginative concepts, and unique visual pacing to make every video cut stand out.'
    },
    {
      icon: Clapperboard,
      title: 'Visual Storytelling',
      description: 'Constructing powerful narrative arcs where every sequence and transition connects naturally with the viewer.'
    },
    {
      icon: Eye,
      title: 'Attention to Detail',
      description: 'Zeroing in on frame-accurate trimming, seamless matching, audio peaks, color consistency, and micro-timing.'
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'Disciplined timeline assembly and fast turnaround without compromising on audio or visual excellence.'
    },
    {
      icon: UserCheck,
      title: 'Independent Working',
      description: 'Capable of taking raw client footage and briefs, translating them into polished final cuts independently.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Active listener who communicates clearly, takes director feedback constructively, and aligns with creative teams.'
    },
    {
      icon: GraduationCap,
      title: 'Continuous Learning',
      description: 'Staying on the cutting edge of viral pacing, sound trends, modern VFX techniques, and AI editing advancements.'
    },
    {
      icon: Film,
      title: 'Format Mastery',
      description: 'Versed in high-retention 9:16 reels, 16:9 cinematic widescreen, YouTube shorts, and commercial formats.'
    }
  ];

  return (
    <section id="about" className="relative py-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#168BFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#27DFFF]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
              Behind The Timeline
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            ABOUT <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">ME</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-200">
            Dedicated to the craft of transformative video editing, visual storytelling, and emotion-driven cuts.
          </p>
        </div>

        {/* Top Feature Card: Detailed Bio & Profile */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-[#168BFF]/25 shadow-[0_10px_40px_rgba(2,4,10,0.8)] mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Avatar Column with 3D Tilt */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <Card3D
                className="w-48 h-48 sm:w-56 sm:h-56 cursor-pointer"
                maxTilt={16}
                scale={1.05}
                glare={true}
              >
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#27DFFF]/60 shadow-[0_15px_40px_rgba(39,223,255,0.4)] group"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <img
                    src={profile.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-transparent to-transparent opacity-60" />
                </div>
              </Card3D>
              <h3 className="mt-4 text-xl font-bold text-white">{profile.name}</h3>
              <p className="text-xs uppercase tracking-wider text-[#27DFFF] font-semibold mt-1">
                {profile.title}
              </p>
              <div className="mt-2 text-xs text-slate-300 font-medium flex items-center space-x-1">
                <span>📍 {profile.location}</span>
              </div>
            </div>

            {/* Bio Column */}
            <div className="lg:col-span-8 space-y-4 text-left">
              <h4 className="text-xl sm:text-2xl font-bold text-white border-b border-[#168BFF]/20 pb-3">
                Passionate Visual Storyteller &amp; Editor
              </h4>
              <p className="text-slate-100 leading-relaxed text-sm sm:text-base">
                Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications, including 
                <span className="text-[#27DFFF] font-semibold"> Adobe Premiere Pro, After Effects, Photoshop and Audition</span>.
              </p>
              <p className="text-slate-100 leading-relaxed text-sm sm:text-base">
                Skilled in creating engaging social media reels, promotional videos, advertisement reels and cinematic edits. 
                Familiar with video editing, audio enhancement, visual effects, motion graphics and image manipulation.
              </p>
              <p className="text-slate-100 leading-relaxed text-sm sm:text-base">
                Eager to apply creative skills, learn new techniques and contribute to a professional video production team where cutting-edge visuals and high retention meet.
              </p>
            </div>

          </div>
        </div>

        {/* 8 Feature Glass Cards with Card3D */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card3D
                key={index}
                className="group p-6 rounded-2xl bg-[#030B1C]/75 backdrop-blur-md border border-[#168BFF]/25 hover:border-[#27DFFF]/60 hover:bg-[#071A35]/70 shadow-[0_8px_30px_rgba(2,4,10,0.8)] hover:shadow-[0_15px_40px_rgba(22,139,255,0.3)] cursor-pointer"
                maxTilt={12}
                scale={1.03}
                glare={true}
              >
                <div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#168BFF]/25 to-[#0879D1]/15 border border-[#168BFF]/40 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#27DFFF] transition-all shadow-[0_0_15px_rgba(22,139,255,0.2)]"
                  style={{ transform: 'translateZ(25px)' }}
                >
                  <Icon className="w-6 h-6 text-[#27DFFF]" />
                </div>
                <h4
                  className="text-base font-bold text-white mb-2 group-hover:text-[#27DFFF] transition-colors"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {item.title}
                </h4>
                <p
                  className="text-xs text-slate-200 leading-relaxed"
                  style={{ transform: 'translateZ(15px)' }}
                >
                  {item.description}
                </p>
              </Card3D>
            );
          })}
        </div>

      </div>
    </section>
  );
};
