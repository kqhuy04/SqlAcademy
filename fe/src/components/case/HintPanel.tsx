import React from 'react';
import { Mail, AlertTriangle, Eye, Check } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { Button } from '@/components/ui/Button';

interface HintPanelProps {
  hasHint1?: boolean;
  hasHint2?: boolean;
  hasHint3?: boolean;
  hint1?: string | null;
  hint2?: string | null;
  hint3?: string | null;
  revealedHints: number[];
  onRevealHint: (hintNumber: number) => void;
  isUnlocking?: boolean;
}

export const HintPanel: React.FC<HintPanelProps> = ({
  hasHint1,
  hasHint2,
  hasHint3,
  hint1,
  hint2,
  hint3,
  revealedHints,
  onRevealHint,
  isUnlocking = false,
}) => {
  const { lang } = useLanguageStore();

  const hints = [
    {
      number: 1,
      available: hasHint1 ?? Boolean(hint1),
      text: hint1,
      title: lang === 'VI' ? 'Gợi ý 1: Bảng & Cột cần dùng' : 'Hint 1: Target Tables & Columns',
    },
    {
      number: 2,
      available: hasHint2 ?? Boolean(hint2),
      text: hint2,
      title: lang === 'VI' ? 'Gợi ý 2: Điều kiện lọc (WHERE / JOIN)' : 'Hint 2: Filtering Criteria (WHERE / JOIN)',
    },
    {
      number: 3,
      available: hasHint3 ?? Boolean(hint3),
      text: hint3,
      title: lang === 'VI' ? 'Gợi ý 3: Hướng dẫn viết câu lệnh' : 'Hint 3: Query Structure',
    },
  ].filter((h) => h.available);

  if (hints.length === 0) return null;

  return (
    <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-4 space-y-3 shadow-noir-card">
      <div className="flex items-center justify-between pb-2 border-b-2 border-noir-borderDark">
        <div className="flex items-center gap-2 text-xs font-typewriter font-bold uppercase tracking-wider text-noir-blood">
          <Mail className="w-4 h-4" />
          <span>{lang === 'VI' ? 'GỢI Ý VỤ ÁN' : 'CASE HINTS'}</span>
        </div>
        <span className="text-[11px] font-typewriter text-noir-inkMuted">
          {lang === 'VI' ? 'Đã mở:' : 'Unsealed:'} <strong className="text-noir-blood">{revealedHints.length}</strong>/{hints.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {hints.map((hint) => {
          const isRevealed = revealedHints.includes(hint.number);

          return (
            <div
              key={hint.number}
              className={`border-2 rounded-[3px] p-3 transition-colors ${
                isRevealed
                  ? 'bg-noir-card/60 border-noir-borderDark'
                  : 'bg-noir-paper border-dashed border-noir-borderDark/90 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-typewriter font-bold text-noir-ink flex items-center gap-1.5">
                  {isRevealed ? (
                    <Check className="w-3.5 h-3.5 text-noir-stamp" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-noir-blood/60" />
                  )}
                  {hint.title}
                </span>

                {!isRevealed ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-typewriter text-noir-blood bg-noir-blood/10 px-1.5 py-0.5 rounded-[2px] border border-dashed border-noir-blood font-bold flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> {lang === 'VI' ? '-20% điểm' : '-20% score'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs py-0 px-2.5 text-noir-blood border-noir-blood/60 hover:bg-noir-blood/10 hover:border-noir-blood"
                      onClick={() => onRevealHint(hint.number)}
                      disabled={isUnlocking}
                      leftIcon={<Eye className="w-3 h-3" />}
                    >
                      {isUnlocking
                        ? lang === 'VI'
                          ? 'Đang mở...'
                          : 'Unsealing...'
                        : lang === 'VI'
                        ? 'Mở Manh Mối'
                        : 'Unseal Clue'}
                    </Button>
                  </div>
                ) : (
                  <span className="text-[10px] font-typewriter uppercase tracking-widest text-noir-stamp bg-noir-stamp/10 px-2 py-0.5 rounded-[2px] border border-dashed border-noir-stamp font-bold">
                    {lang === 'VI' ? 'ĐÃ MỞ' : 'UNSEALED'}
                  </span>
                )}
              </div>

              {isRevealed && (
                <div className="mt-2.5 pt-2 border-t border-noir-borderDark/60 text-xs text-noir-ink font-mono leading-relaxed bg-[#FAF6EC] p-2.5 rounded-[2px] border border-noir-borderDark/40">
                  {hint.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
