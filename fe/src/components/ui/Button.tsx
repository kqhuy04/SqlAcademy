import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'cyan' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'gold',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-typewriter tracking-wider whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-noir-parchment disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-[3px] active:translate-y-px';

    const variants = {
      gold: 'bg-noir-blood hover:bg-noir-bloodDark text-noir-parchment font-bold shadow-noir-sm focus-visible:ring-noir-blood border border-noir-bloodDark/40',
      cyan: 'bg-noir-candle hover:bg-noir-candleDark text-noir-ink font-bold shadow-noir-sm focus-visible:ring-noir-candle border border-noir-candleDark/40',
      secondary:
        'bg-noir-paper hover:bg-noir-card border border-noir-border hover:border-noir-borderDark text-noir-ink shadow-noir-sm focus-visible:ring-noir-borderDark',
      outline:
        'border border-noir-borderDark/80 hover:border-noir-ink text-noir-ink hover:bg-noir-paper/60 focus-visible:ring-noir-borderDark',
      danger: 'bg-noir-bloodDark hover:bg-black text-white focus-visible:ring-noir-blood border border-black/40',
      ghost: 'hover:bg-noir-paper/70 text-noir-inkMuted hover:text-noir-ink focus-visible:ring-noir-border',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2 gap-2',
      lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
