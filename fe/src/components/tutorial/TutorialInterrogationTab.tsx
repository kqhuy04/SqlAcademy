import React, { useState } from 'react';
import type { Database } from 'sql.js';
import type { Tab2Interrogation, QueryResult } from '@/types/tutorial.types';
import { executeQuery } from '@/services/sqliteEngine';
import { Button } from '@/components/ui/Button';
import {
  HelpCircle,
  Bug,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Copy,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface TutorialInterrogationTabProps {
  interrogation: Tab2Interrogation;
  db: Database | null;
  lang: 'VI' | 'EN';
  onInsertSnippet: (snippet: string) => void;
  onProceedToSolve: () => void;
}

export const TutorialInterrogationTab: React.FC<TutorialInterrogationTabProps> = ({
  interrogation,
  db,
  lang,
  onInsertSnippet,
  onProceedToSolve,
}) => {
  const { predictionQuiz, bugBounties, cheatCards } = interrogation;

  // Quiz state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLiveResult, setQuizLiveResult] = useState<QueryResult | null>(null);

  // Bug bounty state: set of tested bug ids
  const [testedBugIds, setTestedBugIds] = useState<string[]>([]);
  const [bugOutputs, setBugOutputs] = useState<Record<string, { error?: string; rowCount?: number }>>({});

  const handleCheckQuiz = () => {
    if (!selectedOptionId) return;
    setQuizSubmitted(true);
    if (db) {
      try {
        const res = executeQuery(db, predictionQuiz.query);
        setQuizLiveResult(res);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTestBug = (bugId: string, query: string) => {
    if (!db) return;
    try {
      const res = executeQuery(db, query);
      setBugOutputs((prev) => ({
        ...prev,
        [bugId]: { rowCount: res.rowCount },
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setBugOutputs((prev) => ({
        ...prev,
        [bugId]: { error: msg },
      }));
    }
    setTestedBugIds((prev) => (prev.includes(bugId) ? prev : [...prev, bugId]));
  };

  return (
    <div className="space-y-6">
      {/* 4. Đoán trước khi chạy (Prediction Quiz) */}
      <div className="bg-noir-card border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-noir-borderDark">
          <HelpCircle className="w-5 h-5 text-noir-candleDark" />
          <h3 className="text-sm font-typewriter font-bold uppercase tracking-wider text-noir-ink">
            {lang === 'VI' ? '4. Thẩm Đoán Trước Khi Chạy (Prediction Quiz)' : '4. Predict Before Executing'}
          </h3>
        </div>

        <p className="font-serif text-sm font-semibold text-noir-ink leading-relaxed">
          {lang === 'VI' ? predictionQuiz.questionVi : (predictionQuiz.questionEn || predictionQuiz.questionVi)}
        </p>

        {/* Code query */}
        <pre className="font-mono text-xs text-noir-ink font-bold bg-white p-3 rounded border border-noir-border overflow-x-auto shadow-inner">
          {predictionQuiz.query}
        </pre>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {predictionQuiz.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let optStyle = "bg-noir-paper border-noir-borderDark text-noir-ink hover:bg-noir-card";

            if (quizSubmitted) {
              if (opt.isCorrect) {
                optStyle = "bg-emerald-100 border-emerald-600 text-emerald-950 font-bold";
              } else if (isSelected && !opt.isCorrect) {
                optStyle = "bg-red-100 border-red-600 text-red-950 line-through";
              }
            } else if (isSelected) {
              optStyle = "bg-noir-blood text-noir-parchment border-noir-bloodDark font-bold";
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={quizSubmitted}
                onClick={() => setSelectedOptionId(opt.id)}
                className={cn(
                  "p-3 rounded-[3px] border text-left text-xs font-mono transition-all flex items-center justify-between gap-2",
                  optStyle
                )}
              >
                <span>{lang === 'VI' ? opt.textVi : (opt.textEn || opt.textVi)}</span>
                {quizSubmitted && opt.isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                )}
                {quizSubmitted && isSelected && !opt.isCorrect && (
                  <XCircle className="w-4 h-4 text-red-700 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        {!quizSubmitted ? (
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!selectedOptionId}
              onClick={handleCheckQuiz}
              className="flex items-center gap-1.5 font-typewriter text-xs font-bold"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{lang === 'VI' ? 'Đối Chiếu Với Dữ Liệu Thật' : 'Verify with Live Database'}</span>
            </Button>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-950/10 border-l-4 border-emerald-700 rounded-r-[3px] space-y-2 animate-fadeIn">
            <div className="text-xs font-typewriter font-bold text-emerald-900 flex items-center gap-1.5 uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'VI' ? 'Lời Giải Thẩm Vấn:' : 'Interrogation Explanation:'}</span>
            </div>
            <p className="font-serif text-xs text-emerald-950 leading-relaxed font-medium">
              {lang === 'VI' ? predictionQuiz.explanationVi : (predictionQuiz.explanationEn || predictionQuiz.explanationVi)}
            </p>
            {quizLiveResult && (
              <div className="text-[11px] font-mono text-emerald-900 font-bold bg-white/80 p-2 rounded border border-emerald-700/30">
                {lang === 'VI'
                  ? `Thực tế SQLite trả về: ${quizLiveResult.values.map(v => v[0]).join(', ')} (${quizLiveResult.rowCount} kẻ).`
                  : `Actual SQLite result: ${quizLiveResult.values.map(v => v[0]).join(', ')} (${quizLiveResult.rowCount} rows).`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Tìm lỗi (3 Bẫy kinh điển) */}
      <div className="bg-noir-card border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-noir-borderDark">
          <Bug className="w-5 h-5 text-noir-blood" />
          <h3 className="text-sm font-typewriter font-bold uppercase tracking-wider text-noir-ink">
            {lang === 'VI' ? '5. Săn Bẫy Kinh Điển (Bug Bounty)' : '5. Classic Bug Bounties'}
          </h3>
        </div>

        <p className="text-xs font-serif text-noir-ink leading-relaxed">
          {lang === 'VI'
            ? 'Tân binh rất dễ sập 3 cạm bẫy dưới đây. Bấm nút chạy từng câu để xem thông báo lỗi thực tế từ hệ thống:'
            : 'Rookies frequently fall into these 3 syntax traps. Execute each query to inspect the real engine feedback:'}
        </p>

        <div className="space-y-3.5">
          {bugBounties.map((b) => {
            const hasTested = testedBugIds.includes(b.id);
            const output = bugOutputs[b.id];

            return (
              <div key={b.id} className="p-3.5 bg-noir-paper border border-noir-borderDark rounded-[3px] space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-typewriter font-bold text-noir-blood uppercase">
                    {lang === 'VI' ? b.titleVi : (b.titleEn || b.titleVi)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestBug(b.id, b.buggyQuery)}
                    className="h-6 text-[11px] px-2 flex items-center gap-1 border-noir-borderDark font-typewriter text-noir-ink font-bold"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{hasTested ? (lang === 'VI' ? 'Chạy lại' : 'Re-run') : (lang === 'VI' ? 'Chạy xem lỗi' : 'Run to inspect')}</span>
                  </Button>
                </div>

                <pre className="font-mono text-xs bg-white p-2.5 rounded border border-noir-border text-red-950 font-bold overflow-x-auto">
                  {b.buggyQuery}
                </pre>

                {/* Revealed Error & Flashcard */}
                {hasTested && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <div className="p-2 bg-red-950/15 border-l-4 border-red-700 text-xs font-mono text-red-950 rounded-r">
                      <span className="font-bold">{lang === 'VI' ? 'Hệ thống báo: ' : 'Engine output: '}</span>
                      {output?.error
                        ? output.error
                        : lang === 'VI'
                        ? `Truy vấn trả về ${output?.rowCount ?? 0} dòng (không khớp dữ liệu)!`
                        : `Query returned ${output?.rowCount ?? 0} rows (data mismatch)!`}
                    </div>

                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-xs font-serif text-amber-950 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-typewriter font-bold uppercase text-amber-900 block text-[10px]">
                          {lang === 'VI' ? 'Thẻ nhớ 1 dòng:' : '1-Line Flashcard:'}
                        </span>
                        <span className="font-bold">{lang === 'VI' ? b.flashcardVi : (b.flashcardEn || b.flashcardVi)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Thẻ bài (Cheat Cards) */}
      <div className="bg-noir-card border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-noir-borderDark flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-noir-candleDark" />
            <h3 className="text-sm font-typewriter font-bold uppercase tracking-wider text-noir-ink">
              {lang === 'VI' ? '6. Thẻ Bài Vũ Khí (Cheat Cards)' : '6. Tactical Cheat Cards'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-noir-inkMuted">
            {lang === 'VI' ? 'Bấm để chèn vào Editor sang Tab 3' : 'Click to insert into editor'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cheatCards.map((c, idx) => (
            <div
              key={idx}
              className="p-3 bg-noir-paper border border-noir-borderDark rounded-[3px] flex flex-col justify-between gap-2.5 shadow-sm hover:border-noir-blood transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-mono font-black text-noir-parchment bg-noir-blood px-2 py-0.5 rounded-[2px]">
                    {c.keyword}
                  </span>
                  <span className="text-[11px] font-typewriter text-noir-ink font-bold">
                    {lang === 'VI' ? c.labelVi : (c.labelEn || c.labelVi)}
                  </span>
                </div>
                <p className="text-[11px] font-serif text-noir-inkMuted leading-relaxed">
                  {lang === 'VI' ? c.descriptionVi : (c.descriptionEn || c.descriptionVi)}
                </p>
                <div className="mt-2 text-[11px] font-mono text-noir-ink font-bold bg-white p-1.5 rounded border border-noir-border truncate">
                  {c.syntaxTemplate}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onInsertSnippet(c.syntaxTemplate)}
                className="w-full h-6 text-[10.5px] flex items-center justify-center gap-1 font-typewriter border-noir-borderDark text-noir-blood hover:bg-noir-card"
              >
                <Copy className="w-3 h-3" />
                <span>{lang === 'VI' ? 'Chèn & Thử sang Tab 3' : 'Insert & Try in Tab 3'}</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation to Tab 3 */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="gold"
          size="md"
          onClick={onProceedToSolve}
          className="flex items-center gap-2 font-typewriter font-bold shadow-noir-card text-xs uppercase"
        >
          <span>{lang === 'VI' ? 'Chuyển Sang Tab 3: Phá Án (Thực Hành)' : 'Proceed to Solve Case'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
