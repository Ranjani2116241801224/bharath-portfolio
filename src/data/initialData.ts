import {
  Profile,
  Project,
  Service,
  TechnicalSkill,
  PersonalStrength,
  EducationItem,
  TrainingItem,
  ResumeData,
  SocialLink,
  WebsiteSettings
} from '../types';

export const initialProfile: Profile = {
  name: 'BHARATH S',
  title: 'JUNIOR VIDEO EDITOR',
  smallHeading: 'ASPIRING VIDEO EDITOR | VISUAL STORYTELLER',
  tagline: 'Turning Raw Footage Into Visual Stories.',
  bio: 'Creative and detail-oriented aspiring Video Editor with hands-on training in Adobe Creative Cloud applications, including Adobe Premiere Pro, After Effects, Photoshop and Audition. Skilled in creating engaging social media reels, promotional videos, advertisement reels and cinematic edits. Familiar with video editing, audio enhancement, visual effects, motion graphics and image manipulation. Eager to apply creative skills, learn new techniques and contribute to a professional video production team.',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  location: 'Krishnarajapuram, Bengaluru, Karnataka, India',
  phone: '+91 9585268336',
  email: 'sbarath1605@gmail.com',
  vision: 'To begin my career as a Junior Video Editor in a creative media or digital marketing company where I can develop my editing skills, contribute to creative projects and grow professionally.'
};

export const initialProjects: Project[] = [
  {
    id: 'demo-proj-1',
    title: 'Neon Drift – Urban Cinematic Reel',
    description: 'Dynamic color graded cinematic cut with speed ramping, multi-angle pacing, glitch transitions, and cinematic sound design.',
    category: 'CINEMATIC',
    subCategory: 'Cinematic Reels',
    completionDate: '2024-10-15',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mediaType: 'video',
    isPublished: true,
    isDemo: true,
    sortOrder: 1,
    featured: true,
    createdAt: '2024-10-15T10:00:00.000Z'
  },
  {
    id: 'demo-proj-2',
    title: 'Aura Sportswear – Commercial Ad',
    description: 'High-octane advertisement cut showcasing apparel motion, synchronized beat drops, and bold typography animations.',
    category: 'ADVERTISEMENT',
    subCategory: 'Advertisement Reels',
    completionDate: '2024-11-02',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    mediaType: 'video',
    isPublished: true,
    isDemo: true,
    sortOrder: 2,
    featured: true,
    createdAt: '2024-11-02T12:00:00.000Z'
  },
  {
    id: 'demo-proj-3',
    title: 'Chrono Pulse – Product Promotion Showcase',
    description: 'Luxury watch promo video featuring macro focus reveals, smooth 3D rotational transitions, and clean studio lighting enhancements.',
    category: 'PROMOTIONAL',
    subCategory: 'Product Promotion Videos',
    completionDate: '2024-09-20',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    mediaType: 'video',
    isPublished: true,
    isDemo: true,
    sortOrder: 3,
    featured: false,
    createdAt: '2024-09-20T14:30:00.000Z'
  },
  {
    id: 'demo-proj-4',
    title: 'Velocity Beat – High Retention Social Reel',
    description: 'Optimized vertical cut for Instagram Reels and YouTube Shorts featuring kinetic captions, audio hits, and fast hook framing.',
    category: 'SOCIAL MEDIA',
    subCategory: 'Instagram Reels',
    completionDate: '2024-11-10',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    mediaType: 'video',
    isPublished: true,
    isDemo: true,
    sortOrder: 4,
    featured: true,
    createdAt: '2024-11-10T16:00:00.000Z'
  },
  {
    id: 'demo-proj-5',
    title: 'Cyber Mirage – Visual Effects & Motion Graphics',
    description: 'Created with After Effects: holographic UI HUD elements, seamless whip pans, and chromatic aberration effects.',
    category: 'CINEMATIC',
    subCategory: 'Basic Motion Graphics',
    completionDate: '2024-08-18',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    mediaType: 'video',
    isPublished: true,
    isDemo: true,
    sortOrder: 5,
    featured: false,
    createdAt: '2024-08-18T11:20:00.000Z'
  },
  {
    id: 'demo-proj-6',
    title: 'Soundscape Echo – Audio Sync & Mastered Sound',
    description: 'Multi-layer audio synchronization created in Adobe Audition, eliminating room reverb and delivering crisp vocal dialogue.',
    category: 'SOCIAL MEDIA',
    subCategory: 'Audio Synchronization',
    completionDate: '2024-10-28',
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    mediaType: 'video',
    isPublished: true,
    isDemo: true,
    sortOrder: 6,
    featured: false,
    createdAt: '2024-10-28T09:15:00.000Z'
  }
];

