import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-typewriter font-bold tracking-wider uppercase text-noir-ink">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-noir-inkMuted pointer-events-none flex items-center justify-center" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={errorId || helperId}
            spellCheck={props.type === 'password' || props.type === 'email' ? false : props.spellCheck}
            className={cn(
              'w-full bg-noir-paper border rounded-[3px] px-3.5 py-2.5 text-sm text-noir-ink placeholder-noir-inkFaint font-serif transition-colors focus-visible:outline-none focus-visible:ring-1 shadow-inner shadow-noir-ink/5',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-noir-blood focus-visible:border-noir-blood focus-visible:ring-noir-blood'
                : 'border-noir-borderDark/60 focus-visible:border-noir-blood focus-visible:ring-noir-blood',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-noir-inkMuted flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} role="alert" aria-live="polite" className="text-xs text-noir-blood font-typewriter font-semibold flex items-center gap-1 mt-1">{error}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-noir-inkMuted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
