import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'responsive';
  showTagline?: boolean;
  taglineText?: string;
}

export const NasBaladnaLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  taglineText,
}) => {
  // Height and scale configurations
  const dimensions = {
    xs: {
      iconSize: 26,
      textClass: 'text-sm',
      subClass: 'text-[7px]',
      gap: 'gap-1.5',
    },
    sm: {
      iconSize: 34,
      textClass: 'text-base sm:text-lg',
      subClass: 'text-[8.5px] sm:text-[9px]',
      gap: 'gap-2',
    },
    md: {
      iconSize: 44,
      textClass: 'text-xl sm:text-2xl',
      subClass: 'text-[9.5px] sm:text-[10.5px]',
      gap: 'gap-2.5',
    },
    lg: {
      iconSize: 64,
      textClass: 'text-3xl sm:text-4xl',
      subClass: 'text-xs sm:text-[13px]',
      gap: 'gap-3',
    },
    responsive: {
      iconSize: 40,
      textClass: 'text-xl sm:text-2xl md:text-[25px]',
      subClass: 'text-[8.5px] sm:text-[9.5px] md:text-[10.5px]',
      gap: 'gap-2 sm:gap-2.5',
    },
  }[size];

  return (
    <div className={`inline-flex items-center ${dimensions.gap} select-none leading-none shrink-0 ${className}`}>
      {/* Brand Icon Mark: Stylized N + Shopping Cart + Speed Lines + Fresh Leaf */}
      <svg
        width={dimensions.iconSize}
        height={dimensions.iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs transition-transform duration-200"
        style={{ width: dimensions.iconSize, height: dimensions.iconSize }}
        aria-hidden="true"
      >
        <defs>
          {/* Main N gradient: bright leaf green to rich emerald */}
          <linearGradient id="nbNGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="45%" stopColor="#3FA636" />
            <stop offset="100%" stopColor="#0F472A" />
          </linearGradient>

          {/* Cart handle & basket gradient */}
          <linearGradient id="nbCartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3FA636" />
            <stop offset="100%" stopColor="#0B3C1D" />
          </linearGradient>

          {/* Leaf gradient */}
          <linearGradient id="nbLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#86EFAC" />
          </linearGradient>

          {/* Speed line gradient */}
          <linearGradient id="nbSpeedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#3FA636" />
          </linearGradient>
        </defs>

        {/* Speed lines on the left (Express Fast Dispatch) */}
        <line x1="18" y1="80" x2="44" y2="80" stroke="url(#nbSpeedGrad)" strokeWidth="7.5" strokeLinecap="round" />
        <line x1="10" y1="99" x2="50" y2="99" stroke="url(#nbSpeedGrad)" strokeWidth="7.5" strokeLinecap="round" />
        <line x1="20" y1="118" x2="46" y2="118" stroke="url(#nbSpeedGrad)" strokeWidth="7.5" strokeLinecap="round" />

        {/* Stylized letter 'N' left vertical pillar */}
        <path
          d="M 68 62 C 60 62 54 68 54 78 L 54 122 C 54 132 60 138 68 138 C 76 138 82 132 82 122 L 82 78 C 82 68 76 62 68 62 Z"
          fill="url(#nbNGrad)"
        />

        {/* Diagonal stroke of N folding smoothly into structure */}
        <path
          d="M 64 68 C 64 64 74 62 82 72 L 126 128 C 132 136 142 134 142 124 L 142 82 C 142 74 136 68 128 68 C 120 68 116 74 116 80 L 116 92 L 84 56 C 76 46 64 52 64 68 Z"
          fill="url(#nbNGrad)"
        />

        {/* Shopping Cart basket frame */}
        <path
          d="M 124 92 L 138 92 L 152 122 L 178 122 C 182 122 186 118 188 114 L 194 92 C 196 86 191 80 185 80 L 134 80"
          stroke="url(#nbCartGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Cart wheels */}
        <circle cx="152" cy="138" r="8.5" fill="#0F472A" />
        <circle cx="152" cy="138" r="3" fill="#3FA636" />
        <circle cx="178" cy="138" r="8.5" fill="#0F472A" />
        <circle cx="178" cy="138" r="3" fill="#3FA636" />

        {/* Fresh Green Leaf sprouting from shopping basket */}
        <path
          d="M 154 94 C 150 70 170 52 192 48 C 194 70 176 94 154 94 Z"
          fill="url(#nbLeafGrad)"
        />
        <path
          d="M 158 92 Q 174 72 188 52"
          stroke="#0F472A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Wordmark & Tagline: NasBaladna */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline tracking-tight">
          <span className={`font-extrabold text-[#164E24] font-['Outfit',sans-serif] leading-none ${dimensions.textClass}`}>
            Nas
          </span>
          <span className={`font-extrabold text-[#4BA635] font-['Outfit',sans-serif] leading-none ${dimensions.textClass}`}>
            Baladna
          </span>
        </div>

        {showTagline && (
          <div
            className={`flex items-center gap-1 sm:gap-1.5 font-bold tracking-widest text-[#2D5A27] mt-0.5 sm:mt-1 uppercase font-['Outfit',sans-serif] leading-none select-none ${dimensions.subClass}`}
          >
            {taglineText ? (
              <span>{taglineText}</span>
            ) : (
              <>
                <span>Shop</span>
                <span className="text-[#4BA635] text-[8.5px] sm:text-[9.5px] transform -rotate-12 inline-block">🍃</span>
                <span>Order</span>
                <span className="text-[#4BA635] text-[8.5px] sm:text-[9.5px] transform -rotate-12 inline-block">🍃</span>
                <span>Get It</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
