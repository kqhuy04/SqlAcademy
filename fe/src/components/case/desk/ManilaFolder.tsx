import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/store/languageStore';
import type { CaseQuestionDTO } from '@/types/case.types';
import {
  FolderOpen,
  Folder,
  FileText,
  HelpCircle,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ManilaFolderProps {
  caseId: number;
  orderIndex?: number;
  title: string;
  description: string;
  questions: CaseQuestionDTO[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  isQuestionSolved: boolean;
  reducedMotion?: boolean;
  isOpen?: boolean;
  onToggleOpen?: (nextState?: boolean) => void;
}

export const ManilaFolder: React.FC<ManilaFolderProps> = ({
  caseId,
  orderIndex,
  title,
  description,
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  isQuestionSolved,
  reducedMotion = false,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  const { lang } = useLanguageStore();
  const [localIsOpen, setLocalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;

  const toggleOpen = (explicit?: boolean) => {
    const next = explicit !== undefined ? explicit : !isOpen;
    if (onToggleOpen) {
      onToggleOpen(next);
    } else {
      setLocalIsOpen(next);
    }
  };

  const [activeSheet, setActiveSheet] = useState<'briefing' | 'question'>('question');
  const [isExpanded, setIsExpanded] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div
      className={cn(
        'relative transition-all duration-300 select-none',
        isExpanded ? 'fixed inset-4 sm:inset-10 z-50 flex flex-col shadow-noir-modal' : 'w-full'
      )}
    >
      {/* Backdrop when expanded full-screen */}
      {isExpanded && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={lang === 'VI' ? 'Đóng hồ sơ phóng to' : 'Close expanded dossier'}
          className="fixed inset-0 bg-noir-ink/60 backdrop-blur-xs z-[-1] cursor-default w-full h-full border-0 p-0 m-0"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Manila Folder Container */}
      <div className="relative bg-noir-manila border-2 border-noir-manilaDark rounded-[4px] shadow-noir-card overflow-hidden flex flex-col">
        {/* Top Folder Tab with Case Label */}
        <div className="bg-gradient-to-r from-noir-manilaDark via-noir-manila to-noir-manilaLight px-4 py-2 border-b-2 border-noir-manilaDark flex items-center justify-between gap-3">
          {/* Manila Tab Header */}
          <button
            type="button"
            onClick={() => toggleOpen()}
            className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassDark rounded-[2px]"
            aria-expanded={isOpen}
            aria-label={lang === 'VI' ? 'Đóng/mở bìa hồ sơ manila' : 'Toggle manila case file folder'}
          >
            <div className="w-8 h-8 rounded-[3px] bg-noir-manilaDark/50 border border-noir-manilaDark flex items-center justify-center text-noir-ink shrink-0 group-hover:scale-105 transition-transform">
              {isOpen ? (
                <FolderOpen className="w-4 h-4 text-noir-blood" aria-hidden="true" />
              ) : (
                <Folder className="w-4 h-4 text-noir-inkMuted" aria-hidden="true" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-noir-blood bg-noir-blood/10 px-1.5 py-0.2 rounded border border-noir-blood/20">
                  {lang === 'VI' ? 'HỒ SƠ MANILA' : 'MANILA DOSSIER'} #{String(orderIndex || caseId).padStart(2, '0')}
                </span>
                <span className="text-xs font-typewriter text-noir-inkMuted font-bold hidden sm:inline">
                  [Phím 1]
                </span>
              </div>
              <h2 className="font-display font-bold text-xs sm:text-sm text-noir-ink line-clamp-1">
                {title}
              </h2>
            </div>
          </button>

          {/* Folder Sheet Controls */}
          <div className="flex items-center gap-1.5">
            {/* Sheet Switcher Tabs */}
            <div className="flex items-center bg-noir-manilaDark/40 p-0.5 rounded-[2px] border border-noir-manilaDark">
              <button
                type="button"
                onClick={() => {
                  toggleOpen(true);
                  setActiveSheet('briefing');
                }}
                className={cn(
                  'px-2.5 py-1 text-xs font-typewriter font-bold uppercase tracking-wider rounded-[2px] transition-all min-h-[30px]',
                  isOpen && activeSheet === 'briefing'
                    ? 'bg-noir-paper text-noir-blood shadow-xs'
                    : 'text-noir-inkMuted hover:text-noir-ink'
                )}
              >
                {lang === 'VI' ? 'Hiện Trường' : 'Briefing'}
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleOpen(true);
                  setActiveSheet('question');
                }}
                className={cn(
                  'px-2.5 py-1 text-xs font-typewriter font-bold uppercase tracking-wider rounded-[2px] transition-all min-h-[30px] flex items-center gap-1',
                  isOpen && activeSheet === 'question'
                    ? 'bg-noir-paper text-noir-blood shadow-xs'
                    : 'text-noir-inkMuted hover:text-noir-ink'
                )}
              >
                <span>{lang === 'VI' ? 'Đầu Mối' : 'Lead'}</span>
                {questions.length > 1 && (
                  <span className="text-xs font-mono bg-noir-card px-1 rounded border border-noir-borderDark">
                    #{currentQuestionIndex + 1}
                  </span>
                )}
              </button>
            </div>

            {/* Expand / Popout Button */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 rounded-[2px] bg-noir-manilaDark/40 hover:bg-noir-paper text-noir-inkMuted hover:text-noir-ink border border-noir-manilaDark transition-colors"
              title={isExpanded ? (lang === 'VI' ? 'Thu nhỏ lại bàn' : 'Restore size') : (lang === 'VI' ? 'Phóng to tài liệu' : 'Expand full docket')}
              aria-label={isExpanded ? 'Restore folder size' : 'Expand folder'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Collapse Folder Flap */}
            <button
              type="button"
              onClick={() => toggleOpen()}
              className="p-1.5 rounded-[2px] bg-noir-manilaDark/40 hover:bg-noir-paper text-noir-inkMuted hover:text-noir-ink border border-noir-manilaDark transition-colors"
              title={isOpen ? (lang === 'VI' ? 'Đóng nắp kẹp' : 'Close folder') : (lang === 'VI' ? 'Mở nắp kẹp' : 'Open folder')}
            >
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Folder Flap / Sliding Papers Content Area */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0, rotateX: -15 }}
              animate={reducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1, rotateX: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0, rotateX: -15 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.25, ease: 'easeOut' }}
              className="p-3 sm:p-4 bg-gradient-to-b from-noir-manilaLight/80 to-noir-manila/90 flex-1 overflow-y-auto max-h-[460px]"
            >
              {/* SHEET 1: Crime Scene Briefing Paper */}
              {activeSheet === 'briefing' && (
                <div className="relative bg-noir-paperLight border-2 border-noir-borderDark rounded-[3px] p-4 sm:p-5 shadow-noir-card space-y-3">
                  {/* Metal Paperclip Header */}
                  <div className="absolute -top-3.5 right-6 flex items-center gap-1 pointer-events-none">
                    <Paperclip className="w-6 h-6 text-noir-brassDark rotate-12 drop-shadow-xs" />
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b-2 border-noir-borderDark/80">
                    <div className="flex items-center gap-2 text-xs font-typewriter uppercase tracking-wider text-noir-blood font-bold">
                      <FileText className="w-4 h-4" />
                      <span>{lang === 'VI' ? 'BÁO CÁO KHÁM NGHIỆM HIỆN TRƯỜNG' : 'CRIME SCENE INVESTIGATION REPORT'}</span>
                    </div>
                    <span className="text-xs font-typewriter text-noir-stamp font-bold border border-dashed border-noir-stamp px-2 py-0.5 rounded-[2px] bg-noir-stamp/5 uppercase">
                      {lang === 'VI' ? 'HỒ SƠ BẢO MẬT' : 'CONFIDENTIAL'}
                    </span>
                  </div>

                  {/* Incident Narrative */}
                  <div className="text-xs sm:text-sm font-serif text-noir-ink leading-relaxed whitespace-pre-line italic p-1 bg-noir-paper/30 rounded">
                    &ldquo;{description}&rdquo;
                  </div>
                </div>
              )}

              {/* SHEET 2: Active Interrogation Lead / Question Sheet */}
              {activeSheet === 'question' && currentQuestion && (
                <div className="relative bg-noir-paperLight border-2 border-noir-borderDark rounded-[3px] p-4 sm:p-5 shadow-noir-card space-y-4">
                  {/* Top Header of Question Sheet */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b-2 border-noir-borderDark flex-wrap">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-noir-blood" />
                      <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-noir-blood">
                        {lang === 'VI'
                          ? `ĐẦU MỐI ĐIỀU TRA #${currentQuestionIndex + 1} TRÊN ${questions.length}`
                          : `INVESTIGATION LEAD #${currentQuestionIndex + 1} OF ${questions.length}`}
                      </span>
                    </div>

                    {isQuestionSolved && (
                      <span className="flex items-center gap-1 text-xs font-typewriter text-noir-stamp bg-noir-stamp/10 px-2 py-0.5 rounded-[2px] border border-dashed border-noir-stamp font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {lang === 'VI' ? 'ĐÃ PHÁ GIẢI' : 'SOLVED'}
                      </span>
                    )}
                  </div>

                  {/* Multiple Questions Switcher Buttons */}
                  {questions.length > 1 && (
                    <div className="flex items-center gap-1.5 p-1.5 bg-noir-card rounded-[3px] border border-noir-borderDark/60 font-typewriter text-xs">
                      <span className="text-noir-inkMuted font-bold text-xs mr-1">
                        {lang === 'VI' ? 'CHỌN ĐẦU MỐI:' : 'SELECT LEAD:'}
                      </span>
                      {questions.map((q, idx) => (
                        <button
                          key={q.id || idx}
                          type="button"
                          onClick={() => onSelectQuestion(idx)}
                          className={cn(
                            'w-7 h-7 rounded-[2px] font-bold text-xs flex items-center justify-center transition-all cursor-pointer border',
                            currentQuestionIndex === idx
                              ? 'bg-noir-blood text-noir-parchment border-noir-blood shadow-xs'
                              : 'bg-noir-paper text-noir-ink border-noir-borderDark hover:bg-noir-paperLight'
                          )}
                          title={`${lang === 'VI' ? 'Câu hỏi' : 'Lead'} #${idx + 1}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main Question Text */}
                  <div className="p-3.5 bg-noir-paper border border-noir-borderDark/70 rounded-[3px] text-xs sm:text-sm font-serif text-noir-ink leading-relaxed shadow-inner shadow-noir-ink/5">
                    {lang === 'EN'
                      ? currentQuestion.questionEn || currentQuestion.questionVi
                      : currentQuestion.questionVi || currentQuestion.questionEn}
                  </div>

                  {/* Skill Tags */}
                  {currentQuestion.skillTags && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1 font-typewriter">
                      <Tag className="w-3.5 h-3.5 text-noir-inkMuted" />
                      <span className="text-xs text-noir-inkMuted mr-1 font-bold">
                        {lang === 'VI' ? 'Kỹ năng SQL:' : 'Required SQL:'}
                      </span>
                      {currentQuestion.skillTags.split(',').map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-typewriter bg-noir-card text-noir-candleDark px-2 py-0.5 rounded-[2px] border border-noir-borderDark font-bold uppercase"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
