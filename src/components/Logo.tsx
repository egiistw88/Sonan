
import React from 'react';

export const SonanLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 280 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-4" y="0" width="288" height="88" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
    </defs>
    
    <g filter="url(#shadow)">
      <rect width="280" height="80" rx="20" fill="#facc15" />
    </g>

    <text x="32" y="58" fontSize="52" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#0f172a">S</text>

    <g transform="translate(68, 12)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.5 0C12.3122 0 0 12.3122 0 27.5C0 42.6878 27.5 68 27.5 68C27.5 68 55 42.6878 55 27.5C55 12.3122 42.6878 0 27.5 0ZM27.5 40C34.4036 40 40 34.4036 40 27.5C40 20.5964 34.4036 15 27.5 15C20.5964 15 15 20.5964 15 27.5C15 34.4036 20.5964 40 27.5 40Z"
        fill="#dc2626" 
      />
      <circle cx="27.5" cy="27.5" r="10" fill="#facc15" />
    </g>

    <text x="128" y="58" fontSize="52" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#0f172a" letterSpacing="-2">NAN</text>
  </svg>
);
