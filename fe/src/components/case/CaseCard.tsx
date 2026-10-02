import React from 'react';
import type { PremiumCaseDTO } from '@/types/case.types';
import { useLanguageStore } from '@/store/languageStore';
import { DifficultyBadge } from '@/components/ui/Badge';
import { Lock, FileText, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CaseCardProps {
  caseData: PremiumCaseDTO;
  completedQuestionsCount: number;
  isCompleted: boolean;
  onSelect: (caseData: PremiumCaseDTO) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  caseData,
  completedQuestionsCount,
  isCompleted,
  onSelect,
}) => {
  const { lang } = useLanguageStore();
  const isLocked = !caseData.isUnlocked;
  const totalQuestions = caseData.questionCount || 1;
  const progressPercent = Math.round((completedQuestionsCount / totalQuestions) * 100);

  return (
    <div
      onClick={() => onSelect(caseData)}
      className={cn(
        'group relative bg-noir-paper border-2 rounded-[4px] p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden select-none shadow-noir-card hover:shadow-noir-lift hover:-translate-y-1',
        isLocked
          ? 'border-noir-borderDark/70 opacity-85 hover:opacity-100 bg-noir-card/60'
          : isCompleted
          ? 'border-noir-stamp/70 hover:border-noir-stamp bg-noir-paper'
          : 'border-noir-borderDark hover:border-noir-blood'
      )}
    >
      {/* Top Dossier Rule */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          isLocked
            ? 'bg-noir-borderDark'
            : isCompleted
            ? 'bg-noir-stamp'
            : 'bg-noir-blood'
        )}
      />

      <div>
        {/* Top Stamp / Case ID */}
        <div className="flex items-start justify-between gap-3 mb-3 pt-1">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div
              className={cn(
                'w-10 h-10 rounded-[3px] flex items-center justify-center font-typewriter font-bold text-xs border-2 shadow-sm shrink-0',
                isLocked
                  ? 'bg-noir-card border-noir-borderDark text-noir-inkMuted'
                  : isCompleted
                  ? 'bg-noir-stamp/10 border-noir-stamp text-noir-stamp'
                  : 'bg-noir-parchment border-noir-borderDark text-noir-blood'
              )}
            >
              {isLocked ? (
                <Lock className="w-4 h-4 text-noir-blood" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-noir-stamp" />
              ) : (
                <span>#{String(caseData.orderIndex || caseData.id).padStart(2, '0')}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DifficultyBadge difficulty={caseData.difficulty} />
                {isCompleted && (
                  <span className="text-[10px] font-typewriter uppercase tracking-widest text-noir-stamp bg-noir-stamp/10 px-2 py-0.5 rounded-[2px] border border-dashed border-noir-stamp font-bold">
                    {lang === 'VI' ? 'ĐÃ PHÁ ÁN' : 'CASE CLOSED'}
                  </span>
                )}
              </div>
              <h3
                className="font-display font-bold text-base text-noir-ink group-hover:text-noir-blood transition-colors mt-1 line-clamp-1 break-words"
                title={caseData.title}
              >
                {caseData.title}
              </h3>
            </div>
          </div>

          {caseData.badgeName && (
            <div
              className="flex items-center gap-1 text-[10px] font-typewriter text-noir-candleDark border border-dashed border-noir-borderDark px-1.5 py-0.5 rounded bg-noir-parchment/60 shrink-0 self-start"
              title={`${lang === 'VI' ? 'Phần thưởng' : 'Reward'}: ${caseData.badgeName}`}
            >
              <Award className="w-3.5 h-3.5 text-noir-candleDark" />
            </div>
          )}
        </div>

        {/* Description Snippet */}
        <p className="text-xs font-serif text-noir-inkMuted line-clamp-2 mb-4 leading-relaxed italic">
          &ldquo;{caseData.description}&rdquo;
        </p>
      </div>

      {/* Footer Info & Progress */}
      <div className="pt-3 border-t border-noir-borderDark/60 flex flex-col gap-2.5">
        {/* Progress bar */}
        {!isLocked && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-typewriter text-noir-inkMuted">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-noir-blood" />
                {lang === 'VI'
                  ? `Tiến độ: ${completedQuestionsCount}/${totalQuestions} Đầu mối`
                  : `Progress: ${completedQuestionsCount}/${totalQuestions} Leads`}
              </span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-noir-card rounded-[1px] overflow-hidden border border-noir-borderDark/50">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  isCompleted ? 'bg-noir-stamp' : 'bg-noir-blood'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-typewriter">
          <div className="flex items-center gap-3">
            <span className="text-noir-candleDark font-bold flex items-center gap-1">
              ⭐ {caseData.baseScore}
            </span>
          </div>

          <div className="flex items-center gap-1 text-noir-inkMuted group-hover:text-noir-blood transition-colors text-xs font-bold uppercase tracking-wider">
            {isLocked ? (
              <span className="text-noir-blood font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> {lang === 'VI' ? 'Bảo Mật' : 'Classified'}
              </span>
            ) : (
              <span className="flex items-center gap-0.5">
                {lang === 'VI' ? 'Mở Hồ Sơ' : 'Open File'} <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
