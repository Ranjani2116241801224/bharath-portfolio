import React, { useState, useRef } from 'react';
import {
  Upload,
  Video as VideoIcon,
  Trash2,
  Edit2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Loader2,
  X,
  Search,
  RefreshCw,
  AlertTriangle,
  FolderPlus,
  Image as ImageIcon,
  Calendar,
  Film
} from 'lucide-react';
import { Project, ProjectCategory } from '../../types';
import { StorageService } from '../../services/storageService';

interface VideoManagerProps {
  projects: Project[];
  onRefresh: () => Promise<void>;
  onShowAlert: (msg: string) => void;
}

type SpecificCategory = 'CINEMATIC' | 'ADVERTISEMENT' | 'PROMOTIONAL' | 'SOCIAL MEDIA';

interface StagedVideo {
  videoFile: File;
  previewUrl: string;
  thumbnailFile?: File;
  thumbnailPreview?: string;
  title: string;
  category: SpecificCategory;
  subCategory: string;
  description: string;
  completionDate: string;
}

export const VideoManager: React.FC<VideoManagerProps> = ({
  projects,
  onRefresh,
  onShowAlert
}) => {
  // Filter video projects
  const videos = projects.filter(p => p.mediaType === 'video' || (p.videoUrl && p.videoUrl.length > 0));

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [stagedVideos, setStagedVideos] = useState<StagedVideo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit modal state
  const [editingVideo, setEditingVideo] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<SpecificCategory>('CINEMATIC');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCompletionDate, setEditCompletionDate] = useState('');
  const [editIsPublished, setEditIsPublished] = useState(true);

  // Delete confirmation state
  const [videoToDelete, setVideoToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Video Review Player Modal state
  const [activeReviewVideo, setActiveReviewVideo] = useState<Project | null>(null);

  // Replace video master file refs
  const replaceVideoInputRef = useRef<HTMLInputElement>(null);
  const replaceThumbnailInputRef = useRef<HTMLInputElement>(null);
  const [replacingVideoId, setReplacingVideoId] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: ProjectCategory[] = [
    'ALL',
    'CINEMATIC',
    'ADVERTISEMENT',
    'PROMOTIONAL',
    'SOCIAL MEDIA'
  ];

  // Filtered videos
  const filteredVideos = videos.filter(v => {
    const matchesCategory = activeCategory === 'ALL' || v.category === activeCategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle video files selected for upload
  const handleVideosSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    const newStaged: StagedVideo[] = [];

    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type) && !file.name.endsWith('.mp4') && !file.name.endsWith('.webm')) {
        onShowAlert(`Skipped ${file.name}: only MP4 and WebM video formats are supported.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      newStaged.push({
        videoFile: file,
        previewUrl,
        title: capitalizedTitle,
        category: 'CINEMATIC',
        subCategory: 'Color Grading & Pacing',
        description: 'Cinematic visual reel edited and paced by Bharath S.',
        completionDate: new Date().toISOString().split('T')[0]
      });
    });

    setStagedVideos(prev => [...prev, ...newStaged]);
    setIsUploadModalOpen(true);
  };

  const removeStagedVideo = (index: number) => {
    setStagedVideos(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      if (prev[index].thumbnailPreview) URL.revokeObjectURL(prev[index].thumbnailPreview!);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload and publish all staged videos
  const handleUploadAllStaged = async () => {
    if (stagedVideos.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const total = stagedVideos.length;
      for (let i = 0; i < total; i++) {
        const item = stagedVideos[i];

        // 1. Upload video file to Supabase storage (or data URL fallback)
        const uploadedVideo = await StorageService.uploadFile(item.videoFile, 'videos');
        setUploadProgress(Math.round(((i + 0.6) / total) * 100));

        // 2. Upload thumbnail if custom, else use default video poster
        let thumbUrl = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80';
        if (item.thumbnailFile) {
          const uploadedThumb = await StorageService.uploadFile(item.thumbnailFile, 'photos');
          thumbUrl = uploadedThumb.url;
        }

        // 3. Save project record
        const newProject: Project = {
          id: 'video-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          title: item.title,
          description: item.description,
          category: item.category,
          subCategory: item.subCategory,
          completionDate: item.completionDate,
          thumbnail: thumbUrl,
          videoUrl: uploadedVideo.url,
          mediaType: 'video',
          isPublished: true,
          isDemo: false,
          sortOrder: Date.now(),
          createdAt: new Date().toISOString(),
          mediaFiles: [
            {
              id: 'media-vid-' + Date.now(),
              url: uploadedVideo.url,
              type: 'video',
              name: item.videoFile.name,
              size: item.videoFile.size
            }
          ]
        };

        await StorageService.saveProject(newProject);
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      onShowAlert(`Successfully uploaded and published ${total} video(s)!`);
      stagedVideos.forEach(v => {
        URL.revokeObjectURL(v.previewUrl);
        if (v.thumbnailPreview) URL.revokeObjectURL(v.thumbnailPreview);
      });
      setStagedVideos([]);
      setIsUploadModalOpen(false);
      await onRefresh();
    } catch (err) {
      console.error('Video upload error:', err);
      onShowAlert('Error uploading videos. Please check file sizes and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Open Edit Modal
  const openEditModal = (video: Project) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditCategory(video.category);
    setEditSubCategory(video.subCategory || '');
    setEditDescription(video.description);
    setEditCompletionDate(video.completionDate || '');
    setEditIsPublished(video.isPublished);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const updated: Project = {
      ...editingVideo,
      title: editTitle,
      category: editCategory,
      subCategory: editSubCategory,
      description: editDescription,
      completionDate: editCompletionDate,
      isPublished: editIsPublished
    };

    await StorageService.saveProject(updated);
    onShowAlert('Video details updated successfully!');
    setEditingVideo(null);
    await onRefresh();
  };

  // Toggle publish
  const handleTogglePublish = async (video: Project) => {
    await StorageService.togglePublishProject(video.id, !video.isPublished);
    onShowAlert(video.isPublished ? 'Video unpublished.' : 'Video published to public portfolio!');
    await onRefresh();
  };

  // Trigger replace video file
  const triggerReplaceVideo = (videoId: string) => {
    setReplacingVideoId(videoId);
    if (replaceVideoInputRef.current) {
      replaceVideoInputRef.current.click();
    }
  };

  // Handle replace video file
  const handleReplaceVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingVideoId) return;

    setIsReplacing(true);
    try {
      const target = videos.find(v => v.id === replacingVideoId);
      if (target) {
        if (target.videoUrl) {
          await StorageService.deleteFile(target.videoUrl, 'videos');
        }

        const uploaded = await StorageService.uploadFile(file, 'videos');
        const updated: Project = {
          ...target,
          videoUrl: uploaded.url,
          mediaFiles: [
            {
              id: 'media-' + Date.now(),
              url: uploaded.url,
              type: 'video',
              name: file.name,
              size: file.size
            }
          ]
        };

        await StorageService.saveProject(updated);
        onShowAlert('Video master replaced successfully!');
        await onRefresh();
      }
    } catch {
      onShowAlert('Failed to replace video file.');
    } finally {
      setIsReplacing(false);
      setReplacingVideoId(null);
      if (replaceVideoInputRef.current) replaceVideoInputRef.current.value = '';
    }
  };

  // Trigger replace thumbnail
  const triggerReplaceThumbnail = (videoId: string) => {
    setReplacingVideoId(videoId);
    if (replaceThumbnailInputRef.current) {
      replaceThumbnailInputRef.current.click();
    }
  };

  // Handle replace thumbnail
  const handleReplaceThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingVideoId) return;

    setIsReplacing(true);
    try {
      const target = videos.find(v => v.id === replacingVideoId);
      if (target) {
        const uploaded = await StorageService.uploadFile(file, 'photos');
        const updated: Project = {
          ...target,
          thumbnail: uploaded.url
        };

        await StorageService.saveProject(updated);
        onShowAlert('Video cover thumbnail updated!');
        await onRefresh();
      }
    } catch {
      onShowAlert('Failed to update thumbnail.');
    } finally {
      setIsReplacing(false);
      setReplacingVideoId(null);
      if (replaceThumbnailInputRef.current) replaceThumbnailInputRef.current.value = '';
    }
  };

  // Delete video
  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);

    try {
      if (videoToDelete.videoUrl) {
        await StorageService.deleteFile(videoToDelete.videoUrl, 'videos');
      }
      if (videoToDelete.thumbnail && !videoToDelete.thumbnail.includes('unsplash.com')) {
        await StorageService.deleteFile(videoToDelete.thumbnail, 'photos');
      }

      await StorageService.deleteProject(videoToDelete.id);
      onShowAlert(`Video "${videoToDelete.title}" permanently deleted.`);
      setVideoToDelete(null);
      await onRefresh();
    } catch {
      onShowAlert('Failed to delete video.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Hidden file input for video replace */}
      <input
        type="file"
        ref={replaceVideoInputRef}
        onChange={handleReplaceVideoFileChange}
        accept="video/mp4,video/webm"
        className="hidden"
      />

      {/* Hidden file input for thumbnail replace */}
      <input
        type="file"
        ref={replaceThumbnailInputRef}
        onChange={handleReplaceThumbnailChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Hidden file input for main video upload */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={(e) => handleVideosSelected(e.target.files)}
        accept="video/mp4,video/webm"
        className="hidden"
      />

      {/* Header and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#168BFF]/20 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <VideoIcon className="w-6 h-6 text-[#27DFFF]" />
            <h2 className="text-2xl font-bold text-white">Video Management</h2>
          </div>
          <p className="text-xs text-slate-200 mt-1">
            Upload, preview with full playback controls, edit, replace masters, and delete video reels.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] shadow-[0_0_20px_rgba(22,139,255,0.4)] transition-all transform hover:-translate-y-0.5"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ Upload Videos</span>
        </button>
      </div>

      {/* Drag & Drop Quick Upload Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleVideosSelected(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragging
            ? 'border-[#27DFFF] bg-[#168BFF]/20 scale-[1.01]'
            : 'border-[#168BFF]/30 hover:border-[#27DFFF]/60 bg-[#030B1C]/60 hover:bg-[#071A35]/50'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-[#168BFF]/20 text-[#27DFFF] flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(39,223,255,0.2)]">
          <Film className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">
          Drag &amp; drop video files here, or <span className="text-[#27DFFF] underline">browse files</span>
        </h4>
        <p className="text-xs text-slate-300 mt-1">
          Supports MP4 and WebM formats. Professional in-browser preview player included.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#168BFF] text-white shadow-[0_0_12px_rgba(39,223,255,0.4)]'
                  : 'bg-[#030B1C] text-slate-300 hover:text-white border border-[#168BFF]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white placeholder-slate-400 text-xs focus:border-[#27DFFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-[#168BFF]/20 space-y-3">
          <VideoIcon className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Videos Found</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Upload your commercial cuts, cinematic edits, Instagram reels, and YouTube shorts.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]"
          >
            + Upload First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group glass-panel rounded-2xl border border-[#168BFF]/25 hover:border-[#27DFFF]/60 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-[0_8px_25px_rgba(2,4,10,0.8)]"
            >
              {/* Video Thumbnail with Play Trigger */}
              <div>
                <div className="relative aspect-video bg-[#071A35] overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-transparent to-transparent opacity-70" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#02040A]/90 text-[#27DFFF] border border-[#27DFFF]/40">
                      {video.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        video.isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {video.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Center Play Button Overlay */}
                  <button
                    onClick={() => setActiveReviewVideo(video)}
                    className="absolute inset-0 flex items-center justify-center bg-[#02040A]/40 group-hover:bg-[#02040A]/20 transition-all"
                    title="Play and Review Video"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#168BFF] to-[#27DFFF] p-0.5 shadow-[0_0_20px_rgba(39,223,255,0.6)] transform group-hover:scale-110 transition-transform flex items-center justify-center">
                      <div className="w-full h-full bg-[#02040A] rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-[#27DFFF] fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>{video.subCategory || 'Reel Edit'}</span>
                    {video.completionDate && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#27DFFF]" />
                        <span>{video.completionDate}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{video.title}</h4>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="p-4 pt-2 border-t border-[#168BFF]/15 flex items-center justify-between">
                <button
                  onClick={() => handleTogglePublish(video)}
                  className={`text-[11px] font-semibold transition-colors ${
                    video.isPublished
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {video.isPublished ? 'Unpublish' : 'Publish to Live'}
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveReviewVideo(video)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-[#27DFFF] hover:bg-white/5 transition-colors"
                    title="Review Player"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => triggerReplaceVideo(video.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-[#27DFFF] hover:bg-white/5 transition-colors"
                    title="Replace Video Master File"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => triggerReplaceThumbnail(video.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-[#27DFFF] hover:bg-white/5 transition-colors"
                    title="Replace Cover Thumbnail"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(video)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit Metadata"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setVideoToDelete(video)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 1. UPLOAD MULTIPLE VIDEOS MODAL WITH PREVIEW */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-[#168BFF]/40 shadow-[0_20px_60px_rgba(2,4,10,0.95)] z-10 flex flex-col p-6 sm:p-8">
            
            <div className="flex items-center justify-between border-b border-[#168BFF]/20 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <Film className="w-5 h-5 text-[#27DFFF]" />
                <h3 className="text-lg font-bold text-white">Upload New Videos ({stagedVideos.length})</h3>
              </div>
              <button
                onClick={() => {
                  stagedVideos.forEach(v => URL.revokeObjectURL(v.previewUrl));
                  setStagedVideos([]);
                  setIsUploadModalOpen(false);
                }}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="mb-6 p-4 rounded-2xl bg-[#030B1C] border border-[#168BFF]/30 space-y-2">
                <div className="flex justify-between text-xs text-white">
                  <span>Uploading video masters to storage...</span>
                  <span className="font-bold text-[#27DFFF]">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#168BFF] to-[#27DFFF] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* List of staged videos with interactive players */}
            <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1">
              {stagedVideos.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#030B1C]/90 border border-[#168BFF]/25 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Interactive Video Preview Player */}
                    <div className="w-full sm:w-56 aspect-video bg-black rounded-xl overflow-hidden border border-[#168BFF]/30 flex-shrink-0 shadow-lg">
                      <video
                        src={item.previewUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#27DFFF]">
                          File: {item.videoFile.name} ({(item.videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                        <button
                          onClick={() => removeStagedVideo(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={item.title}
                          placeholder="Video Title"
                          onChange={(e) => {
                            const val = e.target.value;
                            setStagedVideos(prev => {
                              const copy = [...prev];
                              copy[idx].title = val;
                              return copy;
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#071A35]/60 border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                        />

                        <select
                          value={item.category}
                          onChange={(e) => {
                            const val = e.target.value as SpecificCategory;
                            setStagedVideos(prev => {
                              const copy = [...prev];
                              copy[idx].category = val;
                              return copy;
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#071A35]/60 border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                        >
                          <option value="CINEMATIC">CINEMATIC</option>
                          <option value="ADVERTISEMENT">ADVERTISEMENT</option>
                          <option value="PROMOTIONAL">PROMOTIONAL</option>
                          <option value="SOCIAL MEDIA">SOCIAL MEDIA</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        value={item.subCategory}
                        placeholder="Subcategory / Specialty (e.g. Speed Ramping)"
                        onChange={(e) => {
                          const val = e.target.value;
                          setStagedVideos(prev => {
                            const copy = [...prev];
                            copy[idx].subCategory = val;
                            return copy;
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#071A35]/60 border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                      />

                      <textarea
                        rows={2}
                        value={item.description}
                        placeholder="Video description..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setStagedVideos(prev => {
                            const copy = [...prev];
                            copy[idx].description = val;
                            return copy;
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#071A35]/60 border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-[#168BFF]/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#27DFFF] hover:underline"
              >
                + Add more videos
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploading || stagedVideos.length === 0}
                  onClick={handleUploadAllStaged}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] shadow-[0_0_20px_rgba(22,139,255,0.4)] disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Videos...</span>
                    </>
                  ) : (
                    <span>Save &amp; Publish Videos</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. EDIT VIDEO METADATA MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-[#168BFF]/40 shadow-[0_20px_60px_rgba(2,4,10,0.95)] z-10 flex flex-col p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#168BFF]/20 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white">Edit Video Details</h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-slate-200">Video Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as SpecificCategory)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                  >
                    <option value="CINEMATIC">CINEMATIC</option>
                    <option value="ADVERTISEMENT">ADVERTISEMENT</option>
                    <option value="PROMOTIONAL">PROMOTIONAL</option>
                    <option value="SOCIAL MEDIA">SOCIAL MEDIA</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-slate-200">Sub-Category</label>
                  <input
                    type="text"
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-slate-200">Completion Date</label>
                <input
                  type="date"
                  value={editCompletionDate}
                  onChange={(e) => setEditCompletionDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-slate-200">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none resize-none"
                />
              </div>

              <label className="flex items-center space-x-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={editIsPublished}
                  onChange={(e) => setEditIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[#168BFF] focus:ring-[#27DFFF]"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Visible in public video portfolio
                </span>
              </label>

              <div className="pt-4 border-t border-[#168BFF]/20 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CONFIRM DELETE MODAL */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-rose-500/40 shadow-[0_20px_60px_rgba(2,4,10,0.95)] z-10 p-6 sm:p-8 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-white">Permanently Delete Video?</h3>
            <p className="text-xs text-slate-200">
              Are you sure you want to delete <strong className="text-white">"{videoToDelete.title}"</strong>?
              This will remove the video master file from your storage and public portfolio.
            </p>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => setVideoToDelete(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)] disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Video</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFESSIONAL VIDEO REVIEW PLAYER MODAL */}
      {activeReviewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/95 backdrop-blur-2xl animate-fadeIn">
          <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-[#168BFF]/40 shadow-[0_25px_70px_rgba(2,4,10,0.98)] overflow-hidden">
            
            <div className="flex items-center justify-between p-4 px-6 border-b border-[#168BFF]/20 bg-[#030B1C]">
              <div className="flex items-center space-x-2">
                <VideoIcon className="w-4 h-4 text-[#27DFFF]" />
                <h3 className="text-sm font-bold text-white line-clamp-1">{activeReviewVideo.title}</h3>
              </div>
              <button
                onClick={() => setActiveReviewVideo(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
              {activeReviewVideo.videoUrl ? (
                <video
                  src={activeReviewVideo.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  <Film className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-300">No raw video stream found. Replace master file above.</p>
                </div>
              )}
            </div>

            <div className="p-4 px-6 bg-[#030B1C]/90 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#27DFFF]">{activeReviewVideo.category}</span>
                <p className="text-xs text-slate-300">{activeReviewVideo.description}</p>
              </div>
              <button
                onClick={() => setActiveReviewVideo(null)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-white/5"
              >
                Close Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
