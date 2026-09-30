import React from 'react';
import { cn } from '@/utils/cn';
import { Search } from 'lucide-react';

export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}> = ({ size = 'md', className, label }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 select-none">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            'rounded-full border-2 border-noir-borderDark/40 border-t-noir-blood animate-spin',
            size === 'sm' && 'w-5 h-5 border-[1.5px]',
            size === 'md' && 'w-9 h-9 border-2',
            size === 'lg' && 'w-12 h-12 border-2',
            className
          )}
        />
        <Search
          className={cn(
            'absolute text-noir-blood/80 animate-pulse',
            sizeMap[size]
          )}
        />
      </div>
      {label && (
        <span className="text-xs font-typewriter uppercase tracking-widest text-noir-inkMuted font-bold">
          {label}
        </span>
      )}
    </div>
  );
};
