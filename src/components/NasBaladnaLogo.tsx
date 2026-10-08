import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const NasBaladnaLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  // Height and scale configurations
  const dimensions = {
    sm: { height: 34, iconSize: 34, textClass: 'text-base', subClass: 'text-[9px]' },
    md: { height: 46, iconSize: 46, textClass: 'text-xl', subClass: 'text-[11px]' },
    lg: { height: 72, iconSize: 72, textClass: 'text-3xl', subClass: 'text-xs' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon matching IMG_5623: Stylized N + Shopping Cart + Leaf + Speed lines */}
      <svg
        width={dimensions.iconSize}
        height={dimensions.iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
      >
        <defs>
          {/* Main N gradient: bright leaf green to rich emerald */}
          <linearGradient id="nGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="50%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>

          {/* Cart handle & basket gradient */}
          <linearGradient id="cartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#052E16" />
          </linearGradient>

          {/* Leaf gradient */}
          <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#86EFAC" />
          </linearGradient>
        </defs>

        {/* Speed lines on the left */}
        <line x1="20" y1="80" x2="45" y2="80" stroke="#65A30D" strokeWidth="8" strokeLinecap="round" />
        <line x1="12" y1="98" x2="48" y2="98" stroke="#65A30D" strokeWidth="8" strokeLinecap="round" />
        <line x1="24" y1="116" x2="46" y2="116" stroke="#65A30D" strokeWidth="8" strokeLinecap="round" />

        {/* Stylized ribbon letter 'N' */}
        {/* Left vertical pillar */}
        <path
          d="M 68 62 C 60 62 54 68 54 78 L 54 122 C 54 132 60 138 68 138 C 76 138 82 132 82 122 L 82 78 C 82 68 76 62 68 62 Z"
          fill="url(#nGrad)"
        />

        {/* Diagonal stroke of N folding smoothly */}
        <path
          d="M 64 68 C 64 64 74 62 82 72 L 126 128 C 132 136 142 134 142 124 L 142 82 C 142 74 136 68 128 68 C 120 68 116 74 116 80 L 116 92 L 84 56 C 76 46 64 52 64 68 Z"
          fill="url(#nGrad)"
        />

        {/* Shopping Cart merged into right stroke */}
        <path
          d="M 124 92 L 138 92 L 152 122 L 178 122 C 182 122 186 118 188 114 L 194 92 C 196 86 191 80 185 80 L 134 80"
          stroke="url(#cartGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Cart wheels */}
        <circle cx="152" cy="138" r="9" fill="#14532D" />
        <circle cx="178" cy="138" r="9" fill="#14532D" />

        {/* Fresh Green Leaf sprouting from shopping basket */}
        <path
          d="M 154 94 C 150 70 170 54 190 52 C 192 72 176 94 154 94 Z"
          fill="url(#leafGrad)"
        />
        <path
          d="M 158 92 Q 172 74 186 56"
          stroke="#166534"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Wordmark & Tagline matching IMG_5623 */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={`font-extrabold tracking-tight text-[#164E24] font-['Outfit'] leading-none ${dimensions.textClass}`}>
            Nas
          </span>
          <span className={`font-extrabold tracking-tight text-[#4BA635] font-['Outfit'] leading-none ${dimensions.textClass}`}>
            Baladna
          </span>
        </div>

        {showTagline && (
          <div className={`flex items-center gap-1.5 font-bold tracking-widest text-[#2D5A27] mt-0.5 uppercase ${dimensions.subClass}`}>
            <span>Shop</span>
            <span className="text-[#4BA635] text-[8px] transform -rotate-12">🍃</span>
            <span>Order</span>
            <span className="text-[#4BA635] text-[8px] transform -rotate-12">🍃</span>
            <span>Get It</span>
          </div>
        )}
      </div>
    </div>
  );
};
