import React, { useState } from 'react';
import type { CaseTableDTO } from '@/types/case.types';
import {
  Database,
  Table as TableIcon,
  Key,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TableSchemaViewerProps {
  tables?: CaseTableDTO[];
  isLoading?: boolean;
  lang: 'EN' | 'VI';
  onInsertTableQuery?: (tableName: string) => void;
  onInsertColumnName?: (columnName: string) => void;
}

export const TableSchemaViewer: React.FC<TableSchemaViewerProps> = ({
  tables = [],
  isLoading = false,
  lang,
  onInsertTableQuery,
  onInsertColumnName,
}) => {
  // All tables expanded by default
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      // If undefined, default was expanded (true), so toggle to false
      [tableName]: prev[tableName] === undefined ? false : !prev[tableName],
    }));
  };

  const isTableExpanded = (tableName: string) => {
    // Default to true if not explicitly set
    return expandedTables[tableName] !== false;
  };

  const toggleAll = (expand: boolean) => {
    const nextState: Record<string, boolean> = {};
    tables.forEach((t) => {
      nextState[t.tableName] = expand;
    });
    setExpandedTables(nextState);
  };

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(
      lang === 'VI' ? `Đã sao chép "${text}" (${label})` : `Copied "${text}" (${label})`
    );
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-5 space-y-4 shadow-noir-card animate-pulse">
        <div className="flex items-center justify-between pb-2 border-b-2 border-noir-borderDark">
          <div className="h-4 w-48 bg-noir-card rounded" />
          <div className="h-4 w-20 bg-noir-card rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-noir-card/60 rounded border border-noir-borderDark" />
          <div className="h-16 bg-noir-card/60 rounded border border-noir-borderDark" />
        </div>
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return null;
  }

  const allExpanded = tables.every((t) => isTableExpanded(t.tableName));

  return (
    <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-5 space-y-4 shadow-noir-card">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b-2 border-noir-borderDark flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-noir-blood" />
          <span className="text-xs font-typewriter font-bold uppercase tracking-wider text-noir-blood">
            {lang === 'VI' ? 'HỒ SƠ CƠ SỞ DỮ LIỆU CHỨNG CỨ' : 'EVIDENCE DATABASE SCHEMA'}
          </span>
          <span className="text-[10px] font-typewriter bg-noir-card px-2 py-0.5 rounded-[2px] border border-noir-borderDark text-noir-ink font-bold">
            {tables.length} {lang === 'VI' ? 'BẢNG' : tables.length === 1 ? 'TABLE' : 'TABLES'}
          </span>
        </div>

        <button
          onClick={() => toggleAll(!allExpanded)}
          className="text-[11px] font-typewriter text-noir-inkMuted hover:text-noir-blood transition-colors font-bold uppercase"
        >
          {allExpanded
            ? (lang === 'VI' ? 'Thu gọn tất cả' : 'Collapse All')
            : (lang === 'VI' ? 'Mở rộng tất cả' : 'Expand All')}
        </button>
      </div>

      {/* Tables List */}
      <div className="space-y-3">
        {tables.map((table) => {
          const expanded = isTableExpanded(table.tableName);
          const tableDesc =
            lang === 'VI'
              ? table.descriptionVi || table.descriptionEn
              : table.descriptionEn || table.descriptionVi;

          return (
            <div
              key={table.tableName}
              className="border-2 border-noir-borderDark rounded-[3px] bg-noir-card/40 overflow-hidden transition-colors"
            >
              {/* Table Header / Accordion trigger */}
              <div className="p-3 bg-noir-card/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-noir-borderDark/60">
                <button
                  onClick={() => toggleTable(table.tableName)}
                  className="flex items-start sm:items-center gap-2 text-left flex-1 group"
                >
                  <span className="mt-0.5 sm:mt-0 text-noir-blood group-hover:scale-110 transition-transform">
                    {expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                  <TableIcon className="w-4 h-4 text-noir-blood/90 shrink-0 mt-0.5 sm:mt-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-noir-ink group-hover:text-noir-blood transition-colors">
                        {table.tableName}
                      </span>
                      <span className="text-[10px] font-typewriter text-noir-inkMuted bg-noir-paper px-1.5 py-0.2 rounded border border-noir-borderDark/60">
                        {table.columnDTOList?.length || 0} {lang === 'VI' ? 'cột' : 'cols'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Quick actions for table */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() =>
                      handleCopy(
                        table.tableName,
                        `tbl-${table.tableName}`,
                        lang === 'VI' ? 'tên bảng' : 'table name'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-typewriter px-2 py-1 rounded-[2px] bg-noir-paper hover:bg-noir-paper/80 border border-noir-borderDark text-noir-ink hover:text-noir-blood transition-colors"
                    title={lang === 'VI' ? 'Sao chép tên bảng' : 'Copy table name'}
                  >
                    {copiedKey === `tbl-${table.tableName}` ? (
                      <Check className="w-3 h-3 text-noir-stamp" />
                    ) : (
                      <Copy className="w-3 h-3 text-noir-inkMuted" />
                    )}
                    <span className="font-mono text-[10.5px]">{lang === 'VI' ? 'Chép' : 'Copy'}</span>
                  </button>

                  {onInsertTableQuery && (
                    <button
                      onClick={() => onInsertTableQuery(table.tableName)}
                      className="flex items-center gap-1 text-[11px] font-typewriter px-2 py-1 rounded-[2px] bg-noir-candle/15 hover:bg-noir-candle/30 border border-noir-candleDark text-noir-ink font-bold transition-colors"
                      title={lang === 'VI' ? 'Soạn câu lệnh xem 10 dòng đầu' : 'Inspect top 10 rows'}
                    >
                      <Code2 className="w-3 h-3 text-noir-candleDark" />
                      <span className="text-[10px] uppercase">
                        {lang === 'VI' ? 'Khám phá' : 'Inspect'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table Description Note */}
              {tableDesc && (
                <div className="px-3.5 py-2 bg-[#FAF6EC]/90 text-xs font-serif text-noir-ink leading-relaxed border-b border-noir-borderDark/40 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-noir-candleDark shrink-0 mt-0.5" />
                  <span className="italic">{tableDesc}</span>
                </div>
              )}

              {/* Columns Table (Expanded View) */}
              {expanded && (
                <div className="p-3 bg-noir-paper/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-noir-borderDark/70 text-[10px] font-typewriter uppercase tracking-wider text-noir-inkMuted">
                          <th className="py-1.5 px-2">
                            {lang === 'VI' ? 'Tên cột' : 'Column'}
                          </th>
                          <th className="py-1.5 px-2">
                            {lang === 'VI' ? 'Kiểu' : 'Type'}
                          </th>
                          <th className="py-1.5 px-2">
                            {lang === 'VI' ? 'Mô tả chi tiết' : 'Description'}
                          </th>
                          <th className="py-1.5 px-2">
                            {lang === 'VI' ? 'Dữ liệu mẫu' : 'Sample'}
                          </th>
                          <th className="py-1.5 px-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-noir-borderDark/40 text-xs">
                        {table.columnDTOList?.map((col) => {
                          const colDesc =
                            lang === 'VI'
                              ? col.descriptionVi || col.descriptionEn
                              : col.descriptionEn || col.descriptionVi;

                          return (
                            <tr
                              key={col.columnName}
                              className="hover:bg-noir-card/60 transition-colors group"
                            >
                              {/* Column Name + PK badge */}
                              <td className="py-2 px-2 align-top whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-noir-ink text-[12.5px]">
                                    {col.columnName}
                                  </span>
                                  {col.isPrimaryKey && (
                                    <span
                                      className="inline-flex items-center gap-0.5 bg-noir-candle/20 border border-noir-candleDark text-noir-candleDark px-1 py-0.2 rounded text-[9px] font-typewriter font-black tracking-tighter"
                                      title="Primary Key (Khóa chính)"
                                    >
                                      <Key className="w-2.5 h-2.5" /> PK
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Data Type */}
                              <td className="py-2 px-2 align-top whitespace-nowrap">
                                <span className="font-mono text-[11px] text-noir-blood font-semibold bg-noir-blood/5 px-1.5 py-0.5 rounded border border-noir-blood/20">
                                  {col.dataType}
                                </span>
                              </td>

                              {/* Description */}
                              <td className="py-2 px-2 align-top text-noir-ink font-serif text-[12px] leading-snug">
                                {colDesc ? (
                                  <span>{colDesc}</span>
                                ) : (
                                  <span className="text-noir-inkMuted italic text-[11px]">
                                    -
                                  </span>
                                )}
                              </td>

                              {/* Sample Values */}
                              <td className="py-2 px-2 align-top font-mono text-[11px] text-noir-inkMuted max-w-[200px] break-words">
                                {col.sampleValues ? (
                                  <span
                                    className="bg-noir-paper px-1.5 py-0.5 rounded border border-noir-borderDark/60 text-noir-ink/80 inline-block"
                                    title={col.sampleValues}
                                  >
                                    {col.sampleValues}
                                  </span>
                                ) : (
                                  <span className="text-noir-inkMuted italic text-[11px]">
                                    -
                                  </span>
                                )}
                              </td>

                              {/* Quick Insert / Copy Actions */}
                              <td className="py-2 px-2 align-top text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                                  <button
                                    onClick={() =>
                                      handleCopy(
                                        col.columnName,
                                        `col-${table.tableName}-${col.columnName}`,
                                        'column name'
                                      )
                                    }
                                    className="p-1 rounded hover:bg-noir-card border border-transparent hover:border-noir-borderDark text-noir-inkMuted hover:text-noir-ink transition-colors"
                                    title={lang === 'VI' ? 'Sao chép tên cột' : 'Copy column name'}
                                  >
                                    {copiedKey === `col-${table.tableName}-${col.columnName}` ? (
                                      <Check className="w-3 h-3 text-noir-stamp" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>

                                  {onInsertColumnName && (
                                    <button
                                      onClick={() => onInsertColumnName(col.columnName)}
                                      className="p-1 rounded hover:bg-noir-card border border-transparent hover:border-noir-borderDark text-noir-inkMuted hover:text-noir-blood transition-colors text-[10px] font-mono"
                                      title={lang === 'VI' ? 'Chèn vào câu lệnh' : 'Insert into query'}
                                    >
                                      {lang === 'VI' ? '+Chèn' : '+Insert'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