export const initialServices: Service[] = [
  {
    id: 'srv-1',
    title: 'Video Editing',
    description: 'Professional assembly of raw footage, seamless cuts, rhythm-based pacing, and cinematic sequencing for impactful storytelling.',
    iconName: 'Film',
    features: ['Timeline Sequencing', 'Multi-Cam Editing', 'Pacing & Rhythm', 'Rough Cut to Final Master']
  },
  {
    id: 'srv-2',
    title: 'Cinematic Reels',
    description: 'Film-grade color grading, mood lighting matching, dramatic slow-motion, and immersive atmospheric visual effects.',
    iconName: 'Clapperboard',
    features: ['LUT Application', 'Speed Ramping', 'Atmospheric Ambience', 'Dramatic Transitions']
  },
  {
    id: 'srv-3',
    title: 'Advertisement Editing',
    description: 'High-conversion video commercials designed to hook viewers within the first 3 seconds and drive customer action.',
    iconName: 'Megaphone',
    features: ['3-Second Hook Focus', 'Call-to-Action Highlights', 'Brand Color Matching', 'Engaging Cuts']
  },
  {
    id: 'srv-4',
    title: 'Social Media Content Editing',
    description: 'Tailored 9:16 vertical video editing optimized for Instagram Reels, YouTube Shorts, and viral TikTok trends.',
    iconName: 'Smartphone',
    features: ['9:16 Vertical Optimization', 'Fast-Paced Trimming', 'Viral Trend Alignment', 'Visual Hooks']
  },
  {
    id: 'srv-5',
    title: 'Product Promotion Videos',
    description: 'Polished promotional videos emphasizing product details, sleek motion, benefits, and premium aesthetic allure.',
    iconName: 'ShoppingBag',
    features: ['Macro Focus Highlights', 'Feature Callouts', 'Clean Backgrounds', 'Elegant Pacing']
  },
  {
    id: 'srv-6',
    title: 'Basic Motion Graphics',
    description: 'Dynamic lower thirds, logo intros, smooth shape animations, and graphical overlays created in Adobe After Effects.',
    iconName: 'Layers',
    features: ['Logo Animations', 'Dynamic Lower Thirds', 'Icon Popups', 'Overlay Elements']
  },
  {
    id: 'srv-7',
    title: 'Text Animation',
    description: 'Eye-catching kinetic typography, animated subtitle captions, title cards, and synced on-screen text callouts.',
    iconName: 'Type',
    features: ['Kinetic Typography', 'Animated Subtitles', 'Modern Title Cards', 'Synced Lyrics / Words']
  },
  {
    id: 'srv-8',
    title: 'Audio Synchronization',
    description: 'Precision beat-matching video edits where cuts, zooms, and visual hits align flawlessly with the musical tempo.',
    iconName: 'AudioLines',
    features: ['Beat-Matched Cuts', 'Rhythm Snapping', 'Visual Accent Drops', 'Dynamic SFX Placement']
  },
  {
    id: 'srv-9',
    title: 'Sound Enhancement',
    description: 'Cleaning dialogue, noise reduction, Foley sound effects layering, equalizer tuning, and balanced audio mixing.',
    iconName: 'Volume2',
    features: ['Noise & Hum Reduction', 'Dialogue Clarity EQ', 'Custom Foley & SFX', 'Loudness Normalization']
  }
];

export const initialSkills: TechnicalSkill[] = [
  {
    id: 'skill-pr',
    software: 'ADOBE PREMIERE PRO',
    category: 'Core Video Editing',
    description: 'Industry-standard non-linear editing software used to assemble, sequence, and polish narrative and promotional videos.',
    iconName: 'Scissors',
    topics: [
      'Video editing',
      'Transitions',
      'Colour correction',
      'Trimming',
      'Sequencing',
      'Reel editing'
    ]
  },
  {
    id: 'skill-ae',
    software: 'ADOBE AFTER EFFECTS',
    category: 'Visual Effects & Motion',
    description: 'Powerful motion graphics and compositing software to create animated visual elements, kinetic titles, and digital effects.',
    iconName: 'Sparkles',
    topics: [
      'Motion graphics',
      'Animation',
      'Visual effects',
      'Text animation'
    ]
  },
  {
    id: 'skill-ps',
    software: 'ADOBE PHOTOSHOP',
    category: 'Image & Graphic Design',
    description: 'Leading graphic design and photo manipulation tool for creating high-CTR YouTube thumbnails, posters, and visual assets.',
    iconName: 'Palette',
    topics: [
      'Image editing',
      'Photo manipulation',
      'Poster design',
      'Thumbnails',
      'Creative compositions'
    ]
  },
  {
    id: 'skill-au',
    software: 'ADOBE AUDITION',
    category: 'Audio Post-Production',
    description: 'Comprehensive digital audio workstation for restoring audio tracks, polishing dialogue, and crafting immersive soundscapes.',
    iconName: 'Mic',
    topics: [
      'Audio editing',
      'Noise reduction',
      'Sound enhancement',
      'Audio mixing'
    ]
  }
];

