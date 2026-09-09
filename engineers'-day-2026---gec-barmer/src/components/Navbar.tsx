import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { CollegeLogo } from './CollegeLogo';

interface NavbarProps {
  onRegisterClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRegisterClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Track active section for navigation highlight
      const sections = ['home', 'activities', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home', id: 'home' },
    { label: 'Activities & Register', href: '#activities', id: 'activities' },
    { label: 'Faculty & Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? 'shadow-md border-b border-slate-200/90 py-2.5'
          : 'border-b border-slate-200 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Official College Brand & Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
            className="flex items-center gap-3 group focus:outline-none"
            id="brand-logo-link"
          >
            <CollegeLogo size={isScrolled ? 'sm' : 'md'} />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base lg:text-lg tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                GOVERNMENT ENGINEERING COLLEGE, BARMER
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] sm:text-xs font-bold text-amber-600 tracking-wide uppercase">
                  Engineers' Day 2026
                </span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeSection === link.id
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
                id={`nav-link-${link.id}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Prominent CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onRegisterClick}
              id="navbar-register-now-btn"
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 cursor-pointer border border-blue-800"
            >
              <span>REGISTER NOW</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-drawer"
            className="lg:hidden mt-3 pt-3 border-t border-slate-200 pb-4 space-y-1 animate-fadeIn"
          >
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </div>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-lg transition-colors ${
                  activeSection === link.id
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                }`}
                id={`mobile-nav-${link.id}`}
              >
                <span>{link.label}</span>
              </a>
            ))}
            <div className="pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRegisterClick();
                }}
                className="w-full py-3 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-center text-sm shadow flex items-center justify-center gap-2 cursor-pointer"
                id="mobile-drawer-register-btn"
              >
                <span>REGISTER NOW FOR ENGINEERS' DAY 2026</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
