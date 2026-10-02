import React, { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { cn } from '@/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCloseButton?: boolean;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  const { lang } = useLanguageStore();
  const shouldReduceMotion = useReducedMotion();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      if (!dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        dialogRef.current.focus();
      }
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Noir Backdrop */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="fixed inset-0 bg-noir-shadow/75 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dossier Modal Dialog */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? (lang === 'VI' ? 'Hộp thoại hồ sơ' : 'Dossier dialog') : undefined}
            tabIndex={-1}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              'relative w-full bg-noir-parchment border-2 border-noir-borderDark rounded-[4px] shadow-noir-lift z-10 overflow-y-auto max-h-[90vh] focus:outline-none',
              maxWidthClasses[maxWidth]
            )}
          >
            {/* Top Red Dossier Rule */}
            <div className="w-full bg-noir-blood flex items-center justify-between px-3 py-1.5 leading-none">
              <span className="text-[10px] font-typewriter tracking-widest text-noir-parchment uppercase font-bold">
                {lang === 'VI' ? 'HỒ SƠ MẬT' : 'CLASSIFIED DOSSIER'}
              </span>
              <span className="text-[9px] font-mono text-noir-parchment/90 font-semibold tracking-wider">
                {lang === 'VI' ? 'TUYỆT MẬT' : 'CONFIDENTIAL'}
              </span>
            </div>

            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-6 py-4 border-b border-noir-border bg-noir-paper/50 gap-3">
                <div id={title ? titleId : undefined} className="flex-1 min-w-0">
                  {title && typeof title === 'string' ? (
                    <h3 className="text-lg font-display font-bold text-noir-ink tracking-tight">{title}</h3>
                  ) : (
                    title
                  )}
                  {subtitle && <p className="text-xs font-serif italic text-noir-inkMuted mt-0.5">{subtitle}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={lang === 'VI' ? 'Đóng hộp thoại' : 'Close dialog'}
                    className="min-w-[40px] min-h-[40px] -mr-2 -mt-1 flex items-center justify-center text-noir-inkMuted hover:text-noir-blood rounded transition-colors hover:bg-noir-card/60 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <div className="p-6 text-noir-ink">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
