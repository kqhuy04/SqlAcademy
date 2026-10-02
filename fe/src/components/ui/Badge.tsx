import React from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'easy' | 'medium' | 'hard' | 'expert' | 'gold' | 'cyan' | 'neutral' | 'success' | 'danger';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center font-typewriter font-bold uppercase tracking-wider select-none border border-dashed rounded-[2px]';

  const variants = {
    easy: 'bg-noir-stamp/10 text-noir-stamp border-noir-stamp/60',
    medium: 'bg-amber-900/10 text-amber-900 border-amber-800/60',
    hard: 'bg-orange-950/10 text-orange-900 border-orange-800/60',
    expert: 'bg-noir-blood/10 text-noir-blood border-noir-blood font-black',
    gold: 'bg-noir-candle/15 text-noir-candleDark border-noir-candle/70',
    cyan: 'bg-amber-950/10 text-amber-950 border-amber-900/40',
    neutral: 'bg-noir-paper text-noir-inkMuted border-noir-borderDark/60',
    success: 'bg-noir-stamp/10 text-noir-stamp border-noir-stamp/60',
    danger: 'bg-noir-blood/10 text-noir-blood border-noir-blood/60',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};

export const DifficultyBadge: React.FC<{ difficulty: string; className?: string }> = ({
  difficulty,
  className,
}) => {
  const { lang } = useLanguageStore();
  const norm = difficulty?.toUpperCase() || 'EASY';
  let variant: 'easy' | 'medium' | 'hard' | 'expert' = 'easy';

  if (norm === 'MEDIUM') variant = 'medium';
  else if (norm === 'HARD') variant = 'hard';
  else if (norm === 'EXPERT') variant = 'expert';

  const labelVi = {
    EASY: 'CƠ BẢN',
    MEDIUM: 'TRUNG BÌNH',
    HARD: 'NÂNG CAO',
    EXPERT: 'CHUYÊN GIA',
  }[norm] || norm;

  return (
    <Badge variant={variant} size="sm" className={cn('tracking-widest', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-0.5 opacity-80" />
      {lang === 'VI' ? labelVi : norm}
    </Badge>
  );
};
