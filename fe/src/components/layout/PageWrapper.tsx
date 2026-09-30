import React from 'react';
import { Navbar } from './Navbar';
import { useLanguageStore } from '@/store/languageStore';
import { cn } from '@/utils/cn';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className,
  fullWidth = false,
}) => {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen flex flex-col bg-noir-parchment text-noir-ink selection:bg-noir-blood selection:text-noir-parchment">
      <Navbar />
      <main
        className={cn(
          'flex-1 w-full',
          !fullWidth && 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
          className
        )}
      >
        {children}
      </main>
      <footer className="border-t-2 border-noir-borderDark/60 py-6 text-center text-xs text-noir-inkMuted font-typewriter bg-noir-paper/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {lang === 'VI'
              ? 'SQL DETECTIVE NOIR © 2026 — PHÒNG ĐIỀU TRA HÌNH SỰ & PHÁP Y DỮ LIỆU'
              : 'SQL DETECTIVE NOIR © 2026 — FORENSIC INVESTIGATION DIVISION'}
          </div>
          <div className="text-noir-blood font-bold tracking-widest">
            {lang === 'VI'
              ? 'HỒ SƠ MẬT • MỨC ĐỘ BẢO MẬT CẤP 3'
              : 'CLASSIFIED ARCHIVES • SECURITY CLEARANCE LEVEL 3'}
          </div>
        </div>
      </footer>
    </div>
  );
};
