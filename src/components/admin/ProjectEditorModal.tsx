import React, { useState } from 'react';
import {
  X,
  Upload,
  Film,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Project, ProjectCategory } from '../../types';
import { StorageService } from '../../services/storageService';

interface ProjectEditorModalProps {
  project?: Project | null;
  onSave: (project: Project) => void;
  onClose: () => void;
}

export const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({
  project,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [category, setCategory] = useState<ProjectCategory>(project?.category || 'CINEMATIC');
  const [subCategory, setSubCategory] = useState(project?.subCategory || '');
  const [completionDate, setCompletionDate] = useState(
    project?.completionDate || new Date().toISOString().split('T')[0]
  );
  const [thumbnail, setThumbnail] = useState(
    project?.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80'
  );
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl || '');
  const [mediaType, setMediaType] = useState<'video' | 'photo'>(project?.mediaType || 'video');
  const [isPublished, setIsPublished] = useState(project ? project.isPublished : true);
  const [isDemo, setIsDemo] = useState(project ? project.isDemo : false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Handle Thumbnail File Upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress('Uploading thumbnail image...');
    try {
      const res = await StorageService.uploadFile(file, 'photos');
      setThumbnail(res.url);
      setUploadProgress('Thumbnail uploaded successfully!');
      setTimeout(() => setUploadProgress(''), 2500);
    } catch (err) {
      console.error(err);
      setUploadProgress('Failed to upload thumbnail.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Video / Media File Upload
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(`Processing ${file.name}...`);
    try {
      const isVideo = file.type.startsWith('video');
      const folder = isVideo ? 'videos' : 'photos';
      const res = await StorageService.uploadFile(file, folder);

      if (isVideo) {
        setVideoUrl(res.url);
        setMediaType('video');
      } else {
        setThumbnail(res.url);
        setMediaType('photo');
      }
      setUploadProgress('Media file processed and linked!');
      setTimeout(() => setUploadProgress(''), 2500);
    } catch (err) {
      console.error(err);
      setUploadProgress('Failed to upload media file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const savedProject: Project = {
      id: project?.id || 'proj-' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: category === 'ALL' ? 'CINEMATIC' : category,
      subCategory: subCategory.trim() || undefined,
      completionDate,
      thumbnail: thumbnail.trim(),
      videoUrl: videoUrl.trim() || undefined,
      mediaType,
      isPublished,
      isDemo,
      sortOrder: project?.sortOrder ?? 0,
      createdAt: project?.createdAt || new Date().toISOString()
    };

    onSave(savedProject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#02040A]/95 backdrop-blur-2xl animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto glass-panel rounded-3xl border border-[#168BFF]/40 shadow-[0_25px_70px_rgba(2,4,10,0.95)] z-10 p-6 sm:p-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#168BFF]/25 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#168BFF] to-[#0879D1] flex items-center justify-center text-white">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {project ? 'Edit Portfolio Project' : 'Upload New Project'}
              </h3>
              <p className="text-xs text-slate-200">
                Upload photos, videos, or specify cloud stream links
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadProgress && (
          <div className="mb-4 p-3 rounded-xl bg-[#168BFF]/15 border border-[#27DFFF]/40 text-xs text-[#27DFFF] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-slate-200 tracking-wider">
                Project Title <span className="text-[#27DFFF]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Neon Drift – Urban Cinematic Reel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm focus:border-[#27DFFF] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-slate-200 tracking-wider">
                Category <span className="text-[#27DFFF]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-4 py-3 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm focus:border-[#27DFFF] focus:outline-none"
              >
                <option value="CINEMATIC">CINEMATIC (Reels &amp; Effects)</option>
                <option value="ADVERTISEMENT">ADVERTISEMENT (Commercials &amp; Promos)</option>
                <option value="PROMOTIONAL">PROMOTIONAL (Product Showcases)</option>
                <option value="SOCIAL MEDIA">SOCIAL MEDIA (Instagram &amp; Shorts)</option>
              </select>
            </div>
          </div>

          {/* Sub-Category & Completion Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-slate-200 tracking-wider">
                Sub-Specialty / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Instagram Reels, Color Grading, Sound Sync"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm focus:border-[#27DFFF] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-slate-200 tracking-wider">
                Completion Date
              </label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm focus:border-[#27DFFF] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold text-slate-200 tracking-wider">
              Project Description <span className="text-[#27DFFF]">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detail the video editing techniques, pacing, software tools, and creative choices used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-sm focus:border-[#27DFFF] focus:outline-none resize-none"
            />
          </div>

          {/* File Upload Section: Thumbnail & Video */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#030B1C]/80 border border-[#168BFF]/20">
            {/* Thumbnail Upload */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-bold text-white tracking-wider flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-[#27DFFF]" />
                <span>Project Thumbnail (Image)</span>
              </label>

              <div className="flex items-center space-x-3">
                <div className="w-20 h-14 rounded-lg bg-[#071A35] overflow-hidden border border-[#168BFF]/30 flex-shrink-0">
                  <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
                <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#168BFF]/20 hover:bg-[#168BFF]/30 border border-[#27DFFF]/40 text-xs text-white">
                  <Upload className="w-3.5 h-3.5 text-[#27DFFF]" />
                  <span>Choose JPG/PNG</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                </label>
              </div>

              <input
                type="text"
                placeholder="Or paste image URL"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#02040A] border border-[#168BFF]/30 text-xs text-white"
              />
            </div>

            {/* Video File / URL */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-bold text-white tracking-wider flex items-center space-x-1.5">
                <Film className="w-4 h-4 text-[#27DFFF]" />
                <span>Project Video (MP4/WebM)</span>
              </label>

              <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#0879D1] text-xs font-semibold text-white shadow-[0_0_15px_rgba(22,139,255,0.3)]">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Video File (MP4/WebM)</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
              </label>

              <input
                type="text"
                placeholder="Or paste video stream URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#02040A] border border-[#168BFF]/30 text-xs text-white"
              />
            </div>
          </div>

          {/* Status Toggles: Published & Demo Tag */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-[#168BFF] focus:ring-[#27DFFF]"
              />
              <span className="text-xs font-semibold text-white">
                Publish publicly on website
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDemo}
                onChange={(e) => setIsDemo(e.target.checked)}
                className="w-4 h-4 rounded text-[#168BFF] focus:ring-[#27DFFF]"
              />
              <span className="text-xs font-semibold text-slate-200">
                Mark as Demonstration Sample
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#168BFF]/20 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] shadow-[0_0_20px_rgba(22,139,255,0.4)] disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>SAVE &amp; PUBLISH PROJECT</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
