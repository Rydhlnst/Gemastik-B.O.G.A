import React from 'react';

export const WaveChart = () => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M2 15C5 12 8 8 12 10C16 12 20 15 24 10C28 5 32 2 38 5" 
      stroke="#0EA5E9" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    <path 
      d="M2 15C5 12 8 8 12 10C16 12 20 15 24 10C28 5 32 2 38 5V20H2V15Z" 
      fill="url(#wave-gradient)" 
      fillOpacity="0.1" 
    />
    <defs>
      <linearGradient id="wave-gradient" x1="20" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export const ProgressRing = ({ percentage = 87 }: { percentage?: number }) => {
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r={radius} stroke="#E2E8F0" strokeWidth="2.5" />
      <circle 
        cx="12" 
        cy="12" 
        r={radius} 
        stroke="#10B981" 
        strokeWidth="2.5" 
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
};

export const MiniBarChart = () => (
  <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="3" height="10" rx="1.5" fill="#34D399" />
    <rect x="7" y="4" width="3" height="16" rx="1.5" fill="#10B981" />
    <rect x="12" y="14" width="3" height="6" rx="1.5" fill="#34D399" />
    <rect x="17" y="12" width="3" height="8" rx="1.5" fill="#F43F5E" opacity="0.6" />
  </svg>
);

export const GaugeChart = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16" 
      stroke="#E2E8F0" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
    <path 
      d="M4 16C4 9.37258 9.37258 4 16 4C20 4 24 6" 
      stroke="#0EA5E9" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
  </svg>
);

