
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#34d399' }} />
          <stop offset="100%" style={{ stopColor: '#15803d' }} />
        </linearGradient>
      </defs>
      
      {/* 3D Cube Structure */}
      <g transform="translate(0, 5) skewY(-10) scale(1, 1.1)">
        {/* Side face (darkest) */}
        <path d="M50 15 L75 2.5 L75 52.5 L50 65 Z" fill="#14532d" />
        {/* Top face (lighter) */}
        <path d="M50 15 L25 2.5 L50 -10 L75 2.5 Z" fill="#6ee7b7" />
        {/* Front face (gradient) */}
        <path d="M50 15 L25 2.5 L25 52.5 L50 65 Z" fill="url(#logo-gradient)" />
      </g>

      {/* Scissors Icon Overlay */}
      <g transform="translate(10, 10)" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        {/* Top handle */}
        <circle cx="45" cy="30" r="10" />
        {/* Bottom handle */}
        <circle cx="45" cy="60" r="10" />
        {/* Blades */}
        <line x1="45" y1="40" x2="20" y2="15" />
        <line x1="45" y1="50" x2="20" y2="75" />
      </g>
    </svg>
  );
};