import React, { useState } from 'react';
import {
  Send,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, InstagramIcon, YoutubeIcon } from './SocialIcons';
import confetti from 'canvas-confetti';
import { Profile, SocialLink } from '../types';
import { StorageService } from '../services/storageService';

interface ContactProps {
  profile: Profile;
  socialLinks: SocialLink[];
}

export const Contact: React.FC<ContactProps> = ({ profile, socialLinks }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const whatsappLink = socialLinks.find(s => s.platform === 'whatsapp')?.url ||
    `https://wa.me/919585268336?text=Hi%20Bharath,%20I%20saw%20your%20video%20editing%20portfolio!`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (formData.message.trim().length < 10) {
      setStatus('error');
      setErrorMessage('Message is too short. Please provide at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      await StorageService.submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      });

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Celebration burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#27DFFF', '#168BFF', '#FFFFFF']
      });
    } catch (err: unknown) {
      setStatus('error');
      const errText = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setErrorMessage(errText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return GithubIcon;
      case 'linkedin': return LinkedinIcon;
      case 'instagram': return InstagramIcon;
      case 'youtube': return YoutubeIcon;
      case 'whatsapp': return MessageSquare;
      default: return Mail;
    }
  };

  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-[#168BFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#030B1C] border border-[#168BFF]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#27DFFF]" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#27DFFF]">
              Initiate Collaboration
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            LET'S CREATE <span className="bg-gradient-to-r from-[#27DFFF] to-[#168BFF] bg-clip-text text-transparent">SOMETHING AMAZING</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-200">
            Have raw footage, a creative campaign, or an urgent reel project? Send a message and let's craft compelling visuals together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Info & Social Connections (Col 5) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Direct Contact Glass Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#168BFF]/30 space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-[#168BFF]/20 pb-4">
                Direct Inquiries
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-[#030B1C]/80 border border-[#168BFF]/20 hover:border-[#27DFFF]/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#168BFF]/20 flex items-center justify-center text-[#27DFFF] flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-slate-300">Email</div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#27DFFF] transition-colors break-all">
                      {profile.email}
                    </div>
                  </div>
                </a>

                {/* Phone & WhatsApp */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-[#030B1C]/80 border border-[#168BFF]/20 hover:border-[#27DFFF]/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#27DFFF]/15 flex items-center justify-center text-[#27DFFF] flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-slate-300">Phone &amp; WhatsApp</div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#27DFFF] transition-colors">
                      {profile.phone}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-0.5">Click to chat on WhatsApp</div>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start space-x-4 p-4 rounded-2xl bg-[#030B1C]/80 border border-[#168BFF]/20">
                  <div className="w-10 h-10 rounded-xl bg-[#168BFF]/20 flex items-center justify-center text-[#27DFFF] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-slate-300">Location</div>
                    <div className="text-sm font-semibold text-white">
                      {profile.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Channels Card */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#168BFF]/30 space-y-4">
              <h4 className="text-lg font-bold text-white">
                LET'S CONNECT
              </h4>
              <p className="text-xs text-slate-200">
                Connect across professional networks and social video channels.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {socialLinks.filter(s => s.isActive).map((link) => {
                  const IconComp = getPlatformIcon(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-xl bg-[#030B1C]/80 border border-[#168BFF]/20 hover:border-[#27DFFF]/50 hover:bg-[#071A35]/60 transition-all group"
                    >
                      <IconComp className="w-4 h-4 text-[#27DFFF] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-white group-hover:text-[#27DFFF] transition-colors">
                        {link.label}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form (Col 7) */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-[#168BFF]/30 shadow-[0_15px_50px_rgba(2,4,10,0.9)]">
              
              <h3 className="text-2xl font-bold text-white mb-2">
                Send a Project Inquiry
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mb-6">
                Fill in the details below. Messages are saved directly to Bharath's dashboard for prompt response.
              </p>

              {status === 'success' && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300 animate-fadeIn">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <strong>Thank you!</strong> Your message has been sent successfully. Bharath will get back to you shortly.
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    {errorMessage || 'Failed to submit message. Please try again.'}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-semibold text-slate-200 tracking-wider">
                      Your Name <span className="text-[#27DFFF]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#030B1C]/90 border border-[#168BFF]/30 text-white placeholder-slate-400 focus:border-[#27DFFF] focus:outline-none focus:ring-1 focus:ring-[#27DFFF] text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-semibold text-slate-200 tracking-wider">
                      Your Email <span className="text-[#27DFFF]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. client@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#030B1C]/90 border border-[#168BFF]/30 text-white placeholder-slate-400 focus:border-[#27DFFF] focus:outline-none focus:ring-1 focus:ring-[#27DFFF] text-sm"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-semibold text-slate-200 tracking-wider">
                    Subject <span className="text-[#27DFFF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Instagram Reel Editing / Commercial Campaign"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#030B1C]/90 border border-[#168BFF]/30 text-white placeholder-slate-400 focus:border-[#27DFFF] focus:outline-none focus:ring-1 focus:ring-[#27DFFF] text-sm"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-semibold text-slate-200 tracking-wider">
                    Your Message <span className="text-[#27DFFF]">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your video requirements, deadlines, and raw footage details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#030B1C]/90 border border-[#168BFF]/30 text-white placeholder-slate-400 focus:border-[#27DFFF] focus:outline-none focus:ring-1 focus:ring-[#27DFFF] text-sm resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] shadow-[0_0_25px_rgba(22,139,255,0.4)] hover:shadow-[0_0_35px_rgba(39,223,255,0.6)] disabled:opacity-50 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SEND MESSAGE</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
