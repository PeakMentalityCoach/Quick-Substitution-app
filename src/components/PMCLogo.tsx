import React from 'react';

export default function PMCLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 bg-pmc-primary rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xl">P</span>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-pmc-primary leading-tight">Peak Mentality</span>
        <span className="text-xs text-pmc-secondary leading-tight">Coach</span>
      </div>
    </div>
  );
}
