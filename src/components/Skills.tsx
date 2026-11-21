import React, { useState } from 'react';
import { Sparkles, Scissors, Wand2, Palette, Mic, CheckCircle2 } from 'lucide-react';
import { initialSkills } from '../data/initialData';
import { Card3D } from './Card3D';

const iconMap: Record<string, React.ElementType> = {
  Scissors,
  Sparkles: Wand2,
  Palette,
  Mic
};

export const Skills: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<string>(initialSkills[0].id);

  // Adobe signature badge abbreviations
  const adobeBadges: Record<string, { abbr: string; bg: string; text: string }> = {
    'skill-pr': { abbr: 'Pr', bg: 'bg-[#00005B]', text: 'text-[#9999FF]' },
    'skill-ae': { abbr: 'Ae', bg: 'bg-[#00005B]', text: 'text-[#D291FF]' },
    'skill-ps': { abbr: 'Ps', bg: 'bg-[#001E36]', text: 'text-[#31A8FF]' },
    'skill-au': { abbr: 'Au', bg: 'bg-[#002B24]', text: 'text-[#00E5B0]' },
  };

  return (
    <section id="skills" className="relative py-24 overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#168BFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#27DFFF]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
              Software Competencies
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            MY CREATIVE <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">TOOLKIT</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-200">
            Trained and hands-on in the industry-leading Adobe Creative Cloud suite for video, motion, graphic design, and audio mastering.
          </p>
        </div>

        {/* 4 Software Cards Grid with Card3D */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialSkills.map((skill) => {
            const isSelected = selectedSkill === skill.id;
            const badge = adobeBadges[skill.id] || { abbr: 'CC', bg: 'bg-[#071A35]', text: 'text-[#27DFFF]' };
            const IconComp = iconMap[skill.iconName] || Scissors;

            return (
              <Card3D
                key={skill.id}
                onClick={() => setSelectedSkill(skill.id)}
                className={`group cursor-pointer rounded-2xl p-6 sm:p-7 glass-panel transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? 'border-2 border-[#27DFFF] bg-[#071A35]/85 shadow-[0_15px_45px_rgba(39,223,255,0.4)]'
                    : 'border border-[#168BFF]/25 hover:border-[#27DFFF]/60 hover:bg-[#030B1C]/95'
                }`}
                maxTilt={14}
                scale={1.035}
                glare={true}
              >
                <div>
                  {/* Card Header: Adobe Icon & Tool Category */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl font-mono shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(39,223,255,0.3)] border border-white/10 ${badge.bg} ${badge.text}`}
                      style={{ transform: 'translateZ(30px)' }}
                    >
                      {badge.abbr}
                    </div>
                    <div
                      className="p-2 rounded-xl bg-[#168BFF]/15 border border-[#27DFFF]/30 text-[#27DFFF]"
                      style={{ transform: 'translateZ(25px)' }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Software Name */}
                  <h3
                    className="text-lg font-extrabold text-white mb-1 group-hover:text-[#27DFFF] transition-colors"
                    style={{ transform: 'translateZ(25px)' }}
                  >
                    {skill.software}
                  </h3>

                  <p
                    className="text-[11px] font-semibold uppercase tracking-wider text-[#168BFF] mb-3"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    {skill.category}
                  </p>

                  <p
                    className="text-xs text-slate-200 leading-relaxed mb-6"
                    style={{ transform: 'translateZ(15px)' }}
                  >
                    {skill.description}
                  </p>
                </div>

                {/* Topics List */}
                <div
                  className="pt-4 border-t border-[#168BFF]/20 space-y-2"
                  style={{ transform: 'translateZ(25px)' }}
                >
                  <div className="text-[10px] uppercase font-bold text-[#27DFFF] tracking-widest mb-1">
                    Core Capabilities
                  </div>
                  {skill.topics.map((topic, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#27DFFF] flex-shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>

              </Card3D>
            );
          })}
        </div>

      </div>
    </section>
  );
};
