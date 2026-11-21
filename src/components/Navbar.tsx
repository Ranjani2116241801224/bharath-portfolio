import React, { useState, useEffect } from 'react';
import { Menu, X, Video, Shield, PhoneCall } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, isAdminLoggedIn }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Services', href: '#services' },
    { label: 'Skills', href: '#skills' },
    { label: 'Education', href: '#education' },
    { label: 'Resume', href: '#resume' },
    { label: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Scrollspy
      const sections = navLinks.map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-[#030B1C]/85 backdrop-blur-xl border-b border-[#168BFF]/25 shadow-[0_4px_30px_rgba(2,4,10,0.8)]'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#168BFF] to-[#0879D1] p-[1.5px] shadow-[0_0_15px_rgba(22,139,255,0.4)] group-hover:shadow-[0_0_25px_rgba(39,223,255,0.7)] transition-all">
              <div className="w-full h-full bg-[#02040A] rounded-[10px] flex items-center justify-center">
                <Video className="w-5 h-5 text-[#27DFFF] group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white group-hover:text-[#27DFFF] transition-colors">
                BHARATH S
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-[#168BFF] font-medium">
                Video Editor
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 glass-panel px-4 py-1.5 rounded-full border border-[#168BFF]/20">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-200 relative ${
                    isActive
                      ? 'text-[#27DFFF] bg-[#168BFF]/20 shadow-[0_0_12px_rgba(39,223,255,0.3)]'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[#27DFFF] rounded-full shadow-[0_0_8px_#27DFFF]"></span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Let's Talk CTA */}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1] hover:from-[#27DFFF] hover:to-[#168BFF] hover:shadow-[0_0_20px_rgba(39,223,255,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Let's Talk</span>
            </a>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              title="Admin Dashboard"
              aria-label="Admin Dashboard"
              className={`p-2 rounded-full border transition-all ${
                isAdminLoggedIn
                  ? 'bg-[#168BFF]/25 border-[#27DFFF] text-[#27DFFF] shadow-[0_0_15px_rgba(39,223,255,0.4)]'
                  : 'bg-[#030B1C]/80 border-[#168BFF]/30 text-slate-200 hover:text-white hover:border-[#27DFFF]'
              }`}
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-lg bg-[#030B1C]/80 border border-[#168BFF]/30 text-slate-200"
              title="Admin Dashboard"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#030B1C]/80 border border-[#168BFF]/30 text-white hover:text-[#27DFFF] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 mx-4 p-5 rounded-2xl glass-panel border border-[#168BFF]/30 shadow-[0_12px_40px_rgba(0,0,0,0.9)] animate-fadeIn">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#27DFFF] bg-[#168BFF]/20 font-semibold'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-3 border-t border-[#168BFF]/20">
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, '#contact')}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-[#168BFF] to-[#0879D1]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Let's Talk</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
