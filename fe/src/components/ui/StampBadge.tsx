import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface StampBadgeProps extends HTMLMotionProps<'div'> {
  variant?: 'blood' | 'stamp' | 'candle' | 'ink' | 'gold' | 'crime' | 'classified';
  size?: 'sm' | 'md' | 'lg';
  rotation?: number;
  animateIn?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  variant = 'blood',
  size = 'md',
  rotation = 0,
  animateIn = true,
  label,
  className,
  children,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    blood: 'border-noir-blood text-noir-blood bg-noir-blood/5',
    crime: 'border-noir-blood text-noir-blood bg-noir-blood/5',
    stamp: 'border-noir-stamp text-noir-stamp bg-noir-stamp/5',
    candle: 'border-noir-candle text-noir-candleDark bg-noir-candle/10',
    gold: 'border-noir-candle text-noir-candleDark bg-noir-candle/10',
    ink: 'border-noir-ink text-noir-ink bg-noir-ink/5',
    classified: 'border-noir-ink text-noir-ink bg-noir-ink/5',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 border',
    md: 'text-xs px-2.5 py-1 border-2',
    lg: 'text-sm px-3.5 py-1.5 border-2',
  };

  if (!animateIn || shouldReduceMotion) {
    return (
      <div
        className={cn(
          'inline-flex items-center font-typewriter font-bold uppercase tracking-widest border-dashed select-none rounded-[2px]',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {children || label}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 1.3, opacity: 0, rotate: rotation }}
      animate={{ scale: 1, opacity: 1, rotate: rotation }}
      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      className={cn(
        'inline-flex items-center font-typewriter font-bold uppercase tracking-widest border-dashed select-none rounded-[2px]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children || label}
    </motion.div>
  );
};
