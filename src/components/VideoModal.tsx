import React, { useRef, useEffect } from 'react';
import { X, Calendar, Tag, ShieldCheck, Play, Sparkles, Monitor } from 'lucide-react';
import { Project } from '../types';

interface VideoModalProps {
  project: Project | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ project, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#02040A]/92 backdrop-blur-2xl animate-fadeIn">
      {/* Outer Click overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Volumetric 3D Ambient Ambilight Glow behind modal */}
      <div className="absolute w-[600px] h-[450px] sm:w-[900px] sm:h-[600px] rounded-full bg-gradient-radial from-[#168BFF]/35 via-[#0879D1]/15 to-transparent blur-3xl pointer-events-none animate-pulse-slow -z-10" />

      {/* 3D Floating Monitor Card */}
      <div
        className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto glass-panel rounded-3xl border-2 border-[#27DFFF]/40 shadow-[0_30px_90px_rgba(2,4,10,0.98),0_0_40px_rgba(39,223,255,0.3)] z-10 flex flex-col"
        style={{
          transform: 'perspective(1200px) rotateX(1deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#168BFF]/25 bg-[#030B1C]/90 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#168BFF]/20 border border-[#27DFFF]/40 flex items-center justify-center text-[#27DFFF]">
              <Monitor className="w-4 h-4" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#168BFF]/20 text-[#27DFFF] border border-[#27DFFF]/40 shadow-[0_0_12px_rgba(39,223,255,0.3)]">
              {project.category}
            </span>
            {project.isDemo && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Demo Showcase
              </span>
            )}
            {!project.isDemo && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Original Bharath Edit</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-[#168BFF]/30 text-slate-300 hover:text-white transition-colors border border-transparent hover:border-[#27DFFF]/40"
            aria-label="Close video modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Video Player Chassis */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden border-y border-[#168BFF]/30 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
          {/* Cyber HUD Corner Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#27DFFF]/70 pointer-events-none z-10" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#27DFFF]/70 pointer-events-none z-10" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#27DFFF]/70 pointer-events-none z-10" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#27DFFF]/70 pointer-events-none z-10" />

          {project.videoUrl ? (
            <video
              ref={videoRef}
              src={project.videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support HTML5 video.
            </video>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center p-2 bg-black">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-6 sm:p-8 space-y-4 bg-[#030B1C]/95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#168BFF]/20 pb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {project.title}
            </h3>
            {project.completionDate && (
              <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-[#27DFFF]" />
                <span>Completed: {project.completionDate}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            {project.description}
          </p>

          {project.subCategory && (
            <div className="flex items-center space-x-2 pt-2">
              <Tag className="w-3.5 h-3.5 text-[#168BFF]" />
              <span className="text-xs text-[#27DFFF] font-semibold">Specialty: {project.subCategory}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
