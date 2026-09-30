import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Noir Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-noir-shadow/75 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Dossier Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              'relative w-full bg-noir-parchment border-2 border-noir-borderDark rounded-[4px] shadow-noir-lift z-10 overflow-y-auto max-h-[90vh]',
              maxWidthClasses[maxWidth]
            )}
          >
            {/* Top Red Dossier Rule */}
            <div className="w-full bg-noir-blood flex items-center justify-between px-3 py-1.5 leading-none">
              <span className="text-[10px] font-typewriter tracking-widest text-noir-parchment uppercase font-bold">
                CLASSIFIED DOSSIER
              </span>
              <span className="text-[9px] font-mono text-noir-parchment/90 font-semibold tracking-wider">
                CONFIDENTIAL
              </span>
            </div>

            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-6 py-4 border-b border-noir-border bg-noir-paper/50">
                <div>
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
                    className="text-noir-inkMuted hover:text-noir-blood p-1 rounded transition-colors hover:bg-noir-card/60"
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
