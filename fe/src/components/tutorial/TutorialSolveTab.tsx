import React, { useState } from 'react';
import type { Tab3SolveCase, TableMetadata, ValidationResult } from '@/types/tutorial.types';
import { TutorialSQLEditor } from '@/components/tutorial/TutorialSQLEditor';
import { Button } from '@/components/ui/Button';
import {
  Scale,
  Award,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface TutorialSolveTabProps {
  solveCase: Tab3SolveCase;
  userCode: string;
  setUserCode: (code: string) => void;
  onRunQuery: () => void;
  onSubmit: () => void;
  onReset: () => void;
  isQueryRunning: boolean;
  isSubmitting: boolean;
  validationResult: ValidationResult | null;
  tables?: TableMetadata[];
  lang: 'VI' | 'EN';
  currentChallengeIndex: number;
  onSelectChallenge: (index: number) => void;
  completedChallengeIds: string[];
  onSaveToNotes: (summary: string) => void;
  onNextLesson?: () => void;
  children?: React.ReactNode;
}

export const TutorialSolveTab: React.FC<TutorialSolveTabProps> = ({
  solveCase,
  userCode,
  setUserCode,
  onRunQuery,
  onSubmit,
  onReset,
  isQueryRunning,
  isSubmitting,
  validationResult,
  tables,
  lang,
  currentChallengeIndex,
  onSelectChallenge,
  completedChallengeIds,
  onSaveToNotes,
  onNextLesson,
  children,
}) => {
  const { challenges, takeawayFlashcard } = solveCase;
  const currentChallenge = challenges[currentChallengeIndex] || challenges[0];

  // Progressive hint level (0: none, 1: concept, 2: template, 3: solution)
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [hasSavedNotes, setHasSavedNotes] = useState(false);

  const handleRevealNextHint = () => {
    if (hintLevel < 3) {
      setHintLevel((prev) => prev + 1);
    }
  };

  const summaryLines =
    lang === 'VI'
      ? takeawayFlashcard.summaryLinesVi
      : takeawayFlashcard.summaryLinesEn || takeawayFlashcard.summaryLinesVi;

  const handleSaveFlashcard = () => {
    const header = lang === 'VI' ? 'SỔ TAY THÁM TỬ' : 'DETECTIVE NOTES';
    const text =
      `${header} - ${takeawayFlashcard.reviewTopic}\n` +
      `1. ${summaryLines[0]}\n` +
      `2. ${summaryLines[1]}\n` +
      `3. ${summaryLines[2]}`;
    onSaveToNotes(text);
    setHasSavedNotes(true);
    toast.success(lang === 'VI' ? 'Đã lưu 3 điểm chốt vào Sổ tay thám tử!' : 'Saved takeaway to Detective Notes!');
  };

  const allCompleted = challenges.every((c) => completedChallengeIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* 4 Thử thách tăng dần ⭐ -> ⭐⭐⭐ */}
      <div className="bg-noir-card border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-noir-borderDark flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-typewriter font-bold uppercase tracking-wider text-noir-ink">
              {lang === 'VI' ? '7. Thử Thách Phá Án (Tăng Dần)' : '7. Detective Case Challenges'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-noir-inkMuted">
            {lang === 'VI' ? `Đã hoàn thành ${completedChallengeIds.length}/${challenges.length} thử thách` : `${completedChallengeIds.length}/${challenges.length} challenges passed`}
          </span>
        </div>

        {/* Challenge selector pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {challenges.map((ch, idx) => {
            const isSelected = currentChallengeIndex === idx;
            const isDone = completedChallengeIds.includes(ch.id);
            const chTitle = lang === 'VI' ? ch.titleVi : (ch.titleEn || ch.titleVi);

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  onSelectChallenge(idx);
                  setHintLevel(0);
                }}
                className={cn(
                  "p-2.5 rounded-[3px] border text-left transition-all relative flex flex-col justify-between",
                  isSelected
                    ? "bg-noir-blood text-noir-parchment border-noir-bloodDark shadow-sm scale-[1.02]"
                    : isDone
                    ? "bg-emerald-950/15 border-emerald-700/60 text-emerald-950 hover:bg-emerald-950/25"
                    : "bg-noir-paper border-noir-borderDark text-noir-ink hover:bg-noir-card"
                )}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold tracking-tight">
                    {ch.difficulty === 1 && (lang === 'VI' ? '⭐ Dễ' : '⭐ Easy')}
                    {ch.difficulty === 2 && (lang === 'VI' ? '⭐⭐ Vừa' : '⭐⭐ Medium')}
                    {ch.difficulty === 3 && (lang === 'VI' ? '⭐⭐⭐ Khó' : '⭐⭐⭐ Hard')}
                    {ch.difficulty === 4 && (lang === 'VI' ? '⭐⭐⭐ BẪY' : '⭐⭐⭐ TRAP')}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-[11px] font-typewriter font-bold truncate">
                  {chTitle.split(':')[1] || chTitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Challenge Mission Card */}
        <div className="p-4 bg-noir-paper border border-noir-borderDark rounded-[3px] space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-noir-blood" />
            <h4 className="text-xs font-typewriter font-bold uppercase tracking-wider text-noir-blood">
              {lang === 'VI' ? currentChallenge.titleVi : (currentChallenge.titleEn || currentChallenge.titleVi)}
            </h4>
          </div>

          <p className="font-serif text-sm font-semibold text-noir-ink leading-relaxed">
            {lang === 'VI' ? currentChallenge.missionVi : (currentChallenge.missionEn || currentChallenge.missionVi)}
          </p>

          {/* 3-Tier Progressive Hints */}
          <div className="pt-2 border-t border-noir-border/60 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-typewriter text-noir-inkMuted font-bold uppercase flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                {lang === 'VI' ? 'Gợi ý 3 tầng:' : '3-Tier Progressive Hints:'}
              </span>
              {hintLevel < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRevealNextHint}
                  className="h-6 text-[10.5px] px-2 border-noir-borderDark font-typewriter"
                >
                  {hintLevel === 0 && (lang === 'VI' ? 'Mở gợi ý 1 (Khái niệm)' : 'Open Hint 1')}
                  {hintLevel === 1 && (lang === 'VI' ? 'Mở gợi ý 2 (Khung lệnh)' : 'Open Hint 2')}
                  {hintLevel === 2 && (lang === 'VI' ? 'Mở gợi ý 3 (Xem đáp án)' : 'Open Solution')}
                </Button>
              )}
            </div>

            {hintLevel >= 1 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs font-serif text-amber-950 animate-fadeIn">
                <span className="font-bold text-amber-900 block font-typewriter text-[10px] uppercase">
                  {lang === 'VI' ? 'Tầng 1 (Khái niệm):' : 'Tier 1 (Concept):'}
                </span>
                {lang === 'VI'
                  ? currentChallenge.hints.level1ConceptVi
                  : currentChallenge.hints.level1ConceptEn || currentChallenge.hints.level1ConceptVi}
              </div>
            )}

            {hintLevel >= 2 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs font-mono text-amber-950 animate-fadeIn">
                <span className="font-bold text-amber-900 block font-typewriter text-[10px] uppercase">
                  {lang === 'VI' ? 'Tầng 2 (Khung điền khuyết):' : 'Tier 2 (Template):'}
                </span>
                <code>
                  {lang === 'VI'
                    ? currentChallenge.hints.level2TemplateVi
                    : currentChallenge.hints.level2TemplateEn || currentChallenge.hints.level2TemplateVi}
                </code>
              </div>
            )}

            {hintLevel >= 3 && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-xs font-mono text-emerald-950 animate-fadeIn">
                <span className="font-bold text-emerald-900 block font-typewriter text-[10px] uppercase">
                  {lang === 'VI' ? 'Tầng 3 (Lời giải hoàn chỉnh):' : 'Tier 3 (Full Solution):'}
                </span>
                <code>{currentChallenge.hints.level3SolutionQuery}</code>
              </div>
            )}
          </div>
        </div>

        {/* Validation Feedback Banner if tested */}
        {validationResult && (
          <div
            className={cn(
              "p-3.5 rounded-[3px] border animate-fadeIn",
              validationResult.passed
                ? "bg-emerald-100/80 border-emerald-600 text-emerald-950"
                : "bg-red-100/80 border-red-600 text-red-950"
            )}
          >
            <div className="flex items-start gap-2.5">
              {validationResult.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-xs font-typewriter font-bold uppercase">
                  {validationResult.passed
                    ? lang === 'VI'
                      ? 'CHÍNH XÁC • PHÁ ÁN THÀNH CÔNG!'
                      : 'CORRECT • CASE SOLVED!'
                    : lang === 'VI'
                    ? 'KẾT QUẢ CHƯA KHỚP'
                    : 'RESULT MISMATCH'}
                </div>
                <div className="font-serif text-xs leading-relaxed font-medium">
                  {lang === 'VI' ? validationResult.messageVi : validationResult.messageEn}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CodeMirror SQL Editor */}
        <TutorialSQLEditor
          value={userCode}
          onChange={setUserCode}
          onRunQuery={onRunQuery}
          onSubmit={onSubmit}
          onReset={onReset}
          isQueryRunning={isQueryRunning}
          isSubmitting={isSubmitting}
          tables={tables}
          lang={lang}
        />

        {/* Workbench Results & Schema Tabs */}
        {children}
      </div>

      {/* 8. Thẻ nhớ chốt bài (Summary Flashcard 3 dòng) */}
      <div className="bg-noir-card border-2 border-amber-700/60 rounded-[4px] p-5 shadow-noir-card space-y-3 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="flex items-center justify-between pb-2 border-b border-noir-borderDark flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-typewriter font-bold uppercase tracking-wider text-amber-950">
              {lang === 'VI' ? '8. Thẻ Nhớ Chốt Bài (3 Dòng Khắc Cốt Ghi Tâm)' : '8. Master Flashcard Takeaway'}
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveFlashcard}
            disabled={hasSavedNotes}
            className="h-7 text-xs px-2.5 flex items-center gap-1.5 font-typewriter border-amber-700 text-amber-950 font-bold"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-800" />
            <span>{hasSavedNotes ? (lang === 'VI' ? 'Đã lưu sổ tay' : 'Saved') : (lang === 'VI' ? 'Lưu vào Sổ tay thám tử' : 'Save to Notes')}</span>
          </Button>
        </div>

        <ol className="space-y-2 list-decimal list-inside font-serif text-xs sm:text-sm font-semibold text-noir-ink leading-relaxed">
          {summaryLines.map((line, idx) => (
            <li key={idx} className="p-2 bg-noir-paper rounded border border-noir-borderDark/40">
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Next Lesson Action */}
      {onNextLesson && allCompleted && (
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="gold"
            size="md"
            onClick={onNextLesson}
            className="flex items-center gap-2 font-typewriter font-bold shadow-noir-card text-xs uppercase animate-pulse"
          >
            <span>{lang === 'VI' ? 'Hoàn Tất 4 Thử Thách • Chuyển Bài Tiếp Theo' : 'All Solved • Next Lesson'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
