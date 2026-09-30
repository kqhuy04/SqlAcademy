import React, { useState, useMemo, useRef } from 'react';
import type { CaseTableDTO } from '@/types/case.types';
import {
  Key,
  Link2,
  Users,
  FileText,
  Fingerprint,
  Car,
  Search,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EvidenceBoardProps {
  tables?: CaseTableDTO[];
  isLoading?: boolean;
  lang: 'EN' | 'VI';
  onInsertTableQuery?: (tableName: string) => void;
  onInsertColumnName?: (columnName: string) => void;
  onInsertJoinSnippet?: (fromTable: string, toTable: string, joinCol: string) => void;
}

// Icon mapper for crime domain tables
const getTableVisualTheme = (tableName: string) => {
  const name = tableName.toLowerCase();
  if (name.includes('suspect') || name.includes('person') || name.includes('citizen') || name.includes('member')) {
    return {
      icon: Users,
      badgeColor: 'bg-amber-900/10 text-amber-900 border-amber-900/30',
      tag: 'PERSONNEL',
      stamp: 'CLASSIFIED',
    };
  }
  if (name.includes('crime') || name.includes('scene') || name.includes('report') || name.includes('incident')) {
    return {
      icon: FileText,
      badgeColor: 'bg-red-900/10 text-red-900 border-red-900/30',
      tag: 'CRIME REPORT',
      stamp: 'CONFIDENTIAL',
    };
  }
  if (name.includes('vehicle') || name.includes('car') || name.includes('plate') || name.includes('license')) {
    return {
      icon: Car,
      badgeColor: 'bg-blue-900/10 text-blue-900 border-blue-900/30',
      tag: 'REGISTRY',
      stamp: 'VERIFIED',
    };
  }
  if (name.includes('interview') || name.includes('transcript') || name.includes('statement') || name.includes('witness')) {
    return {
      icon: Fingerprint,
      badgeColor: 'bg-emerald-900/10 text-emerald-900 border-emerald-900/30',
      tag: 'TESTIMONY',
      stamp: 'EVIDENCE',
    };
  }
  return {
    icon: Database,
    badgeColor: 'bg-noir-ink/10 text-noir-ink border-noir-ink/20',
    tag: 'DOSSIER',
    stamp: 'ARCHIVE',
  };
};

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  tables = [],
  isLoading = false,
  lang,
  onInsertTableQuery,
  onInsertColumnName,
  onInsertJoinSnippet,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [previewSample, setPreviewSample] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Parse inferred relationships (Foreign Keys & Primary Keys) between tables
  const relationships = useMemo(() => {
    const list: Array<{
      fromTable: string;
      fromCol: string;
      toTable: string;
      toCol: string;
    }> = [];

    tables.forEach((sourceTable) => {
      sourceTable.columnDTOList.forEach((col) => {
        const colName = col.columnName.toLowerCase();
        // Check if column looks like a foreign key (e.g., person_id, license_id, suspect_id)
        if (colName.endsWith('_id') || colName.endsWith('id')) {
          const baseName = colName.replace(/_?id$/, '');
          // Find matching table
          const matchedTarget = tables.find((t) => {
            const targetLower = t.tableName.toLowerCase();
            return (
              targetLower !== sourceTable.tableName.toLowerCase() &&
              (targetLower === baseName ||
                targetLower.includes(baseName) ||
                (baseName === 'person' && targetLower.includes('suspect')) ||
                (baseName === 'license' && targetLower.includes('driver')))
            );
          });

          if (matchedTarget) {
            const targetPk =
              matchedTarget.columnDTOList.find((c) => c.isPrimaryKey)?.columnName || 'id';
            list.push({
              fromTable: sourceTable.tableName,
              fromCol: col.columnName,
              toTable: matchedTarget.tableName,
              toCol: targetPk,
            });
          }
        }
      });
    });

    return list;
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (!searchTerm.trim()) return tables;
    const term = searchTerm.toLowerCase();
    return tables.filter(
      (t) =>
        t.tableName.toLowerCase().includes(term) ||
        (t.descriptionVi && t.descriptionVi.toLowerCase().includes(term)) ||
        (t.descriptionEn && t.descriptionEn.toLowerCase().includes(term)) ||
        t.columnDTOList.some((c) => c.columnName.toLowerCase().includes(term))
    );
  }, [tables, searchTerm]);

  const toggleExpand = (tableName: string) => {
    setExpandedCards((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const toggleSample = (tableName: string) => {
    setPreviewSample((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(lang === 'VI' ? `Đã sao chép "${text}"` : `Copied "${text}" (${label})`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#EDE3C9] rounded-lg border border-[#C4B6A0]">
        <Database className="w-8 h-8 text-[#8C7E6D] animate-spin mb-2" />
        <span className="font-serif italic text-noir-inkMuted text-sm">
          {lang === 'VI' ? 'Đang giải mã hồ sơ hiện trường...' : 'Deciphering crime scene dossiers...'}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-4 p-4 rounded-xl border-2 border-[#A8987E] bg-[#E8DCBF] shadow-inner overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(#C4B6A0 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Corkboard Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#C4B6A0]/80">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-700 shadow-sm border border-amber-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
          </div>
          <h3 className="font-serif font-bold text-base text-noir-ink tracking-wide uppercase flex items-center gap-2">
            <span>{lang === 'VI' ? 'Bảng Bằng Chứng Vụ Án' : 'Crime Scene Evidence Pinboard'}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-noir-blood text-white font-typewriter lowercase font-normal tracking-normal">
              {tables.length} {lang === 'VI' ? 'tài liệu' : 'dossiers'}
            </span>
          </h3>
        </div>

        {/* Search and Quick Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-noir-inkMuted pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'VI' ? 'Tìm bảng, cột chứng cứ...' : 'Filter dossiers or columns...'}
              className="pl-8 pr-3 py-1 text-xs bg-[#F5ECD7] border border-[#C4B6A0] rounded text-noir-ink placeholder:italic placeholder:text-noir-inkFaint focus:outline-none focus:border-noir-wax w-48 font-mono shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Relationships Legend / Red String Indicator */}
      {relationships.length > 0 && (
        <div className="bg-[#DFD3B5]/90 border border-[#C4B6A0] rounded-lg p-2.5 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-typewriter text-noir-blood font-semibold">
            <Link2 className="w-4 h-4 text-red-700" />
            <span>{lang === 'VI' ? 'Mối Nối Dây Đỏ (Foreign Key Links):' : 'Forensic Links (Foreign Keys):'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {relationships.map((rel, idx) => {
              const isMatch =
                hoveredTable === rel.fromTable ||
                hoveredTable === rel.toTable;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (onInsertJoinSnippet) {
                      onInsertJoinSnippet(rel.fromTable, rel.toTable, rel.fromCol);
                    } else if (onInsertTableQuery) {
                      onInsertTableQuery(
                        `SELECT * FROM ${rel.fromTable} JOIN ${rel.toTable} ON ${rel.fromTable}.${rel.fromCol} = ${rel.toTable}.${rel.toCol} LIMIT 10;`
                      );
                    }
                  }}
                  onMouseEnter={() => setHoveredTable(rel.fromTable)}
                  onMouseLeave={() => setHoveredTable(null)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-all border ${
                    isMatch
                      ? 'bg-red-800 text-white border-red-900 shadow-sm scale-105'
                      : 'bg-[#EDE3C9] text-noir-ink border-[#C4B6A0] hover:border-red-600'
                  }`}
                  title={
                    lang === 'VI'
                      ? 'Nhấp để chèn mẫu câu lệnh JOIN này vào Editor'
                      : 'Click to insert JOIN snippet into SQL editor'
                  }
                >
                  <span className="font-bold">{rel.fromTable}</span>
                  <span className="text-red-600 font-sans font-bold">➔</span>
                  <span className="font-bold">{rel.toTable}</span>
                  <span className="text-[9px] opacity-75">({rel.fromCol})</span>
                  <Plus className="w-3 h-3 opacity-60 ml-0.5" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Evidence Cards (Pinned Manila Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTables.map((table) => {
          const theme = getTableVisualTheme(table.tableName);
          const Icon = theme.icon;
          const isExpanded = expandedCards[table.tableName] ?? true;
          const isSampleShown = previewSample[table.tableName] ?? false;
          const isHighlighted =
            hoveredTable === table.tableName ||
            relationships.some(
              (r) =>
                (hoveredTable === r.fromTable && r.toTable === table.tableName) ||
                (hoveredTable === r.toTable && r.fromTable === table.tableName)
            );

          return (
            <div
              key={table.tableName}
              onMouseEnter={() => setHoveredTable(table.tableName)}
              onMouseLeave={() => setHoveredTable(null)}
              className={`relative bg-[#F5ECD7] rounded-lg border transition-all duration-200 shadow-md ${
                isHighlighted
                  ? 'ring-2 ring-red-700 border-red-700 shadow-xl -translate-y-0.5'
                  : 'border-[#C4B6A0] hover:border-[#9A8870]'
              }`}
            >
              {/* Brass Pushpin at top center */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 border border-amber-950 shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-100" />
                </div>
              </div>

              {/* Card Header (Manila Tab Style) */}
              <div className="p-3 pt-3.5 border-b border-[#E2D5B8] flex items-center justify-between gap-2 bg-[#EFE5CE] rounded-t-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded bg-[#E5D9BC] border border-[#C4B6A0] text-noir-ink shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-noir-ink truncate tracking-tight">
                        {table.tableName}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-typewriter border ${theme.badgeColor}`}>
                        {theme.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-noir-inkMuted truncate font-serif italic">
                      {lang === 'VI'
                        ? table.descriptionVi || 'Bảng dữ liệu trinh sát'
                        : table.descriptionEn || 'Forensic dataset'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      if (onInsertTableQuery) {
                        onInsertTableQuery(`SELECT * FROM ${table.tableName} LIMIT 10;`);
                      }
                    }}
                    className="p-1 rounded text-noir-inkMuted hover:text-noir-blood hover:bg-[#E5D9BC] transition-colors"
                    title={lang === 'VI' ? 'Chèn SELECT * vào Editor' : 'Insert SELECT * into Editor'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(table.tableName, 'Table')}
                    className="p-1 rounded text-noir-inkMuted hover:text-noir-ink hover:bg-[#E5D9BC] transition-colors"
                    title={lang === 'VI' ? 'Sao chép tên bảng' : 'Copy table name'}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleExpand(table.tableName)}
                    className="p-1 rounded text-noir-inkMuted hover:text-noir-ink hover:bg-[#E5D9BC] transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Body: Columns & Schema */}
              {isExpanded && (
                <div className="p-3 flex flex-col gap-2 text-xs">
                  {/* Column List */}
                  <div className="divide-y divide-[#EADEC6]">
                    {table.columnDTOList.map((col) => {
                      const isPk = col.isPrimaryKey || col.columnName.toLowerCase() === 'id';
                      const isFk = col.columnName.toLowerCase().endsWith('_id');

                      return (
                        <div
                          key={col.columnName}
                          className="py-1.5 flex items-center justify-between gap-2 hover:bg-[#EDE3C9]/60 px-1 rounded transition-colors group"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isPk ? (
                              <span title="Primary Key">
                                <Key className="w-3 h-3 text-amber-600 shrink-0" />
                              </span>
                            ) : isFk ? (
                              <span title="Foreign Key">
                                <Link2 className="w-3 h-3 text-red-600 shrink-0" />
                              </span>
                            ) : (
                              <span className="w-3 h-3 flex items-center justify-center text-[10px] text-noir-inkFaint">
                                •
                              </span>
                            )}
                            <button
                              onClick={() => {
                                if (onInsertColumnName) {
                                  onInsertColumnName(col.columnName);
                                } else {
                                  handleCopy(col.columnName, 'Column');
                                }
                              }}
                              className="font-mono text-noir-ink hover:text-noir-blood text-left truncate font-medium group-hover:underline"
                            >
                              {col.columnName}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono text-noir-inkMuted">
                            <span className="px-1 py-0.5 rounded bg-[#E8DCC2] border border-[#D5C7AF]">
                              {col.dataType}
                            </span>
                            {col.sampleValues && (
                              <span
                                className="hidden sm:inline text-[9px] text-noir-inkFaint italic max-w-[120px] truncate"
                                title={`Ví dụ: ${col.sampleValues}`}
                              >
                                {col.sampleValues}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sample Data Drawer Toggle */}
                  {table.sampleData && (
                    <div className="mt-1 pt-2 border-t border-[#E2D5B8]">
                      <button
                        onClick={() => toggleSample(table.tableName)}
                        className="flex items-center gap-1 text-[11px] font-typewriter text-noir-blood hover:text-noir-bloodDark font-semibold"
                      >
                        {isSampleShown ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        <span>
                          {isSampleShown
                            ? lang === 'VI'
                              ? 'Thu gọn mẫu chứng cứ'
                              : 'Hide forensic sample'
                            : lang === 'VI'
                            ? 'Trích lục 3 dòng mẫu'
                            : 'Inspect sample rows'}
                        </span>
                      </button>

                      {isSampleShown && (
                        <div className="mt-2 p-2 bg-[#1A1612] text-amber-100 rounded font-mono text-[10px] overflow-x-auto border border-noir-borderDark shadow-inner">
                          <pre className="whitespace-pre">{table.sampleData}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
