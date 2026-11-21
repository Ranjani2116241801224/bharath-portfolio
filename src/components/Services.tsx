import React from 'react';
import {
  Film,
  Clapperboard,
  Megaphone,
  Smartphone,
  ShoppingBag,
  Layers,
  Type,
  AudioLines,
  Volume2,
  Sparkles,
  Check
} from 'lucide-react';
import { initialServices } from '../data/initialData';
import { Card3D } from './Card3D';

const iconMap: Record<string, React.ElementType> = {
  Film,
  Clapperboard,
  Megaphone,
  Smartphone,
  ShoppingBag,
  Layers,
  Type,
  AudioLines,
  Volume2
};

export const Services: React.FC = () => {
  return (
    <section id="services" className="relative py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0879D1]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#27DFFF]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
              Creative Capabilities
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            WHAT I CAN <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">CREATE</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-200">
            High-impact visual editing services tailored for content creators, commercial brands, and agency pipelines.
          </p>
        </div>

        {/* 9 Services Grid with Card3D */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialServices.map((service, index) => {
            const IconComponent = iconMap[service.iconName] || Film;
            return (
              <Card3D
                key={service.id || index}
                className="group relative p-8 rounded-2xl glass-panel border border-[#168BFF]/25 hover:border-[#27DFFF]/60 hover:bg-[#071A35]/65 shadow-[0_10px_35px_rgba(2,4,10,0.85)] hover:shadow-[0_15px_45px_rgba(22,139,255,0.3)] flex flex-col justify-between cursor-pointer"
                maxTilt={13}
                scale={1.03}
                glare={true}
              >
                <div>
                  {/* Icon & Index (Z: 30px) */}
                  <div
                    className="flex items-center justify-between mb-6"
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#168BFF]/25 to-[#0879D1]/15 border border-[#168BFF]/40 flex items-center justify-center group-hover:scale-110 group-hover:border-[#27DFFF] transition-all duration-300 shadow-[0_0_15px_rgba(22,139,255,0.25)]">
                      <IconComponent className="w-7 h-7 text-[#27DFFF]" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#27DFFF] transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title (Z: 25px) */}
                  <h3
                    className="text-xl font-bold text-white mb-3 group-hover:text-[#27DFFF] transition-colors"
                    style={{ transform: 'translateZ(25px)' }}
                  >
                    {service.title}
                  </h3>

                  {/* Description (Z: 15px) */}
                  <p
                    className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-6 font-normal"
                    style={{ transform: 'translateZ(15px)' }}
                  >
                    {service.description}
                  </p>
                </div>

                {/* Features Checklist (Z: 20px) */}
                <div
                  className="pt-4 border-t border-[#168BFF]/15 space-y-2"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-100 font-medium">
                      <Check className="w-3.5 h-3.5 text-[#27DFFF] flex-shrink-0" />
                      <span>{feat}</span>
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
