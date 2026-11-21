import React, { useState } from 'react';
import { Play, Sparkles, Film, Calendar, Eye, ShieldAlert, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { Card3D } from './Card3D';

interface ProjectsProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenAdminUpload: () => void;
}

export const Projects: React.FC<ProjectsProps> = ({
  projects,
  onSelectProject,
  onOpenAdminUpload
}) => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('ALL');

  const categories: ProjectCategory[] = [
    'ALL',
    'CINEMATIC',
    'ADVERTISEMENT',
    'PROMOTIONAL',
    'SOCIAL MEDIA'
  ];

  const filteredProjects = projects.filter((project) => {
    if (activeCategory === 'ALL') return true;
    return project.category === activeCategory;
  });

  return (
    <section id="projects" className="relative py-24 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#168BFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30">
            <Film className="w-3.5 h-3.5 text-[#27DFFF]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
              Portfolio Showcase
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            MY CREATIVE <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">WORKS</span>
          </h2>

          <p className="text-base sm:text-lg text-[#27DFFF] font-medium italic">
            "Every Frame Tells a Story."
          </p>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto">
            Explore curated cinematic reels, viral advertisement cuts, product videos, and rhythm-synchronized edits.
          </p>
        </div>

        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#168BFF] to-[#0879D1] text-white shadow-[0_0_20px_rgba(39,223,255,0.4)] border border-[#27DFFF]/50 scale-105'
                    : 'bg-[#030B1C]/90 text-slate-200 border border-[#168BFF]/30 hover:border-[#27DFFF]/60 hover:text-white hover:bg-[#168BFF]/10'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border border-[#168BFF]/30">
            <ShieldAlert className="w-12 h-12 text-[#27DFFF] mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">No Projects in this Category</h3>
            <p className="text-xs text-slate-200">
              Upload your own project videos or change category filters to view more work.
            </p>
            <button
              onClick={onOpenAdminUpload}
              className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-[#168BFF] to-[#0879D1] text-white"
            >
              + Upload First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <Card3D
                key={project.id}
                className="group relative rounded-2xl glass-panel border border-[#168BFF]/25 hover:border-[#27DFFF]/60 shadow-[0_10px_35px_rgba(2,4,10,0.85)] hover:shadow-[0_20px_50px_rgba(22,139,255,0.35)] flex flex-col overflow-hidden"
                maxTilt={14}
                scale={1.035}
                glare={true}
              >
                {/* 3D Depth Thumbnail Container (Z: 20px) */}
                <div
                  className="relative w-full aspect-video bg-[#071A35] overflow-hidden rounded-t-2xl"
                  style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
                >
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030B1C] via-[#030B1C]/25 to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />

                  {/* Category Pill (Z: 45px) */}
                  <div
                    className="absolute top-3 left-3 flex items-center space-x-2"
                    style={{ transform: 'translateZ(45px)' }}
                  >
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#02040A]/90 text-[#27DFFF] border border-[#27DFFF]/50 backdrop-blur-md shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
                      {project.category}
                    </span>
                    {project.isDemo && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
                        Demo
                      </span>
                    )}
                  </div>

                  {/* Play / Inspect Hover Overlay Button (Z: 65px) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#02040A]/50 backdrop-blur-xs">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-[#168BFF] to-[#27DFFF] p-0.5 shadow-[0_0_30px_rgba(39,223,255,0.8)] transform scale-75 group-hover:scale-100 transition-transform duration-300 flex items-center justify-center"
                      style={{
                        transform: 'translateZ(65px)',
                        filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.9))'
                      }}
                      aria-label={project.mediaType === 'photo' ? `View ${project.title}` : `Watch ${project.title}`}
                    >
                      <div className="w-full h-full bg-[#02040A] rounded-full flex items-center justify-center">
                        {project.mediaType === 'photo' ? (
                          <Eye className="w-7 h-7 text-[#27DFFF]" />
                        ) : (
                          <Play className="w-7 h-7 text-[#27DFFF] fill-current translate-x-0.5" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Content Box (Z: 30px) */}
                <div
                  className="p-6 flex-1 flex flex-col justify-between space-y-4"
                  style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d' }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                      <span>{project.subCategory || project.category}</span>
                      {project.completionDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-[#27DFFF]" />
                          <span>{project.completionDate}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#27DFFF] transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-2 font-normal">
                      {project.description}
                    </p>
                  </div>

                  {/* Bottom Action (Z: 40px) */}
                  <div
                    className="pt-3 border-t border-[#168BFF]/20 flex items-center justify-between"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <button
                      onClick={() => onSelectProject(project)}
                      className="inline-flex items-center space-x-2 text-xs font-semibold text-[#27DFFF] hover:text-white transition-colors group/btn"
                    >
                      <span>{project.mediaType === 'photo' ? 'View Photo' : 'Watch Project'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => onSelectProject(project)}
                      className="p-1.5 rounded-lg bg-[#168BFF]/15 text-slate-200 hover:text-[#27DFFF] hover:bg-[#168BFF]/30 transition-colors"
                      title={project.mediaType === 'photo' ? 'Inspect Photo' : 'Quick Preview'}
                    >
                      {project.mediaType === 'photo' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

              </Card3D>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
