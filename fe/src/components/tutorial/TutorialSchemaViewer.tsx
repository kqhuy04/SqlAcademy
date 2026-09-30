import React from 'react';
import { Database, Key, Columns } from 'lucide-react';
import type { TableMetadata } from '@/types/tutorial.types';

interface TutorialSchemaViewerProps {
  tables: TableMetadata[];
  lang: 'VI' | 'EN';
  onInsertTableQuery?: (tableName: string) => void;
}

export const TutorialSchemaViewer: React.FC<TutorialSchemaViewerProps> = ({
  tables,
  lang,
  onInsertTableQuery,
}) => {
  return (
    <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] overflow-hidden shadow-noir-card flex flex-col">
      {/* Header */}
      <div className="bg-noir-card px-4 py-2 border-b-2 border-noir-borderDark flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-typewriter text-noir-ink font-bold">
          <Database className="w-4 h-4 text-noir-blood" />
          <span className="uppercase tracking-wider">
            {lang === 'VI' ? 'CẤU TRÚC CÁC BẢNG' : 'DATABASE TABLES'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-noir-inkMuted">
          {tables.length} {tables.length === 1 ? 'table' : 'tables'}
        </span>
      </div>

      {/* Tables list */}
      <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
        {tables.map((table) => (
          <div
            key={table.name}
            className="border border-noir-borderDark rounded-[3px] bg-noir-card/30 overflow-hidden"
          >
            {/* Table Name */}
            <div className="bg-noir-card px-3 py-1.5 border-b border-noir-border flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-noir-ink">
                <Columns className="w-3.5 h-3.5 text-noir-candle" />
                <span>{table.name}</span>
              </div>
              {onInsertTableQuery && (
                <button
                  type="button"
                  onClick={() => onInsertTableQuery(table.name)}
                  className="text-[10px] font-typewriter uppercase text-noir-blood hover:text-noir-bloodDark font-bold tracking-wider underline cursor-pointer"
                >
                  {lang === 'VI' ? 'Xem bảng' : 'Inspect'}
                </button>
              )}
            </div>

            {/* Columns list */}
            <div className="p-2 divide-y divide-noir-border/50">
              {table.columns.map((col) => (
                <div
                  key={col.name}
                  className="py-1 px-1 flex items-center justify-between text-xs font-mono gap-2"
                >
                  <div className="flex items-center gap-1.5">
                    {col.isPk ? (
                      <Key className="w-3 h-3 text-amber-700 flex-shrink-0" />
                    ) : (
                      <span className="w-3 h-3 inline-block" />
                    )}
                    <span className={`font-semibold ${col.isPk ? 'text-noir-blood' : 'text-noir-ink'}`}>
                      {col.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-noir-inkFaint bg-noir-paper px-1.5 py-0.5 rounded border border-noir-border">
                      {col.type}
                    </span>
                    {(col.noteVi || col.noteEn) && (
                      <span className="text-[10px] font-serif italic text-noir-inkMuted hidden md:inline">
                        {lang === 'VI' ? col.noteVi : col.noteEn}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
