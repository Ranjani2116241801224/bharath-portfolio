import React from 'react';
import { Sparkles, GraduationCap, Award, Compass, CheckCircle2, Calendar } from 'lucide-react';
import { initialEducation, initialTraining } from '../data/initialData';
import { Card3D } from './Card3D';

export const EducationAndTraining: React.FC = () => {
  return (
    <section id="education" className="relative py-24 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#168BFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30">
            <GraduationCap className="w-3.5 h-3.5 text-[#27DFFF]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
              Academic &amp; Specialized Credentials
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            EDUCATION &amp; <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">TRAINING</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-200">
            Formal computer applications foundation combined with rigorous industry training in post-production software.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-20">
          
          {/* 11. EDUCATION: Professional Animated Timeline */}
          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-[#168BFF]/25 shadow-[0_10px_40px_rgba(2,4,10,0.8)] flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#168BFF]/20 border border-[#168BFF]/40 flex items-center justify-center text-[#27DFFF]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#27DFFF]">
                    Formal Education
                  </div>
                  <h3 className="text-2xl font-bold text-white">EDUCATION</h3>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="relative pl-8 border-l-2 border-[#168BFF]/30 mt-6 space-y-8">
                {/* Timeline Node */}
                <div className="relative group">
                  {/* Glowing Node Marker */}
                  <span className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-[#02040A] border-2 border-[#27DFFF] shadow-[0_0_12px_#27DFFF] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#27DFFF]" />
                  </span>

                  <div className="p-6 rounded-2xl bg-[#030B1C]/80 border border-[#168BFF]/20 group-hover:border-[#27DFFF]/40 transition-colors">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold text-[#27DFFF] bg-[#168BFF]/15 border border-[#27DFFF]/30 mb-2">
                      Undergraduate Degree
                    </span>
                    <h4 className="text-xl font-bold text-white mb-1">
                      {initialEducation.degree}
                    </h4>
                    <p className="text-sm font-semibold text-[#168BFF]">
                      {initialEducation.institution}
                    </p>
                    <p className="text-xs text-slate-200 mt-3 leading-relaxed">
                      Solid foundation in computer applications, digital multimedia principles, software architecture, and computational logic.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#168BFF]/15 text-xs text-slate-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#27DFFF]" />
              <span>Verified Degree Curriculum</span>
            </div>
          </div>

          {/* 12. PROFESSIONAL TRAINING: Certificate-style card with Card3D */}
          <Card3D
            className="relative glass-panel rounded-3xl p-8 sm:p-10 border-2 border-[#27DFFF]/40 shadow-[0_15px_45px_rgba(22,139,255,0.3)] flex flex-col justify-between overflow-hidden cursor-pointer"
            maxTilt={12}
            scale={1.03}
            glare={true}
          >
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#27DFFF]/20 via-[#168BFF]/10 to-transparent pointer-events-none" />

            <div style={{ transformStyle: 'preserve-3d' }}>
              <div
                className="flex items-center justify-between mb-6"
                style={{ transform: 'translateZ(30px)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#27DFFF]/15 border border-[#27DFFF]/40 flex items-center justify-center text-[#27DFFF] shadow-[0_0_15px_rgba(39,223,255,0.3)]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#27DFFF]">
                      Professional Certification
                    </div>
                    <h3 className="text-2xl font-bold text-white">PROFESSIONAL TRAINING</h3>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#168BFF]/20 border border-[#27DFFF]/30 text-xs font-mono font-bold text-[#27DFFF]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{initialTraining.year}</span>
                </div>
              </div>

              {/* Course & Institute Details */}
              <div className="space-y-4" style={{ transform: 'translateZ(20px)' }}>
                <div className="p-5 rounded-2xl bg-[#030B1C]/90 border border-[#168BFF]/30">
                  <div className="text-xs uppercase tracking-wider text-slate-300">
                    Accredited Course
                  </div>
                  <h4 className="text-xl font-bold text-white mt-1">
                    {initialTraining.course}
                  </h4>
                  <div className="text-sm font-semibold text-[#27DFFF] mt-1">
                    Institute: {initialTraining.institute}
                  </div>
                </div>

                {/* Software Covered */}
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-white mb-3">
                    Creative Suite Covered:
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {initialTraining.software.map((sw, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-2.5 rounded-xl bg-[#071A35]/60 border border-[#168BFF]/20"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#27DFFF] flex-shrink-0" />
                        <span className="text-xs font-semibold text-white">{sw}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="pt-6 border-t border-[#168BFF]/20 flex items-center justify-between text-xs text-slate-300"
              style={{ transform: 'translateZ(25px)' }}
            >
              <span>Arena Animation Industry Program</span>
              <span className="font-mono text-[11px] text-[#27DFFF] font-semibold">Credential Verified</span>
            </div>
          </Card3D>

        </div>

        {/* 13. CAREER OBJECTIVE: Cinematic Text Card with Card3D */}
        <Card3D
          className="relative glass-panel rounded-3xl p-8 sm:p-12 border-2 border-[#168BFF]/35 shadow-[0_20px_50px_rgba(2,4,10,0.9)] text-center max-w-4xl mx-auto overflow-hidden cursor-pointer"
          maxTilt={10}
          scale={1.02}
          glare={true}
        >
          {/* Subtle cosmic light beam */}
          <div className="absolute inset-0 bg-gradient-radial from-[#168BFF]/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-4" style={{ transform: 'translateZ(25px)' }}>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30 mx-auto">
              <Compass className="w-3.5 h-3.5 text-[#27DFFF]" />
              <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
                Future Ambition
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              MY CAREER <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">VISION</span>
            </h3>

            <p className="text-lg sm:text-2xl font-medium text-white/95 max-w-3xl mx-auto leading-relaxed italic">
              "To begin my career as a Junior Video Editor in a creative media or digital marketing company where I can develop my editing skills, contribute to creative projects and grow professionally."
            </p>

            <div className="pt-2 text-xs uppercase tracking-widest text-[#168BFF] font-semibold">
              — BHARATH S &bull; Ready For Immediate Onboarding
            </div>
          </div>
        </Card3D>

      </div>
    </section>
  );
};
