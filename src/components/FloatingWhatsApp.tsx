import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FloatingWhatsAppProps {
  phone?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ phone = '919585268336' }) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hi%20Bharath,%20I%20saw%20your%20Video%20Editing%20portfolio%20and%20would%20love%20to%20discuss%20a%20project!`;

  return (
    <aside aria-label="Quick contact" className="fixed bottom-6 right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center space-x-3 p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-emerald-500 to-[#0879D1] text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(39,223,255,0.7)] transition-all duration-300 transform hover:scale-110"
        title="Chat on WhatsApp"
        aria-label="Chat directly with Bharath S on WhatsApp"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 group-hover:opacity-60 animate-ping -z-10" />
        
        <MessageSquare className="w-6 h-6 fill-current text-white" />
        
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold uppercase tracking-wider pl-0 group-hover:pl-2">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
};
