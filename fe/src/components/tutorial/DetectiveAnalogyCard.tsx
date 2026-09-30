import React from 'react';
import type { DetectiveAnalogy } from '@/types/tutorial.types';
import { Search, Compass, Sparkles } from 'lucide-react';

interface DetectiveAnalogyCardProps {
  analogy?: DetectiveAnalogy;
  lang: 'VI' | 'EN';
  className?: string;
}

export const DetectiveAnalogyCard: React.FC<DetectiveAnalogyCardProps> = ({
  analogy,
  lang,
  className = '',
}) => {
  if (!analogy) return null;

  const action = lang === 'VI' ? analogy.actionVi : analogy.actionEn;
  const story = lang === 'VI' ? analogy.storyVi : analogy.storyEn;
  const takeaway = lang === 'VI' ? analogy.syntaxTakeawayVi : analogy.syntaxTakeawayEn;

  return (
    <div
      className={`relative bg-[#FBF7EE] border-2 border-amber-700/40 rounded-[4px] p-4 sm:p-5 shadow-noir-card overflow-hidden group hover:border-amber-600 transition-colors ${className}`}
    >
      {/* Top vintage leather accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-noir-blood to-amber-700" />

      {/* Header Docket Badge */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-amber-800/20 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500/15 border border-amber-600/40 flex items-center justify-center text-amber-900 shadow-sm">
            <Search className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-typewriter font-bold uppercase tracking-wider text-amber-950">
            {lang === 'VI'
              ? 'GÓC NHÌN THÁM TỬ • SO SÁNH ĐỜI THỰC'
              : 'DETECTIVE METAPHOR • REAL-WORLD ANALOGY'}
          </span>
        </div>

        {takeaway && (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-noir-paper border border-amber-700/30 text-[10.5px] font-mono font-bold text-amber-900 shadow-inner">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{takeaway}</span>
          </div>
        )}
      </div>

      {/* Main Analogy Action */}
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="font-typewriter text-xs sm:text-sm font-black text-noir-blood tracking-wide uppercase flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{action}</span>
          </div>
          <p className="font-serif text-xs sm:text-sm text-noir-ink leading-relaxed bg-[#FAF2DF]/70 border-l-4 border-amber-600 pl-3.5 pr-2 py-2 rounded-r-[3px] shadow-sm">
            {story}
          </p>
        </div>
      </div>
    </div>
  );
};
