import React, { useState, useMemo } from 'react';
import type { Database } from 'sql.js';
import type { Tab1Dossier, QueryResult } from '@/types/tutorial.types';
import { executeQuery } from '@/services/sqliteEngine';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Play,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface TutorialDossierTabProps {
  dossier: Tab1Dossier;
  db: Database | null;
  lang: 'VI' | 'EN';
  onProceedToInterrogation: () => void;
}

export const TutorialDossierTab: React.FC<TutorialDossierTabProps> = ({
  dossier,
  db,
  lang,
  onProceedToInterrogation,
}) => {
  const { casePain, metaphor, liveQuery } = dossier;

  // Run naive query state
  const [hasRunNaive, setHasRunNaive] = useState(false);
  const [naiveResult, setNaiveResult] = useState<QueryResult | null>(null);

  // Active clause in live interactive query
  const [selectedClauseIndex, setSelectedClauseIndex] = useState<number>(2); // Default to WHERE clause

  // Compute live query execution
  const liveResult = useMemo(() => {
    if (!db) return null;
    try {
      return executeQuery(db, liveQuery.fullQuery);
    } catch {
      return null;
    }
  }, [db, liveQuery.fullQuery]);

  const handleRunNaiveQuery = () => {
    if (!db) return;
    try {
      const res = executeQuery(db, casePain.naiveQuery);
      setNaiveResult(res);
      setHasRunNaive(true);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedClause = liveQuery.clauses[selectedClauseIndex] || liveQuery.clauses[0];

  return (
    <div className="space-y-6">
      {/* 1. Nỗi đau / Tình huống vụ án */}
      <div className="bg-noir-card border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-noir-borderDark">
          <FileText className="w-5 h-5 text-noir-blood" />
          <h3 className="text-sm font-typewriter font-bold uppercase tracking-wider text-noir-ink">
            {lang === 'VI' ? '1. Nỗi Đau Hiện Trường (Vụ Án Khởi Điểm)' : '1. Crime Scene Dilemma'}
          </h3>
        </div>

        <p className="font-serif text-sm leading-relaxed text-noir-ink font-medium">
          {lang === 'VI' ? casePain.storyVi : (casePain.storyEn || casePain.storyVi)}
        </p>

        {/* Naive Query Showcase */}
        <div className="bg-noir-paper border border-noir-borderDark/80 rounded-[3px] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-noir-inkMuted font-bold uppercase">
              {lang === 'VI' ? 'Câu lệnh truy vấn ngây thơ (chưa có bộ lọc):' : 'Unfiltered Naive Query:'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRunNaiveQuery}
              className="h-7 text-xs px-2.5 flex items-center gap-1 font-typewriter border-noir-borderDark text-noir-blood hover:bg-noir-card font-bold"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{hasRunNaive ? (lang === 'VI' ? 'Chạy lại' : 'Re-run') : (lang === 'VI' ? 'Chạy thử lệnh này' : 'Run this')}</span>
            </Button>
          </div>

          <pre className="font-mono text-xs text-noir-ink font-bold bg-white p-3 rounded border border-noir-border overflow-x-auto">
            {casePain.naiveQuery}
          </pre>

          {/* Naive Results Preview when clicked */}
          {hasRunNaive && naiveResult && (
            <div className="space-y-2 pt-1 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-mono text-noir-inkMuted">
                <span>{lang === 'VI' ? `Kết quả: ${naiveResult.rowCount} bản ghi` : `Result: ${naiveResult.rowCount} rows`}</span>
                <span className="text-amber-800 font-bold">{lang === 'VI' ? '⚠️ Quá nhiều kẻ vô can!' : '⚠️ Too noisy!'}</span>
              </div>
              <div className="max-h-40 overflow-auto border border-noir-border rounded bg-white">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-noir-paper border-b border-noir-border text-noir-ink font-bold">
                    <tr>
                      {naiveResult.columns.map((c, idx) => (
                        <th key={idx} className="p-2 border-r border-noir-border last:border-r-0">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {naiveResult.values.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-noir-border/50 hover:bg-amber-50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 border-r border-noir-border/30 last:border-r-0 text-noir-inkMuted">
                            {String(cell ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[11px] font-mono text-noir-inkMuted italic">
                {lang === 'VI'
                  ? `... và ${Math.max(0, naiveResult.rowCount - 5)} kẻ khác nữa.`
                  : `... and ${Math.max(0, naiveResult.rowCount - 5)} more rows.`}
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-950/10 border-l-4 border-amber-700 text-xs font-serif text-amber-950 leading-relaxed rounded-r-[3px]">
            {lang === 'VI' ? casePain.naiveResultNoteVi : (casePain.naiveResultNoteEn || casePain.naiveResultNoteVi)}
          </div>
        </div>
      </div>

      {/* 2. Ẩn dụ một câu */}
      <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-600/40 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5 text-amber-800" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-typewriter uppercase tracking-wider font-bold text-amber-900">
            {lang === 'VI' ? '💡 Ẩn Dụ Trinh Thám Cốt Lõi' : '💡 Detective Metaphor'}
          </div>
          <p className="font-serif text-sm font-bold text-noir-ink leading-relaxed italic">
            "{lang === 'VI' ? metaphor.metaphorVi : (metaphor.metaphorEn || metaphor.metaphorVi)}"
          </p>
        </div>
      </div>

      {/* 3. Query "Sống" (Interactive Clauses) */}
      <div className="bg-noir-card border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-noir-borderDark flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-noir-candleDark" />
            <h3 className="text-sm font-typewriter font-bold uppercase tracking-wider text-noir-ink">
              {lang === 'VI' ? '3. Giải Phẫu Câu Lệnh (Query "Sống")' : '3. Live Interactive Query Anatomy'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-noir-inkMuted">
            {lang === 'VI' ? 'Bấm vào từng mệnh đề để xem tác động' : 'Click clauses to inspect effect'}
          </span>
        </div>

        {/* Clause Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {liveQuery.clauses.map((clause, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedClauseIndex(idx)}
              className={cn(
                "px-3 py-2 rounded-[3px] text-xs font-mono font-bold transition-all border text-left",
                selectedClauseIndex === idx
                  ? "bg-noir-blood text-noir-parchment border-noir-bloodDark shadow-sm scale-[1.02]"
                  : "bg-noir-paper border-noir-borderDark text-noir-ink hover:bg-noir-card"
              )}
            >
              <div className="text-[10px] uppercase font-typewriter opacity-80">{clause.keyword}</div>
              <div className="text-xs truncate max-w-[280px]">{clause.code}</div>
            </button>
          ))}
        </div>

        {/* Selected Clause Insight Box */}
        <div className="p-3.5 bg-noir-paper border border-noir-borderDark rounded-[3px] space-y-2">
          <div className="flex items-center gap-2 text-xs font-typewriter font-bold text-noir-blood uppercase">
            <Info className="w-4 h-4" />
            <span>{lang === 'VI' ? `Mệnh đề: ${selectedClause.keyword}` : `Clause: ${selectedClause.keyword}`}</span>
          </div>
          <p className="font-serif text-xs text-noir-ink font-semibold leading-relaxed">
            {lang === 'VI' ? selectedClause.explanationVi : (selectedClause.explanationEn || selectedClause.explanationVi)}
          </p>
        </div>

        {/* Live Filtered Table Result */}
        {liveResult && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-typewriter text-noir-ink font-bold">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                {lang === 'VI' ? `Kết quả sau khi lọc: Đúng ${liveResult.rowCount} kẻ tình nghi trọng điểm` : `Filtered: ${liveResult.rowCount} targeted suspects`}
              </span>
            </div>

            <div className="max-h-56 overflow-auto border border-noir-borderDark rounded bg-white shadow-inner">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-noir-paper border-b border-noir-borderDark text-noir-ink font-bold">
                  <tr>
                    {liveResult.columns.map((c, idx) => (
                      <th
                        key={idx}
                        className={cn(
                          "p-2.5 border-r border-noir-border last:border-r-0 uppercase",
                          selectedClause.visualEffect === 'keep_columns' && "bg-amber-100 text-amber-900"
                        )}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveResult.values.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={cn(
                        "border-b border-noir-border/50 transition-colors",
                        selectedClause.visualEffect === 'filter_rows' ? "bg-emerald-50/70 hover:bg-emerald-100/70" : "hover:bg-amber-50"
                      )}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 border-r border-noir-border/30 last:border-r-0 font-bold text-noir-ink">
                          {String(cell ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Navigation to Tab 2 */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="gold"
          size="md"
          onClick={onProceedToInterrogation}
          className="flex items-center gap-2 font-typewriter font-bold shadow-noir-card text-xs uppercase"
        >
          <span>{lang === 'VI' ? 'Chuyển Sang Tab 2: Thẩm Vấn (Quiz)' : 'Proceed to Interrogation (Quiz)'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
