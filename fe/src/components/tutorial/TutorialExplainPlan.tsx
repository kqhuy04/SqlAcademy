import React from 'react';
import { GitFork, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import type { ExplainPlanRow } from '@/types/tutorial.types';

interface TutorialExplainPlanProps {
  planRows: ExplainPlanRow[];
  lang: 'VI' | 'EN';
}

export const TutorialExplainPlan: React.FC<TutorialExplainPlanProps> = ({
  planRows,
  lang,
}) => {
  if (!planRows || planRows.length === 0) {
    return (
      <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 text-center shadow-noir-card">
        <GitFork className="w-8 h-8 text-noir-borderDark mx-auto mb-2 opacity-50" />
        <p className="font-typewriter text-xs text-noir-inkMuted uppercase">
          {lang === 'VI'
            ? 'Chạy truy vấn để phân tích Kế Hoạch Tác Chiến (EXPLAIN QUERY PLAN)'
            : 'Execute query to inspect EXPLAIN QUERY PLAN tactical details'}
        </p>
      </div>
    );
  }

  // Detect whether a SCAN TABLE (Full Table Scan) or SEARCH TABLE USING INDEX occurs
  const hasFullScan = planRows.some((r) => r.detail.includes('SCAN TABLE'));
  const hasIndexSearch = planRows.some((r) => r.detail.includes('USING INDEX'));

  return (
    <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] overflow-hidden shadow-noir-card flex flex-col">
      {/* Header */}
      <div className="bg-noir-card px-4 py-2 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-typewriter text-noir-ink font-bold">
          <Zap className="w-4 h-4 text-noir-candle" />
          <span className="uppercase tracking-wider">
            {lang === 'VI' ? 'KẾ HOẠCH THỰC THI (EXPLAIN)' : 'EXECUTION PLAN (EXPLAIN)'}
          </span>
        </div>

        <div>
          {hasFullScan ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-900/20 text-amber-800 border border-amber-600/40">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              {lang === 'VI' ? 'Quét toàn bảng (Chậm)' : 'Full Table Scan (Slow)'}
            </span>
          ) : hasIndexSearch ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/20 text-emerald-800 border border-emerald-600/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              {lang === 'VI' ? 'Dùng Index (Nhanh)' : 'Using Index (Fast)'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Plan Details */}
      <div className="p-4 space-y-2 font-mono text-xs">
        {planRows.map((row, idx) => {
          const isScan = row.detail.includes('SCAN TABLE');
          const isIndex = row.detail.includes('USING INDEX');

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-[3px] border flex items-start gap-2.5 ${
                isScan
                  ? 'bg-amber-500/10 border-amber-600/40 text-noir-ink'
                  : isIndex
                  ? 'bg-emerald-500/10 border-emerald-600/40 text-noir-ink'
                  : 'bg-noir-card/40 border-noir-border text-noir-ink'
              }`}
            >
              <div className="w-5 h-5 rounded flex items-center justify-center bg-noir-card border border-noir-borderDark text-[10px] text-noir-inkMuted font-bold flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="font-bold tracking-tight">
                  {row.detail}
                </div>
                <div className="text-[10px] text-noir-inkMuted mt-0.5">
                  ID: {row.id} • Parent: {row.parent}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
