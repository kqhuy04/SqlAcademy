import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DetectiveAnalogyCard } from '@/components/tutorial/DetectiveAnalogyCard';
import { SqlExecutionDiagram } from '@/components/tutorial/SqlExecutionDiagram';
import {
  BookOpen,
  Sparkles,
  Workflow,
  Eye,
  EyeOff,
  ArrowDown,
  Compass,
  Play,
  Lightbulb,
} from 'lucide-react';
import type { TutorialLesson } from '@/types/tutorial.types';

interface TutorialTheorySectionProps {
  currentLesson: TutorialLesson;
  lang: 'VI' | 'EN';
  theoryViewMode: 'quick' | 'full' | 'diagram';
  setTheoryViewMode: (mode: 'quick' | 'full' | 'diagram') => void;
  isTheoryCollapsed: boolean;
  setIsTheoryCollapsed: (collapsed: boolean) => void;
  onRunExample: (sql: string) => void;
  onScrollToPractice: () => void;
  theoryRef?: React.RefObject<HTMLDivElement>;
}

export const TutorialTheorySection: React.FC<TutorialTheorySectionProps> = ({
  currentLesson,
  lang,
  theoryViewMode,
  setTheoryViewMode,
  isTheoryCollapsed,
  setIsTheoryCollapsed,
  onRunExample,
  onScrollToPractice,
  theoryRef,
}) => {
  return (
    <div ref={theoryRef} className="space-y-5 pb-6">
      {/* 1. Crime Scene Dossier Briefing */}
      <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-4 sm:p-5 shadow-noir-card">
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-noir-borderDark/40 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-noir-blood" />
            <span className="text-[11px] font-typewriter uppercase tracking-widest text-noir-inkMuted font-bold">
              {lang === 'VI' ? 'HỒ SƠ VỤ ÁN' : 'CASE BRIEFING'}
            </span>
          </div>
          <Badge variant="gold" size="sm">
            +{currentLesson.xpReward} PTS
          </Badge>
        </div>
        <p className="font-serif text-sm sm:text-base text-noir-ink leading-relaxed italic border-l-4 border-noir-blood pl-4 py-2 bg-noir-card/30 rounded-r">
          &ldquo;{lang === 'VI' ? currentLesson.briefingVi : currentLesson.briefingEn}&rdquo;
        </p>
      </div>

      {/* 2. Theory Mode Switcher Toolbar */}
      <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-3 shadow-noir-card flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setTheoryViewMode('quick');
              setIsTheoryCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
              theoryViewMode === 'quick' && !isTheoryCollapsed
                ? 'bg-amber-700 text-noir-parchment shadow-sm'
                : 'bg-noir-card/70 text-noir-inkMuted hover:text-noir-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'VI' ? '🎯 Tóm tắt nhanh' : '🎯 Quick Recap'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheoryViewMode('full');
              setIsTheoryCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
              theoryViewMode === 'full' && !isTheoryCollapsed
                ? 'bg-noir-blood text-noir-parchment shadow-sm'
                : 'bg-noir-card/70 text-noir-inkMuted hover:text-noir-ink'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'VI' ? '📖 Lý thuyết' : '📖 Theory'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTheoryViewMode('diagram');
              setIsTheoryCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
              theoryViewMode === 'diagram' && !isTheoryCollapsed
                ? 'bg-noir-stamp text-noir-parchment shadow-sm'
                : 'bg-noir-card/70 text-noir-inkMuted hover:text-noir-ink'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>{lang === 'VI' ? '⚡ Sơ đồ' : '⚡ Diagram'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTheoryCollapsed(!isTheoryCollapsed)}
            className="h-7 text-xs px-2.5 flex items-center gap-1 font-typewriter"
          >
            {isTheoryCollapsed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>
              {isTheoryCollapsed
                ? lang === 'VI'
                  ? 'Mở lý thuyết'
                  : 'Expand'
                : lang === 'VI'
                ? 'Thu gọn'
                : 'Collapse'}
            </span>
          </Button>

          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={onScrollToPractice}
            className="h-7 text-xs px-3 flex items-center gap-1 font-typewriter font-bold shadow-sm"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>{lang === 'VI' ? 'Thực hành ↓' : 'Practice ↓'}</span>
          </Button>
        </div>
      </div>

      {/* 3. Theory Body Content based on Active Mode */}
      {!isTheoryCollapsed && (
        <div className="space-y-4">
          {/* MODE 1: QUICK ANALOGY & RUNNABLE EXAMPLE (DEFAULT) */}
          {theoryViewMode === 'quick' && (
            <div className="space-y-4">
              <DetectiveAnalogyCard analogy={currentLesson.detectiveAnalogy} lang={lang} />

              {currentLesson.interactiveExample && (
                <div className="p-4 bg-noir-card/70 border-2 border-noir-borderDark rounded-[4px] shadow-noir-sm">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-[10.5px] font-typewriter uppercase tracking-wider text-noir-inkMuted font-bold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-700" />
                      <span>{lang === 'VI' ? 'CÂU LỆNH MẪU' : 'EXAMPLE QUERY'}</span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        currentLesson.interactiveExample &&
                        onRunExample(currentLesson.interactiveExample.query)
                      }
                      className="h-7 text-xs px-2.5 flex items-center gap-1.5 border-noir-candle text-noir-candleDark hover:bg-noir-candle/15 font-bold"
                    >
                      <Play className="w-3 h-3 fill-noir-candle" />
                      <span>{lang === 'VI' ? 'Chạy thử ⬇' : 'Run ⬇'}</span>
                    </Button>
                  </div>
                  <pre className="font-mono text-xs sm:text-sm bg-noir-paper p-3 rounded border border-noir-border text-noir-ink overflow-x-auto whitespace-pre-wrap break-words leading-relaxed font-bold shadow-inner">
                    {currentLesson.interactiveExample.query}
                  </pre>
                  <p className="text-xs font-serif text-noir-inkMuted mt-2 italic">
                    {lang === 'VI'
                      ? currentLesson.interactiveExample.captionVi
                      : currentLesson.interactiveExample.captionEn}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2 pb-1 border-t border-dashed border-noir-borderDark/60 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTheoryViewMode('full')}
                  className="text-xs font-typewriter font-bold text-noir-blood hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{lang === 'VI' ? '📖 Xem lý thuyết chi tiết hơn ->' : '📖 Read in-depth theory ->'}</span>
                </button>
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  onClick={onScrollToPractice}
                  className="text-xs font-typewriter font-bold flex items-center gap-1"
                >
                  <span>{lang === 'VI' ? 'Làm bài ngay ⬇' : 'Start Practice ⬇'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* MODE 2: FULL THEORY GUIDE */}
          {theoryViewMode === 'full' && (
            <div className="space-y-4">
              <DetectiveAnalogyCard analogy={currentLesson.detectiveAnalogy} lang={lang} />

              <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card space-y-4">
                <div className="flex items-center justify-between border-b-2 border-noir-borderDark pb-2.5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-noir-candle" />
                    <h3 className="text-sm font-typewriter uppercase tracking-wider text-noir-ink font-bold">
                      {lang === 'VI' ? 'LÝ THUYẾT CHI TIẾT' : 'DETAILED THEORY'}
                    </h3>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Forensic Reference
                  </Badge>
                </div>

                <div className="font-serif text-xs sm:text-sm text-noir-ink leading-relaxed whitespace-pre-wrap max-w-5xl bg-[#FAF6EC] p-4 rounded border border-noir-border">
                  {lang === 'VI' ? currentLesson.theoryVi : currentLesson.theoryEn}
                </div>

                {currentLesson.interactiveExample && (
                  <div className="mt-3 p-4 bg-noir-card/60 border border-noir-borderDark rounded-[3px]">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <span className="text-[10.5px] font-typewriter uppercase tracking-wider text-noir-inkMuted font-bold">
                        {lang === 'VI' ? 'CÂU LỆNH MẪU' : 'EXAMPLE QUERY'}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          currentLesson.interactiveExample &&
                          onRunExample(currentLesson.interactiveExample.query)
                        }
                        className="h-7 text-xs px-2.5 flex items-center gap-1.5 border-noir-candleDark/60 text-noir-candleDark hover:bg-noir-candle/15 font-bold"
                      >
                        <Play className="w-3 h-3 fill-noir-candleDark" />
                        <span>{lang === 'VI' ? 'Chạy thử ⬇' : 'Run ⬇'}</span>
                      </Button>
                    </div>
                    <pre className="font-mono text-xs bg-noir-paper p-2.5 rounded border border-noir-border text-noir-ink overflow-x-auto whitespace-pre-wrap break-words leading-relaxed font-bold">
                      {currentLesson.interactiveExample.query}
                    </pre>
                    <p className="text-xs font-serif text-noir-inkMuted mt-1.5 italic">
                      {lang === 'VI'
                        ? currentLesson.interactiveExample.captionVi
                        : currentLesson.interactiveExample.captionEn}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 3: EXECUTION DIAGRAM */}
          {theoryViewMode === 'diagram' && (
            <SqlExecutionDiagram lesson={currentLesson} lang={lang} />
          )}
        </div>
      )}

      {/* Quick jump anchor bar to practice workbench */}
      <div className="pt-2 pb-2 flex flex-col items-center justify-center text-center">
        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={onScrollToPractice}
          className="px-8 py-2.5 text-xs sm:text-sm font-typewriter font-bold uppercase tracking-wider shadow-noir-lift hover:scale-105 transition-all flex items-center gap-2 group"
        >
          <span>{lang === 'VI' ? 'BẮT ĐẦU THỰC HÀNH' : 'GO TO PRACTICE'}</span>
          <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform animate-bounce" />
        </Button>
      </div>
    </div>
  );
};