export const initialStrengths: PersonalStrength[] = [
  {
    id: 'str-1',
    title: 'Creative Thinking & Visual Storytelling',
    description: 'Translating concepts and raw footage into compelling narrative arcs that grip viewers emotionally and visually.',
    iconName: 'Brain'
  },
  {
    id: 'str-2',
    title: 'Attention to Detail',
    description: 'Scrutinizing frame-by-frame cuts, audio balance, color consistency, and pixel-perfect text placement.',
    iconName: 'CheckCircle'
  },
  {
    id: 'str-3',
    title: 'Time Management',
    description: 'Organized asset folders, disciplined timeline workflows, and consistent delivery before production deadlines.',
    iconName: 'Clock'
  },
  {
    id: 'str-4',
    title: 'Willingness to Learn New Techniques',
    description: 'Continuously adopting emerging editing styles, viral pacing trends, AI editing tools, and new VFX workflows.',
    iconName: 'BookOpen'
  },
  {
    id: 'str-5',
    title: 'Independent & Team Collaboration',
    description: 'Comfortable executing solo self-directed edits as well as collaborating smoothly with directors, creators, and clients.',
    iconName: 'Users'
  }
];

export const initialEducation: EducationItem = {
  id: 'edu-1',
  institution: 'Indian Arts and Science College',
  degree: 'Bachelor of Computer Applications (BCA)',
  field: 'Computer Applications & Digital Media'
};

export const initialTraining: TrainingItem = {
  id: 'trn-1',
  course: 'Adobe Video Editing & Creative Software Course',
  institute: 'Arena Animation',
  year: '2024',
  software: [
    'Adobe Photoshop',
    'Adobe Audition',
    'Adobe Premiere Pro',
    'Adobe After Effects'
  ],
  credentialId: 'AA-VFX-2024-BS'
};

export const initialResume: ResumeData = {
  id: 'res-default',
  fileName: 'BHARATH_S_Video_Editor_Resume.pdf',
  fileUrl: '/resumes/BHARATH_S_Video_Editor_Resume.pdf',
  uploadDate: '2024-11-15',
  fileSize: '420 KB',
  isPublished: true
};

export const initialSocialLinks: SocialLink[] = [
  {
    id: 'soc-whatsapp',
    platform: 'whatsapp',
    label: 'WhatsApp',
    url: 'https://wa.me/919585268336?text=Hi%20Bharath,%20I%20saw%20your%20Video%20Editing%20portfolio%20and%20would%20love%20to%20collaborate!',
    username: '+91 9585268336',
    isActive: true
  },
  {
    id: 'soc-email',
    platform: 'email',
    label: 'Email',
    url: 'mailto:sbarath1605@gmail.com',
    username: 'sbarath1605@gmail.com',
    isActive: true
  },
  {
    id: 'soc-linkedin',
    platform: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/bharath-s-editor',
    username: 'bharath-s-editor',
    isActive: true
  },
  {
    id: 'soc-instagram',
    platform: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/bharaths.edits',
    username: '@bharaths.edits',
    isActive: true
  },
  {
    id: 'soc-youtube',
    platform: 'youtube',
    label: 'YouTube',
    url: 'https://www.youtube.com/@BharathSEdits',
    username: 'Bharath S Edits',
    isActive: true
  },
  {
    id: 'soc-github',
    platform: 'github',
    label: 'GitHub',
    url: 'https://github.com/bharath-s',
    username: 'bharath-s',
    isActive: true
  }
];

export const initialSettings: WebsiteSettings = {
  useSupabase: false,
  supabaseUrl: '',
  supabaseAnonKey: '',
  connected: false
};
