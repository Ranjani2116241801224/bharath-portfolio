import React from 'react';
import { Sparkles, Brain, CheckCircle, Clock, BookOpen, Users } from 'lucide-react';
import { initialStrengths } from '../data/initialData';
import { Card3D } from './Card3D';

const iconMap: Record<string, React.ElementType> = {
  Brain,
  CheckCircle,
  Clock,
  BookOpen,
  Users
};

export const Strengths: React.FC = () => {
  return (
    <section id="strengths" className="relative py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-[#27DFFF]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#27DFFF]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
              Work Ethic &amp; Mindset
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            MY <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">STRENGTHS</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-200">
            Key creative and professional strengths that empower seamless production turnaround and client satisfaction.
          </p>
        </div>

        {/* Strengths Cards with Card3D */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {initialStrengths.map((item, index) => {
            const Icon = iconMap[item.iconName] || Brain;
            return (
              <Card3D
                key={item.id || index}
                className="group relative p-6 rounded-2xl glass-panel border border-[#168BFF]/25 hover:border-[#27DFFF]/60 hover:bg-[#071A35]/70 shadow-[0_10px_35px_rgba(2,4,10,0.8)] hover:shadow-[0_15px_45px_rgba(22,139,255,0.3)] flex flex-col justify-between text-center items-center cursor-pointer"
                maxTilt={15}
                scale={1.04}
                glare={true}
              >
                <div>
                  <div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#168BFF]/25 to-[#0879D1]/15 border border-[#168BFF]/40 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-[#27DFFF] transition-all duration-300 mx-auto shadow-[0_0_15px_rgba(22,139,255,0.2)]"
                    style={{ transform: 'translateZ(25px)' }}
                  >
                    <Icon className="w-7 h-7 text-[#27DFFF]" />
                  </div>

                  <h3
                    className="text-base font-bold text-white mb-2 group-hover:text-[#27DFFF] transition-colors"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    {item.title}
                  </h3>

                  <p
                    className="text-xs text-slate-200 leading-relaxed"
                    style={{ transform: 'translateZ(15px)' }}
                  >
                    {item.description}
                  </p>
                </div>

                <div
                  className="mt-5 w-8 h-1 rounded-full bg-[#168BFF]/30 group-hover:bg-[#27DFFF] group-hover:w-16 transition-all duration-300 shadow-[0_0_8px_#27DFFF]"
                  style={{ transform: 'translateZ(20px)' }}
                />
              </Card3D>
            );
          })}
        </div>

      </div>
    </section>
  );
};
