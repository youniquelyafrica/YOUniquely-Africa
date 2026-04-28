import React from 'react';

export function Logo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <img 
      src="/logo-icon.png" 
      alt="YOUniquely Africa Logo" 
      className={`${className} object-contain`}
      referrerPolicy="no-referrer"
    />
  );
}
