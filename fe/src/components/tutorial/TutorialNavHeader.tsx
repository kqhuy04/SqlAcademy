import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface TutorialNavHeaderProps {
  currentModuleId: string;
  lessonTitle: string;
  lang: 'VI' | 'EN';
}

export const TutorialNavHeader: React.FC<TutorialNavHeaderProps> = ({
  currentModuleId,
  lessonTitle,
  lang,
}) => {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-noir-borderDark pb-3">
      <div className="flex items-center gap-3">
        <Link
          to="/tutorials"
          className="flex items-center gap-1 text-xs font-typewriter uppercase tracking-wider text-noir-inkMuted hover:text-noir-blood transition-colors font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{lang === 'VI' ? 'Học Viện' : 'Academy'}</span>
        </Link>

        <span className="text-noir-borderDark">/</span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-noir-blood font-bold uppercase">
            {currentModuleId.toUpperCase()}
          </span>
          <span className="text-xs font-display font-black text-noir-ink truncate max-w-[260px] sm:max-w-md">
            {lessonTitle}
          </span>
        </div>
      </div>
    </div>
  );
};
