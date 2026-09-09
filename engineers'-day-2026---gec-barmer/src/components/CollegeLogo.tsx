import React from 'react';

interface CollegeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightMode?: boolean;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  lightMode = false,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size]} shrink-0 rounded-full bg-white p-1 shadow-sm border border-slate-200/80 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105`}
        title="राजकीय अभियांत्रिकी महाविद्यालय, बाड़मेर (GEC Barmer)"
      >
        <img
          src="/college-logo.png"
          alt="Government Engineering College Barmer Official Logo"
          className="w-full h-full object-contain filter drop-shadow-xs"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to SVG if PNG fails to load
            e.currentTarget.src = '/college-logo.svg';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-extrabold tracking-tight leading-tight ${
              lightMode ? 'text-white' : 'text-slate-900'
            } ${size === 'lg' || size === 'xl' ? 'text-lg md:text-xl' : 'text-sm md:text-base'}`}
          >
            GOVERNMENT ENGINEERING COLLEGE
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold tracking-wide ${
                lightMode ? 'text-amber-300' : 'text-blue-700'
              } ${size === 'lg' || size === 'xl' ? 'text-sm md:text-base' : 'text-xs md:text-sm'}`}
            >
              BARMER, RAJASTHAN
            </span>
            <span
              className={`hidden sm:inline-block text-[11px] px-1.5 py-0.5 rounded border ${
                lightMode
                  ? 'border-blue-300/40 text-blue-100 bg-blue-900/40'
                  : 'border-slate-200 text-slate-500 bg-slate-50'
              }`}
            >
              ESTD. 2018
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
