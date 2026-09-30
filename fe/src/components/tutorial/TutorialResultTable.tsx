import React from 'react';
import { Table, AlertCircle, Clock, Database } from 'lucide-react';
import type { QueryResult } from '@/types/tutorial.types';

interface TutorialResultTableProps {
  result: QueryResult | null;
  error: string | null;
  lang: 'VI' | 'EN';
}

export const TutorialResultTable: React.FC<TutorialResultTableProps> = ({
  result,
  error,
  lang,
}) => {
  if (error) {
    return (
      <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] overflow-hidden shadow-noir-card p-4">
        <div className="flex items-start gap-3 bg-red-950/20 border border-noir-blood text-noir-blood p-3.5 rounded-[3px]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-noir-blood" />
          <div className="space-y-1">
            <div className="font-typewriter text-xs font-bold uppercase tracking-wider">
              {lang === 'VI' ? 'LỖI CÚ PHÁP TRUY VẤN SQL' : 'SQL EXECUTION ERROR'}
            </div>
            <div className="font-mono text-xs text-noir-ink break-all whitespace-pre-wrap">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] overflow-hidden shadow-noir-card p-8 text-center">
        <Database className="w-10 h-10 text-noir-borderDark mx-auto mb-2 opacity-50" />
        <div className="font-typewriter text-xs text-noir-inkMuted uppercase tracking-wider">
          {lang === 'VI'
            ? 'Bấm "Chạy thử" (Ctrl+Enter) để thực thi câu lệnh trên database in-memory'
            : 'Click "Run Query" (Ctrl+Enter) to execute your query on the in-memory database'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] overflow-hidden shadow-noir-card flex flex-col">
      {/* Result Header */}
      <div className="bg-noir-card px-4 py-2 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-typewriter text-noir-ink font-bold">
          <Table className="w-4 h-4 text-noir-blood" />
          <span className="uppercase tracking-wider">
            {lang === 'VI' ? 'KẾT QUẢ TRUY VẤN' : 'QUERY RESULTS'}
          </span>
          <span className="bg-noir-parchment text-noir-blood px-2 py-0.5 rounded-[2px] text-[11px] font-bold border border-noir-border font-mono">
            {result.rowCount} {lang === 'VI' ? 'dòng' : 'records'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-noir-inkMuted">
          <Clock className="w-3.5 h-3.5 text-noir-candle" />
          <span>{result.executionTimeMs} ms</span>
        </div>
      </div>

      {/* Table Container */}
      {result.columns.length === 0 ? (
        <div className="p-6 text-center text-xs font-serif italic text-noir-inkMuted">
          {lang === 'VI'
            ? 'Lệnh đã chạy thành công (không có dữ liệu trả về).'
            : 'Query executed successfully with no output data.'}
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[280px]">
          <table className="w-full text-left border-collapse font-serif text-xs">
            <thead className="bg-noir-card sticky top-0 border-b border-noir-borderDark z-10">
              <tr>
                <th className="px-3 py-2 text-[11px] font-typewriter uppercase tracking-wider text-noir-inkMuted border-r border-noir-border w-12 text-center">
                  #
                </th>
                {result.columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-3 py-2 text-[11px] font-typewriter uppercase tracking-wider text-noir-ink border-r border-noir-border last:border-r-0 font-bold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-border">
              {result.values.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={
                    rIdx % 2 === 0
                      ? 'bg-noir-paper hover:bg-noir-card/50 transition-colors'
                      : 'bg-noir-parchment/60 hover:bg-noir-card/50 transition-colors'
                  }
                >
                  <td className="px-3 py-1.5 text-center font-mono text-noir-inkMuted border-r border-noir-border text-[11px]">
                    {rIdx + 1}
                  </td>
                  {row.map((val, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3 py-1.5 font-mono text-noir-ink border-r border-noir-border last:border-r-0 text-xs"
                    >
                      {val === null || val === undefined ? (
                        <span className="text-noir-inkFaint italic">NULL</span>
                      ) : typeof val === 'boolean' ? (
                        <span className="text-noir-blood font-bold">{val ? 'TRUE' : 'FALSE'}</span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
