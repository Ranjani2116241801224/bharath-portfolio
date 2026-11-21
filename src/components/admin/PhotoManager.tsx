import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  Loader2,
  X,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  FolderPlus
} from 'lucide-react';
import { Project, ProjectCategory } from '../../types';
import { StorageService } from '../../services/storageService';

interface PhotoManagerProps {
  projects: Project[];
  onRefresh: () => Promise<void>;
  onShowAlert: (msg: string) => void;
}

type SpecificCategory = 'CINEMATIC' | 'ADVERTISEMENT' | 'PROMOTIONAL' | 'SOCIAL MEDIA';

interface StagedPhoto {
  file: File;
  previewUrl: string;
  title: string;
  category: SpecificCategory;
  description: string;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  projects,
  onRefresh,
  onShowAlert
}) => {
  // Filter only photo projects or projects without video
  const photos = projects.filter(p => p.mediaType === 'photo' || !p.videoUrl);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit modal state
  const [editingPhoto, setEditingPhoto] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<SpecificCategory>('CINEMATIC');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublished, setEditIsPublished] = useState(true);

  // Delete confirmation state
  const [photoToDelete, setPhotoToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview Lightbox state
  const [previewPhoto, setPreviewPhoto] = useState<Project | null>(null);

  // Replace photo file ref
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: ProjectCategory[] = [
    'ALL',
    'CINEMATIC',
    'ADVERTISEMENT',
    'PROMOTIONAL',
    'SOCIAL MEDIA'
  ];

  // Filtered photos
  const filteredPhotos = photos.filter(p => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle file staging for upload
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const newStaged: StagedPhoto[] = [];

    Array.from(files).forEach((file) => {
      if (!allowed.includes(file.type)) {
        onShowAlert(`Skipped ${file.name}: only JPG, PNG, and WebP are supported.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      newStaged.push({
        file,
        previewUrl,
        title: capitalizedTitle,
        category: 'CINEMATIC',
        description: 'High-resolution creative still frame by Bharath S.'
      });
    });

    setStagedPhotos(prev => [...prev, ...newStaged]);
    setIsUploadModalOpen(true);
  };

  const removeStagedPhoto = (index: number) => {
    setStagedPhotos(prev => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload and publish all staged photos
  const handleUploadAllStaged = async () => {
    if (stagedPhotos.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const total = stagedPhotos.length;
      for (let i = 0; i < total; i++) {
        const item = stagedPhotos[i];
        
        // 1. Upload photo to Supabase storage (or data URL fallback)
        const uploaded = await StorageService.uploadFile(item.file, 'photos');
        setUploadProgress(Math.round(((i + 0.8) / total) * 100));

        // 2. Save project record
        const newProject: Project = {
          id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          title: item.title,
          description: item.description,
          category: item.category,
          subCategory: 'Photography & Stills',
          completionDate: new Date().toISOString().split('T')[0],
          thumbnail: uploaded.url,
          mediaType: 'photo',
          isPublished: true,
          isDemo: false,
          sortOrder: Date.now(),
          createdAt: new Date().toISOString(),
          mediaFiles: [
            {
              id: 'media-' + Date.now(),
              url: uploaded.url,
              type: 'photo',
              name: item.file.name,
              size: item.file.size
            }
          ]
        };

        await StorageService.saveProject(newProject);
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      onShowAlert(`Successfully uploaded and published ${total} photo(s)!`);
      stagedPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
      setStagedPhotos([]);
      setIsUploadModalOpen(false);
      await onRefresh();
    } catch (err) {
      console.error('Photo upload error:', err);
      onShowAlert('Error uploading photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Open Edit Modal
  const openEditModal = (photo: Project) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditCategory(photo.category);
    setEditDescription(photo.description);
    setEditIsPublished(photo.isPublished);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const updated: Project = {
      ...editingPhoto,
      title: editTitle,
      category: editCategory,
      description: editDescription,
      isPublished: editIsPublished
    };

    await StorageService.saveProject(updated);
    onShowAlert('Photo details updated successfully!');
    setEditingPhoto(null);
    await onRefresh();
  };

  // Toggle publish
  const handleTogglePublish = async (photo: Project) => {
    await StorageService.togglePublishProject(photo.id, !photo.isPublished);
    onShowAlert(photo.isPublished ? 'Photo unpublished.' : 'Photo published to portfolio!');
    await onRefresh();
  };

  // Trigger replace
  const triggerReplacePhoto = (photoId: string) => {
    setReplacingPhotoId(photoId);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  // Handle replace file
  const handleReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingPhotoId) return;

    setIsReplacing(true);
    try {
      const target = photos.find(p => p.id === replacingPhotoId);
      if (target) {
        // Delete old file from storage if Supabase
        await StorageService.deleteFile(target.thumbnail, 'photos');

        // Upload new file
        const uploaded = await StorageService.uploadFile(file, 'photos');
        const updated: Project = {
          ...target,
          thumbnail: uploaded.url,
          mediaFiles: [
            {
              id: 'media-' + Date.now(),
              url: uploaded.url,
              type: 'photo',
              name: file.name,
              size: file.size
            }
          ]
        };

        await StorageService.saveProject(updated);
        onShowAlert('Photo replaced successfully!');
        await onRefresh();
      }
    } catch {
      onShowAlert('Failed to replace photo file.');
    } finally {
      setIsReplacing(false);
      setReplacingPhotoId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  // Delete photo
  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    setIsDeleting(true);

    try {
      // 1. Delete media file from Supabase storage
      if (photoToDelete.thumbnail) {
        await StorageService.deleteFile(photoToDelete.thumbnail, 'photos');
      }

      // 2. Delete project database record
      await StorageService.deleteProject(photoToDelete.id);

      onShowAlert(`Photo "${photoToDelete.title}" permanently deleted.`);
      setPhotoToDelete(null);
      await onRefresh();
    } catch {
      onShowAlert('Failed to delete photo.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Hidden file input for replace */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Hidden file input for main upload */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Section Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#168BFF]/20 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-6 h-6 text-[#27DFFF]" />
            <h2 className="text-2xl font-bold text-white">Photo Management</h2>
          </div>
          <p className="text-xs text-slate-200 mt-1">
            Upload, preview, organize, replace, and delete high-resolution still frames and creative photos.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] shadow-[0_0_20px_rgba(22,139,255,0.4)] transition-all transform hover:-translate-y-0.5"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ Upload Photos</span>
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
          handleFilesSelected(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragging
            ? 'border-[#27DFFF] bg-[#168BFF]/20 scale-[1.01]'
            : 'border-[#168BFF]/30 hover:border-[#27DFFF]/60 bg-[#030B1C]/60 hover:bg-[#071A35]/50'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-[#168BFF]/20 text-[#27DFFF] flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(39,223,255,0.2)]">
          <Upload className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">
          Drag &amp; drop multiple photos here, or <span className="text-[#27DFFF] underline">browse files</span>
        </h4>
        <p className="text-xs text-slate-300 mt-1">
          Supports JPG, JPEG, PNG, and WebP. Multiple files supported.
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
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white placeholder-slate-400 text-xs focus:border-[#27DFFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-[#168BFF]/20 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Photos Uploaded Yet</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Upload your behind-the-scenes photography, color grading stills, or graphic thumbnails to showcase in the portfolio.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]"
          >
            + Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group glass-panel rounded-2xl border border-[#168BFF]/25 hover:border-[#27DFFF]/60 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-[0_8px_25px_rgba(2,4,10,0.8)]"
            >
              {/* Photo Image Card */}
              <div>
                <div className="relative aspect-video bg-[#071A35] overflow-hidden">
                  <img
                    src={photo.thumbnail}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#02040A]/90 text-[#27DFFF] border border-[#27DFFF]/40">
                      {photo.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        photo.isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {photo.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 bg-[#02040A]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#168BFF]/30 text-white transition-colors"
                      title="Inspect Full Size"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(photo)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#168BFF]/30 text-white transition-colors"
                      title="Edit Photo Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => triggerReplacePhoto(photo.id)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#27DFFF]/30 text-[#27DFFF] transition-colors"
                      title="Replace Image File"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1.5">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{photo.title}</h4>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {photo.description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="p-4 pt-2 border-t border-[#168BFF]/15 flex items-center justify-between">
                <button
                  onClick={() => handleTogglePublish(photo)}
                  className={`text-[11px] font-semibold transition-colors ${
                    photo.isPublished
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {photo.isPublished ? 'Unpublish' : 'Publish to Live'}
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(photo)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPhotoToDelete(photo)}
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

      {/* 1. UPLOAD MULTIPLE PHOTOS MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-[#168BFF]/40 shadow-[0_20px_60px_rgba(2,4,10,0.95)] z-10 flex flex-col p-6 sm:p-8">
            
            <div className="flex items-center justify-between border-b border-[#168BFF]/20 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-[#27DFFF]" />
                <h3 className="text-lg font-bold text-white">Upload New Photos ({stagedPhotos.length})</h3>
              </div>
              <button
                onClick={() => {
                  stagedPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
                  setStagedPhotos([]);
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
                  <span>Uploading photos to storage...</span>
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

            {/* List of staged photos */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {stagedPhotos.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#030B1C]/90 border border-[#168BFF]/25 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.title}
                    className="w-20 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                  />
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={item.title}
                      placeholder="Photo title"
                      onChange={(e) => {
                        const val = e.target.value;
                        setStagedPhotos(prev => {
                          const copy = [...prev];
                          copy[idx].title = val;
                          return copy;
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#071A35]/60 border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                    />
                    <div className="flex items-center space-x-2">
                      <select
                        value={item.category}
                        onChange={(e) => {
                          const val = e.target.value as SpecificCategory;
                          setStagedPhotos(prev => {
                            const copy = [...prev];
                            copy[idx].category = val;
                            return copy;
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#071A35]/60 border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                      >
                        <option value="CINEMATIC">CINEMATIC</option>
                        <option value="ADVERTISEMENT">ADVERTISEMENT</option>
                        <option value="PROMOTIONAL">PROMOTIONAL</option>
                        <option value="SOCIAL MEDIA">SOCIAL MEDIA</option>
                      </select>
                      <span className="text-[11px] text-slate-400">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStagedPhoto(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
                + Add more photos
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
                  disabled={isUploading || stagedPhotos.length === 0}
                  onClick={handleUploadAllStaged}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] shadow-[0_0_20px_rgba(22,139,255,0.4)] disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Storage...</span>
                    </>
                  ) : (
                    <span>Save &amp; Publish Photos</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. EDIT PHOTO METADATA MODAL */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-[#168BFF]/40 shadow-[0_20px_60px_rgba(2,4,10,0.95)] z-10 flex flex-col p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#168BFF]/20 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white">Edit Photo Details</h3>
              <button
                onClick={() => setEditingPhoto(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-slate-200">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#030B1C] border border-[#168BFF]/30 text-white text-xs focus:border-[#27DFFF] focus:outline-none"
                />
              </div>

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
                  Visible in public portfolio gallery
                </span>
              </label>

              <div className="pt-4 border-t border-[#168BFF]/20 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
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
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-rose-500/40 shadow-[0_20px_60px_rgba(2,4,10,0.95)] z-10 p-6 sm:p-8 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-white">Permanently Delete Photo?</h3>
            <p className="text-xs text-slate-200">
              Are you sure you want to delete <strong className="text-white">"{photoToDelete.title}"</strong>?
              This will remove the photo from your storage and public portfolio.
            </p>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
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
                  <span>Yes, Delete Photo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. LIGHTBOX PREVIEW MODAL */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02040A]/95 backdrop-blur-2xl animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto.thumbnail}
              alt={previewPhoto.title}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-[0_0_50px_rgba(39,223,255,0.3)] border border-[#168BFF]/30"
            />
            <div className="mt-4 text-center">
              <h4 className="text-base font-bold text-white">{previewPhoto.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{previewPhoto.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
