import React from 'react';

interface CompanyLogoProps {
  variant?: 'badge' | 'full' | 'compact';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  subtitle?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  size = 'md',
  className = '',
  subtitle = 'Family Properties • Private Office',
}) => {
  const isDark = theme === 'dark';

  // Sizing maps
  const badgeSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const emblemSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  // Authentic Kretz Emblem SVG path
  const EmblemSvg = (
    <svg viewBox="0 0 183.214 183.214" fill="currentColor" className="w-full h-full">
      <path
        d="M488.274,166.269q-1.363-1.468-2.79-2.878a91.526,91.526,0,0,0-91.4-22.345q-2.021.625-4,1.346a91.581,91.581,0,0,0-51.343,126.1q.985,2.028,2.069,4a92.118,92.118,0,0,0,49.274,42.238q1.98.717,4,1.346A91.545,91.545,0,0,0,490.1,288.834q1.32-1.509,2.574-3.075a91.414,91.414,0,0,0-4.4-119.49Zm-67.1-25.313A87.315,87.315,0,0,1,482.436,166l-23.928,20.491a56.238,56.238,0,0,0-64.423-7.242v-34A87.266,87.266,0,0,1,421.176,140.957Zm-27.09,100.708V183.873a52.247,52.247,0,0,1,61.361,5.243Zm-60.517-13.1a87.749,87.749,0,0,1,56.517-81.9V268.5H343.212A87.073,87.073,0,0,1,333.569,228.563ZM345.406,272.5h44.68v37.969A88.115,88.115,0,0,1,345.406,272.5Zm75.771,43.674a87.266,87.266,0,0,1-27.09-4.293V246.933L421.8,223.2l65.416,62.866A87.431,87.431,0,0,1,421.176,316.171Zm68.608-33.192-64.928-62.4,60.379-51.709a87.429,87.429,0,0,1,4.549,114.107Z"
        transform="translate(-329.569 -136.957)"
      />
    </svg>
  );

  // Circle Badge (Used to replace individual agent photos)
  if (variant === 'badge') {
    return (
      <div
        className={`relative ${badgeSizes[size]} rounded-full flex items-center justify-center p-2.5 transition-transform duration-300 ${
          isDark
            ? 'bg-[#1d1d1b] text-amber-300 border border-amber-400/30 shadow-md'
            : 'bg-neutral-900 text-amber-300 border border-neutral-700 shadow-md'
        } ${className}`}
        title="Kretz Properties Official Company Insignia"
      >
        <div className="w-full h-full flex items-center justify-center">
          {EmblemSvg}
        </div>
      </div>
    );
  }

  // Compact horizontal lockup
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <div>
          <div
            className={`font-serif-luxury font-medium tracking-[0.22em] text-base sm:text-lg uppercase leading-none ${
              isDark ? 'text-white' : 'text-neutral-900'
            }`}
          >
            KRETZ
          </div>
          <div
            className={`text-[9px] uppercase tracking-[0.28em] font-mono mt-0.5 ${
              isDark ? 'text-amber-400/80' : 'text-neutral-500'
            }`}
          >
            properties
          </div>
        </div>
      </div>
    );
  }

  // Full lockup with typography and subtitle
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      <span
        className={`${textSizes[size]} font-serif-luxury font-medium tracking-[0.25em] uppercase ${
          isDark ? 'text-white' : 'text-[#1d1d1b]'
        }`}
      >
        KRETZ
      </span>
      {subtitle && (
        <span
          className={`text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-light mt-1 ${
            isDark ? 'text-neutral-400' : 'text-[#757575]'
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};
