import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { ResumeData, Profile } from '../types';
import { Card3D } from './Card3D';

interface ResumeProps {
  resume: ResumeData;
  profile: Profile;
  onOpenAdmin: () => void;
}

export const Resume: React.FC<ResumeProps> = ({ resume, profile, onOpenAdmin }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Real client-side PDF document trigger for Bharath S
  const handleDownload = () => {
    if (resume.fileUrl && !resume.fileUrl.startsWith('/resumes/')) {
      const link = document.createElement('a');
      link.href = resume.fileUrl;
      link.download = resume.fileName || 'BHARATH_S_Video_Editor_Resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Generate real formatted resume print / downloadable document
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BHARATH S - Video Editor Resume</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 40px; color: #111; line-height: 1.5; }
          h1 { margin: 0; font-size: 26px; color: #071A35; }
          .header { border-bottom: 2px solid #168BFF; padding-bottom: 15px; margin-bottom: 20px; }
          .sub { font-size: 14px; font-weight: bold; color: #0879D1; text-transform: uppercase; margin-top: 5px; }
          .contact { font-size: 13px; color: #555; margin-top: 5px; }
          h2 { font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px; color: #071A35; text-transform: uppercase; }
          p { font-size: 13px; margin: 6px 0; }
          ul { margin: 6px 0 15px 20px; font-size: 13px; padding: 0; }
          li { margin-bottom: 4px; }
          .badge { display: inline-block; background: #eef6ff; border: 1px solid #c2e0ff; padding: 3px 8px; border-radius: 4px; font-size: 12px; margin-right: 6px; margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BHARATH S</h1>
          <div class="sub">Junior Video Editor & Creative Visual Storyteller</div>
          <div class="contact">
            Phone: ${profile.phone} | Email: ${profile.email} | Location: ${profile.location}
          </div>
        </div>

        <h2>Professional Summary</h2>
        <p>${profile.bio}</p>

        <h2>Technical Skills</h2>
        <div>
          <span class="badge">Adobe Premiere Pro</span>
          <span class="badge">Adobe After Effects</span>
          <span class="badge">Adobe Photoshop</span>
          <span class="badge">Adobe Audition</span>
          <span class="badge">Cinematic Color Grading</span>
          <span class="badge">Audio Synchronization</span>
          <span class="badge">Speed Ramping</span>
          <span class="badge">Kinetic Typography</span>
        </div>

        <h2>Professional Training</h2>
        <p><strong>Adobe Video Editing & Creative Software Course (2024)</strong><br>Arena Animation</p>
        <ul>
          <li>Specialized in timeline sequencing, transitions, and pacing for commercial advertisements.</li>
          <li>Hands-on training in After Effects motion graphics, VFX compositing, and animated text.</li>
          <li>Audio restoration, sound enhancement, and noise reduction with Adobe Audition.</li>
          <li>Thumbnail and digital poster design with Adobe Photoshop.</li>
        </ul>

        <h2>Education</h2>
        <p><strong>Bachelor of Computer Applications (BCA)</strong><br>Indian Arts and Science College</p>

        <h2>Career Vision</h2>
        <p>${profile.vision}</p>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <section id="resume" className="relative py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#168BFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30">
            <FileText className="w-3.5 h-3.5 text-[#27DFFF]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
              Official Curriculum Vitae
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            MY <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">RESUME</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-200">
            Review my complete career overview, technical qualifications, and software proficiencies.
          </p>
        </div>

        {/* Resume Glass Panel with Card3D */}
        <Card3D
          className="max-w-3xl mx-auto glass-panel rounded-3xl p-8 sm:p-12 border-2 border-[#168BFF]/35 shadow-[0_20px_60px_rgba(2,4,10,0.95)] relative overflow-hidden cursor-pointer"
          maxTilt={10}
          scale={1.02}
          glare={true}
        >
          {/* Top Decorative Header (Z: 30px) */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#168BFF]/20 pb-6 mb-8"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#168BFF]/20 to-[#0879D1]/10 border border-[#168BFF]/40 flex items-center justify-center text-[#27DFFF] shadow-[0_0_15px_rgba(22,139,255,0.3)]">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {resume.fileName || 'BHARATH_S_Video_Editor_Resume.pdf'}
                </h3>
                <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#27DFFF]" />
                    <span>Updated: {resume.uploadDate || '2024'}</span>
                  </span>
                  <span>&bull;</span>
                  <span>Size: {resume.fileSize || '420 KB'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Published</span>
              </span>
            </div>
          </div>

          {/* Quick Summary Grid (Z: 25px) */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
            style={{ transform: 'translateZ(25px)' }}
          >
            <div className="p-4 rounded-xl bg-[#030B1C]/85 border border-[#168BFF]/25 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
              <div className="text-[10px] uppercase font-bold text-[#27DFFF] tracking-wider mb-1">
                Role Focus
              </div>
              <div className="text-sm font-semibold text-white">Junior Video Editor</div>
              <div className="text-xs text-slate-300 mt-1">Reels, Advertisements, Visual Storytelling</div>
            </div>

            <div className="p-4 rounded-xl bg-[#030B1C]/85 border border-[#168BFF]/25 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
              <div className="text-[10px] uppercase font-bold text-[#27DFFF] tracking-wider mb-1">
                Core Software
              </div>
              <div className="text-sm font-semibold text-white">Premiere Pro, After Effects</div>
              <div className="text-xs text-slate-300 mt-1">Photoshop &amp; Audition</div>
            </div>
          </div>

          {/* Action Buttons (Z: 35px) */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ transform: 'translateZ(35px)' }}
          >
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-[#071A35] hover:bg-[#168BFF]/20 border border-[#168BFF]/40 hover:border-[#27DFFF] transition-all duration-300 shadow-[0_0_15px_rgba(22,139,255,0.2)]"
            >
              <Eye className="w-4 h-4 text-[#27DFFF]" />
              <span>View Resume Preview</span>
            </button>

            <button
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] shadow-[0_0_25px_rgba(22,139,255,0.4)] hover:shadow-[0_0_35px_rgba(39,223,255,0.6)] transition-all duration-300"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download Official Resume</span>
            </button>
          </div>

          {/* Admin upload hint */}
          <div
            className="mt-8 pt-4 border-t border-[#168BFF]/15 text-center"
            style={{ transform: 'translateZ(20px)' }}
          >
            <button
              onClick={onOpenAdmin}
              className="text-xs text-[#168BFF] hover:text-[#27DFFF] transition-colors"
            >
              Are you Bharath? Manage &amp; upload updated PDF in Admin Dashboard &rarr;
            </button>
          </div>

        </Card3D>

      </div>

      {/* In-Browser Resume Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#02040A]/90 backdrop-blur-xl animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsPreviewOpen(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-[#168BFF]/40 shadow-[0_20px_60px_rgba(2,4,10,0.95)] z-10 flex flex-col p-6 sm:p-10">
            
            <div className="flex items-center justify-between border-b border-[#168BFF]/20 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#27DFFF]" />
                <h3 className="text-xl font-bold text-white">Resume Document Preview</h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resume content preview paper */}
            <div className="bg-[#030B1C] rounded-2xl p-6 sm:p-8 border border-[#168BFF]/20 text-left space-y-6 text-sm text-slate-200">
              <div className="border-b border-[#168BFF]/20 pb-4">
                <h2 className="text-2xl font-extrabold text-white">{profile.name}</h2>
                <div className="text-xs uppercase tracking-wider text-[#27DFFF] font-bold mt-1">
                  {profile.title} &bull; Visual Storyteller
                </div>
                <div className="text-xs text-slate-300 mt-2">
                  Phone: {profile.phone} | Email: {profile.email} | Location: {profile.location}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                  Professional Summary
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">{profile.bio}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                  Software Proficiency
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#168BFF]/20 text-[#27DFFF] text-xs">Adobe Premiere Pro</span>
                  <span className="px-2.5 py-1 rounded bg-[#168BFF]/20 text-[#27DFFF] text-xs">Adobe After Effects</span>
                  <span className="px-2.5 py-1 rounded bg-[#168BFF]/20 text-[#27DFFF] text-xs">Adobe Photoshop</span>
                  <span className="px-2.5 py-1 rounded bg-[#168BFF]/20 text-[#27DFFF] text-xs">Adobe Audition</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                  Professional Training
                </h4>
                <div className="text-xs font-semibold text-white">Adobe Video Editing &amp; Creative Software Course (2024)</div>
                <div className="text-xs text-[#168BFF]">Arena Animation</div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                  Education
                </h4>
                <div className="text-xs font-semibold text-white">Bachelor of Computer Applications (BCA)</div>
                <div className="text-xs text-[#168BFF]">Indian Arts and Science College</div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                  Career Vision
                </h4>
                <p className="text-xs text-slate-200 italic leading-relaxed">"{profile.vision}"</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
