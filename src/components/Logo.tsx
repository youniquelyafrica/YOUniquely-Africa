import React from 'react';
import imgLogo from '../assets/logo-icon.png';

export function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <img 
      src={imgLogo} 
      alt="YOUniquely Africa Logo" 
      className={`${className} object-contain`}
      referrerPolicy="no-referrer"
    />
  );
}
