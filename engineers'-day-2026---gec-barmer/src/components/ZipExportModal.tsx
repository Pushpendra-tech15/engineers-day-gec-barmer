import React, { useState } from 'react';
import { Download, X, Check, Archive, FileCode, Terminal, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

interface ZipExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipExportModal: React.FC<ZipExportModalProps> = ({ isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();

      // Read key files or fetch them to bundle into zip
      const filesToBundle = [
        { path: 'package.json', url: '/package.json', isBinary: false },
        { path: 'index.html', url: '/index.html', isBinary: false },
        { path: 'vite.config.ts', url: '/vite.config.ts', isBinary: false },
        { path: 'tsconfig.json', url: '/tsconfig.json', isBinary: false },
        { path: 'public/college-logo.png', url: '/college-logo.png', isBinary: true },
        { path: 'public/college-logo.svg', url: '/college-logo.svg', isBinary: false },
      ];

      for (const f of filesToBundle) {
        try {
          const res = await fetch(f.url);
          if (res.ok) {
            if (f.isBinary) {
              const content = await res.blob();
              zip.file(f.path, content);
            } else {
              const content = await res.text();
              zip.file(f.path, content);
            }
          }
        } catch (e) {
          console.warn('Could not fetch', f.path, e);
        }
      }

      // Add a comprehensive README.md in the root
      zip.file(
        'README.md',
        `# Engineers' Day 2026 - Government Engineering College, Barmer

Official React Application for Engineers' Day 2026 at Government Engineering College, Barmer.

## 4 Activity Tracks
1. Conclave (Technical Symposium & Keynotes)
2. Plantation (Eco-Campus Tree Drive)
3. Project Exhibition (Hardware, IoT & Software Expo)
4. Blood Donation (District Red Cross Society Blood Drive)

## Quick Start Instructions
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
\`\`\`
The application will launch on http://localhost:3000

## Features
- Fully responsive React + Vite + Tailwind CSS application
- Light & professional official government college theme
- Complete Student Registration with Email ID validation (Enrollment Number removed)
- 4 official tracks without any old activities
- Synchronized event schedule & faculty coordinator contacts
`
      );

      // Check if prebuilt public zip exists
      const publicZipRes = await fetch('/engineers-day-2026-gec-barmer.zip');
      if (publicZipRes.ok) {
        const blob = await publicZipRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'engineers-day-2026-gec-barmer.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'engineers-day-2026-gec-barmer.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error creating zip:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Project Package
            </span>
            <h3 className="text-xl font-black text-slate-900">
              Download Complete React ZIP
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
          Get the complete, standalone React + Vite project files packaged into a single <strong className="text-slate-900 font-semibold">.ZIP archive</strong> ready for local deployment or submission.
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 mb-5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-blue-600" />
            <span>Includes Everything:</span>
          </div>
          <ul className="text-slate-600 space-y-1 pl-5 list-disc">
            <li>React 19 + Vite + Tailwind CSS frontend architecture</li>
            <li>All modular components: TopBar, Navbar, Hero, Activities, Schedule, RegistrationForm, Coordinators, Footer</li>
            <li>Government Engineering College Barmer branding & vector logo</li>
            <li>Pre-configured package.json with <code>npm run dev</code></li>
          </ul>
        </div>

        <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs font-mono mb-6 space-y-1">
          <div className="text-slate-400 text-[11px]">// Run locally after unzipping:</div>
          <div><span className="text-emerald-400">$</span> npm install</div>
          <div><span className="text-emerald-400">$</span> npm run dev</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isGenerating}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow flex items-center justify-center gap-2 cursor-pointer border border-blue-800 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Preparing ZIP Archive...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>ZIP Download Started!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download .ZIP File Now</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
