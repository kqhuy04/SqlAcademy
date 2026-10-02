import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '@/store/languageStore';
import { DifficultyBadge, Badge } from '@/components/ui/Badge';
import {
  ChevronLeft,
  Calculator,
  Languages,
  Award,
  Sparkles,
  Keyboard,
} from 'lucide-react';

interface DeskToolbarProps {
  caseId: number;
  orderIndex?: number;
  title: string;
  difficulty: string;
  badgeName?: string;
  scorePreview: number;
  baseScore: number;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  shortcutsEnabled: boolean;
  onToggleShortcuts: () => void;
}

export const DeskToolbar: React.FC<DeskToolbarProps> = ({
  caseId,
  orderIndex,
  title,
  difficulty,
  badgeName,
  scorePreview,
  baseScore,
  reducedMotion,
  onToggleReducedMotion,
  shortcutsEnabled,
  onToggleShortcuts,
}) => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguageStore();

  return (
    <header className="bg-noir-card border-b-2 border-noir-borderDark px-3 py-1 flex items-center justify-between gap-2 shadow-noir-sm z-30 select-none h-11 shrink-0">
      {/* Left: Return & Case Identity */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button
          type="button"
          onClick={() => navigate('/cases')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-noir-paper hover:bg-noir-paperLight border border-noir-borderDark text-noir-ink hover:text-noir-blood text-xs font-typewriter font-bold uppercase transition-all shadow-xs min-h-[32px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassDark shrink-0"
          title={lang === 'VI' ? 'Quay lại tủ hồ sơ lưu trữ' : 'Return to case archives'}
        >
          <ChevronLeft className="w-4 h-4 text-noir-blood" aria-hidden="true" />
          <span className="hidden sm:inline">{lang === 'VI' ? 'Tủ Hồ Sơ' : 'Case Files'}</span>
        </button>

        <div className="h-4 w-px bg-noir-borderDark hidden sm:block shrink-0" />

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-typewriter text-xs font-bold text-noir-blood uppercase tracking-wider bg-noir-blood/10 px-1.5 py-0.5 rounded-[2px] border border-noir-blood/20 shrink-0">
            #{String(orderIndex || caseId).padStart(2, '0')}
          </span>
          <DifficultyBadge difficulty={difficulty} />
          {badgeName && (
            <Badge variant="gold" size="sm" className="gap-1 font-typewriter hidden md:inline-flex shrink-0">
              <Award className="w-3.5 h-3.5 text-noir-candleDark" aria-hidden="true" />
              <span>{badgeName.toUpperCase()}</span>
            </Badge>
          )}
          <h1
            className="text-xs sm:text-sm font-display font-black text-noir-ink tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md"
            title={title}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Projected Score, Shortcuts Toggle, Reduced Motion & Language Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Real-time Score Preview */}
        <div
          className="flex items-center gap-1 bg-noir-paper border border-noir-borderDark px-2 py-0.5 rounded-[2px] text-xs font-typewriter shadow-inner shadow-noir-ink/5"
          title={
            lang === 'VI'
              ? 'Điểm dự kiến sau khi trừ gợi ý (-20%/lần) và số lần chạy truy vấn'
              : 'Projected score after hint deductions (-20% each) and query attempts'
          }
        >
          <Calculator className="w-3.5 h-3.5 text-noir-candleDark" aria-hidden="true" />
          <span className="text-noir-inkMuted font-bold hidden sm:inline">{lang === 'VI' ? 'DỰ KIẾN:' : 'SCORE:'}</span>
          <span className="font-bold text-noir-candleDark text-xs sm:text-sm">{scorePreview}</span>
          <span className="text-noir-inkMuted font-bold">/{baseScore}</span>
        </div>

        {/* Shortcuts 1-5 Setting Toggle (Requirement 3) */}
        <button
          type="button"
          onClick={onToggleShortcuts}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-xs font-typewriter border transition-all cursor-pointer min-h-[32px] ${
            shortcutsEnabled
              ? 'bg-noir-paper text-noir-ink border-noir-borderDark hover:border-noir-brassDark'
              : 'bg-noir-card text-noir-inkMuted border-dashed border-noir-borderDark opacity-75'
          }`}
          title={
            shortcutsEnabled
              ? lang === 'VI'
                ? 'Phím tắt 1–5: ĐANG BẬT (Bấm để tắt)'
                : 'Single-key shortcuts 1–5: ON (Click to disable)'
              : lang === 'VI'
              ? 'Phím tắt 1–5: ĐÃ TẮT (Bấm để bật)'
              : 'Single-key shortcuts 1–5: OFF (Click to enable)'
          }
          aria-label={
            shortcutsEnabled
              ? 'Single-key shortcuts are on. Click to turn off.'
              : 'Single-key shortcuts are off. Click to turn on.'
          }
        >
          <Keyboard className={`w-3.5 h-3.5 ${shortcutsEnabled ? 'text-noir-blood' : 'text-noir-inkMuted'}`} />
          <span className="hidden lg:inline text-xs font-bold">
            {shortcutsEnabled ? '1-5 ON' : '1-5 OFF'}
          </span>
        </button>

        {/* Reduce Effects / Motion Toggle */}
        <button
          type="button"
          onClick={onToggleReducedMotion}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-xs font-typewriter border transition-all cursor-pointer min-h-[32px] ${
            reducedMotion
              ? 'bg-noir-blood text-noir-parchment border-noir-blood font-bold'
              : 'bg-noir-paper text-noir-ink border-noir-borderDark hover:bg-noir-paperLight'
          }`}
          title={
            reducedMotion
              ? lang === 'VI'
                ? 'Chế độ giảm hiệu ứng: ĐANG BẬT'
                : 'Reduced effects: ON'
              : lang === 'VI'
              ? 'Bật chế độ giảm chuyển động / hiệu ứng'
              : 'Enable reduced motion effects'
          }
          aria-pressed={reducedMotion}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-xs">
            {reducedMotion
              ? lang === 'VI' ? 'Giảm hiệu ứng' : 'Effects reduced'
              : lang === 'VI' ? 'Hiệu ứng đầy đủ' : 'Full motion'}
          </span>
        </button>

        {/* Bilingual Language Switcher */}
        <button
          type="button"
          onClick={() => setLang(lang === 'EN' ? 'VI' : 'EN')}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-[2px] text-xs font-typewriter bg-noir-paper border border-noir-borderDark text-noir-ink hover:border-noir-blood transition-colors font-bold uppercase cursor-pointer min-h-[32px] shadow-xs"
          title={lang === 'VI' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          <Languages className="w-3.5 h-3.5 text-noir-blood" aria-hidden="true" />
          <span>{lang === 'EN' ? 'EN' : 'VI'}</span>
        </button>
      </div>
    </header>
  );
};
