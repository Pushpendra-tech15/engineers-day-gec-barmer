import React from 'react';
import { COLLEGE_DETAILS } from '../data/eventData';
import { MapPin, Mail, Phone, Lock, Globe, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenZipModal?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/90 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Contact, Website & Address Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80 text-center lg:text-left">
          {/* Address */}
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-relaxed">{COLLEGE_DETAILS.address}</span>
          </div>

          {/* Links & Contacts */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 sm:gap-6">
            {/* Website Link */}
            <a
              href={COLLEGE_DETAILS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 font-medium transition-colors group"
              title="Visit Official College Website"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
              <span>gecbarmer.ac.in</span>
              <ExternalLink className="w-3 h-3 text-blue-400/80" />
            </a>

            <span className="text-slate-700 hidden sm:inline">•</span>

            {/* Email */}
            <a
              href={`mailto:${COLLEGE_DETAILS.email}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
              title="Email Principal GEC Barmer"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{COLLEGE_DETAILS.email}</span>
            </a>

            <span className="text-slate-700 hidden sm:inline">•</span>

            {/* Phone Numbers */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <a
                href="tel:+919119268187"
                className="hover:text-white text-slate-300 font-mono transition-colors"
              >
                +91-9119268187
              </a>
              <span className="text-slate-600">,</span>
              <a
                href="tel:+918118898267"
                className="hover:text-white text-slate-300 font-mono transition-colors"
              >
                +91-8118898267
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Admin Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-slate-400">
          <p className="font-medium text-slate-300">
            © 2026 Government Engineering College, Barmer. All Rights Reserved.
          </p>

          {/* Admin Login Button */}
          {onOpenAdmin && (
            <div className="shrink-0">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-300 border border-slate-800 hover:border-blue-900/40 text-xs font-medium transition-colors cursor-pointer"
                title="Admin Sign In to access participant records"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
