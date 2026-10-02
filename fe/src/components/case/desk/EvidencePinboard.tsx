import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { CaseTableDTO } from '@/types/case.types';
import { useLanguageStore } from '@/store/languageStore';
import {
  Pin,
  Link2,
  Key,
  Users,
  FileText,
  Car,
  Fingerprint,
  Database,
  Search,
  Plus,
  List,
  LayoutGrid,
  X,
  Info,
  CornerDownRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface EvidencePinboardProps {
  tables?: CaseTableDTO[];
  isLoading?: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onInsertTableQuery: (tableName: string) => void;
  onInsertJoinSnippet: (
    fromTable: string,
    toTable: string,
    joinCol: string,
    targetCol?: string
  ) => void;
  onFocusEditorAndMonitor?: () => void;
  reducedMotion?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  variant?: 'full' | 'compact' | 'dialog-only';
  className?: string;
}

// Icon and styling theme for case tables
const getTableTheme = (tableName: string) => {
  const name = tableName.toLowerCase();
  if (name.includes('suspect') || name.includes('person') || name.includes('citizen') || name.includes('member')) {
    return {
      icon: Users,
      tag: 'PERSONNEL',
      accent: 'border-amber-700/60 bg-amber-50',
    };
  }
  if (name.includes('crime') || name.includes('scene') || name.includes('report') || name.includes('incident')) {
    return {
      icon: FileText,
      tag: 'CRIME SCENE',
      accent: 'border-red-700/60 bg-red-50',
    };
  }
  if (name.includes('vehicle') || name.includes('car') || name.includes('plate') || name.includes('license')) {
    return {
      icon: Car,
      tag: 'REGISTRY',
      accent: 'border-blue-700/60 bg-blue-50',
    };
  }
  if (name.includes('interview') || name.includes('transcript') || name.includes('statement') || name.includes('witness')) {
    return {
      icon: Fingerprint,
      tag: 'TESTIMONY',
      accent: 'border-emerald-700/60 bg-emerald-50',
    };
  }
  return {
    icon: Database,
    tag: 'DOSSIER',
    accent: 'border-noir-borderDark bg-noir-paperLight',
  };
};

export const EvidencePinboard: React.FC<EvidencePinboardProps> = ({
  tables = [],
  isLoading = false,
  isOpen,
  onOpen,
  onClose,
  onInsertTableQuery,
  onInsertJoinSnippet,
  onFocusEditorAndMonitor,
  reducedMotion = false,
  triggerRef,
  variant = 'full',
  className = '',
}) => {
  const { lang } = useLanguageStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [hoveredYarnIndex, setHoveredYarnIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Inferred foreign keys between tables
  const relationships = useMemo(() => {
    const list: Array<{
      id: string;
      fromTable: string;
      fromCol: string;
      toTable: string;
      toCol: string;
    }> = [];

    tables.forEach((sourceTable) => {
      sourceTable.columnDTOList.forEach((col) => {
        const colName = col.columnName.toLowerCase();
        if (colName.endsWith('_id') || colName.endsWith('id')) {
          const baseName = colName.replace(/_?id$/, '');
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
              id: `${sourceTable.tableName}.${col.columnName}->${matchedTarget.tableName}.${targetPk}`,
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

  // Positions of pins for SVG red yarn rendering
  const [pinCoordinates, setPinCoordinates] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const updatePinCoordinates = useCallback(() => {
    const container = containerRef.current;
    if (!container || viewMode !== 'board') return;
    const containerRect = container.getBoundingClientRect();
    const newCoords: Record<string, { x: number; y: number }> = {};

    tables.forEach((t) => {
      const cardEl = cardRefs.current[t.tableName];
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        newCoords[t.tableName] = {
          x: cardRect.left - containerRect.left + cardRect.width / 2 + container.scrollLeft,
          y: cardRect.top - containerRect.top + 16 + container.scrollTop,
        };
      }
    });

    setPinCoordinates(newCoords);
  }, [tables, viewMode]);

  useEffect(() => {
    if (!isOpen || viewMode !== 'board') return;
    const timer = setTimeout(updatePinCoordinates, 120);
    window.addEventListener('resize', updatePinCoordinates);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePinCoordinates);
    };
  }, [isOpen, viewMode, tables, updatePinCoordinates]);

  // Keyboard navigation & Esc handling
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        triggerRef?.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  // Filter tables matching search term
  const filteredTableNames = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    const matching = new Set<string>();

    tables.forEach((t) => {
      if (
        t.tableName.toLowerCase().includes(term) ||
        (t.descriptionVi && t.descriptionVi.toLowerCase().includes(term)) ||
        (t.descriptionEn && t.descriptionEn.toLowerCase().includes(term)) ||
        t.columnDTOList.some((c) => c.columnName.toLowerCase().includes(term))
      ) {
        matching.add(t.tableName);
      }
    });

    return matching;
  }, [tables, searchTerm]);

  // Handle card click (insert SELECT * query, close, focus monitor)
  const handleCardClick = (tableName: string) => {
    onInsertTableQuery(tableName);
    onClose();
    onFocusEditorAndMonitor?.();
    toast.success(
      lang === 'VI'
        ? `Đã chèn truy vấn bảng "${tableName}" vào màn hình`
        : `Inserted query for "${tableName}" into monitor`
    );
  };

  // Handle yarn click (insert JOIN snippet, close, focus monitor)
  const handleYarnClick = (
    fromTable: string,
    toTable: string,
    fromCol: string,
    toCol: string
  ) => {
    onInsertJoinSnippet(fromTable, toTable, fromCol, toCol);
    onClose();
    onFocusEditorAndMonitor?.();
    toast.success(
      lang === 'VI'
        ? `Đã chèn liên kết JOIN (${fromTable} ↔ ${toTable})`
        : `Inserted JOIN snippet (${fromTable} ↔ ${toTable})`
    );
  };

  return (
    <>
      {/* ================= PHYSICAL DESK PINBOARD TRIGGER ================= */}
      {variant !== 'dialog-only' && (
        <div className={`relative inline-flex flex-col select-none group ${variant === 'full' ? 'flex-1' : ''} ${className}`}>
          <button
            ref={triggerRef}
            type="button"
            onClick={onOpen}
            className={`relative rounded-[4px] border-2 transition-all cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassDark ${
              variant === 'full'
                ? 'w-full py-1.5 px-2 min-h-[38px] gap-1.5'
                : 'p-2 min-h-[40px] min-w-[40px]'
            } ${
              isOpen
                ? 'bg-noir-blood text-noir-parchment border-noir-borderDark shadow-inner'
                : 'bg-gradient-to-br from-[#BC8A5F] via-[#A8794F] to-[#8B5A2B] text-noir-ink border-[#6B421C] hover:border-noir-blood shadow-noir-card hover:-translate-y-0.5'
            }`}
            title={
              lang === 'VI'
                ? `Bảng ghim dây đỏ hiện trường (${relationships.length} liên kết - Phím 5)`
                : `Evidence Pinboard (${relationships.length} foreign key links - Key 5)`
            }
            aria-label={
              lang === 'VI'
                ? `Mở bảng ghim dây đỏ. Có ${relationships.length} mối liên kết.`
                : `Open evidence pinboard. Contains ${relationships.length} links.`
            }
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            {/* Cork Icon with Brass Pushpin */}
            <div className="relative flex items-center justify-center">
              <Pin className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-red-700'}`} aria-hidden="true" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 absolute -top-1 right-0 border border-amber-800" />
            </div>

            {variant === 'full' && (
              <span className="text-xs font-typewriter font-bold tracking-tight">
                {lang === 'VI' ? 'Dây Đỏ' : 'Board'}
              </span>
            )}

            {/* Relationship Count Badge */}
            {relationships.length > 0 && (
              <span
                className={`${
                  variant === 'full' ? 'ml-auto' : 'absolute -top-1.5 -right-1.5'
                } min-w-[18px] h-[18px] px-1 rounded-full bg-red-700 text-white font-mono text-xs font-bold flex items-center justify-center border border-noir-paperLight shadow-xs`}
                title={
                  lang === 'VI'
                    ? `${relationships.length} mối nối dây đỏ`
                    : `${relationships.length} yarn connections`
                }
              >
                {relationships.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ================= LARGE CORK-BOARD OVERLAY DIALOG ================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <button
            type="button"
            tabIndex={-1}
            aria-label={lang === 'VI' ? 'Đóng bảng ghim chứng cứ' : 'Close evidence pinboard'}
            className="fixed inset-0 bg-black/70 backdrop-blur-[3px] cursor-default w-full h-full border-0 p-0 m-0"
            onClick={() => {
              onClose();
              triggerRef?.current?.focus();
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pinboard-dialog-title"
            className={`relative z-10 w-full max-w-6xl h-[92vh] max-h-[920px] bg-noir-cork border-8 border-noir-corkDark rounded-[12px] shadow-noir-modal flex flex-col overflow-hidden transition-all duration-300 ${
              reducedMotion ? 'animate-none' : 'animate-[fadeIn_0.2s_ease-out]'
            }`}
            style={{
              backgroundColor: '#BC8A5F',
              backgroundImage:
                'radial-gradient(#8B5A2B 1px, transparent 1px), radial-gradient(#D4A373 1px, #BC8A5F 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          >
            {/* Wooden Pinboard Top Frame & Header */}
            <div className="bg-[#613D1C] text-[#FAF6EC] px-4 py-2.5 border-b-4 border-[#452A12] flex items-center justify-between gap-3 shadow-md shrink-0 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 border border-amber-950 shadow-md flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-100" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      id="pinboard-dialog-title"
                      className="font-serif font-black text-sm sm:text-base text-noir-parchment tracking-wide uppercase truncate"
                    >
                      {lang === 'VI'
                        ? 'Bảng Ghim Bằng Chứng • Mối Nối Dây Đỏ'
                        : 'Crime Scene Evidence Pinboard • Forensic Yarns'}
                    </h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700/60 font-bold shrink-0">
                      {relationships.length} {lang === 'VI' ? 'dây đỏ' : 'yarns'} • {tables.length} {lang === 'VI' ? 'bảng' : 'tables'}
                    </span>
                  </div>
                  <p className="text-xs text-[#D8C7B0] font-mono truncate hidden sm:block">
                    {lang === 'VI'
                      ? 'Nhấp thẻ để chèn SELECT • Nhấp dây đỏ để chèn mệnh đề JOIN'
                      : 'Click card to insert SELECT • Click yarn to insert JOIN'}
                  </p>
                </div>
              </div>

              {/* Top Controls: Search, View Mode Toggle, Close */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Search / Filter Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-noir-inkMuted pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={lang === 'VI' ? 'Lọc bảng hoặc cột...' : 'Filter dossiers...'}
                    className="pl-8 pr-3 py-1 text-xs bg-noir-paperLight border border-[#8B5A2B] rounded text-noir-ink placeholder:italic placeholder:text-noir-inkFaint focus:outline-none focus:ring-1 focus:ring-noir-blood w-36 sm:w-48 font-mono shadow-inner"
                    aria-label={lang === 'VI' ? 'Tìm kiếm chứng cứ' : 'Filter evidence tables'}
                  />
                </div>

                {/* View Mode Toggle (Pinboard vs Plain Accessible List) */}
                <div className="flex items-center bg-[#452A12] p-0.5 rounded border border-[#7A4F26]">
                  <button
                    type="button"
                    onClick={() => setViewMode('board')}
                    className={`px-2 py-1 rounded text-xs font-typewriter flex items-center gap-1 transition-colors min-h-[30px] cursor-pointer ${
                      viewMode === 'board'
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'text-[#D8C7B0] hover:text-white'
                    }`}
                    title={lang === 'VI' ? 'Chế độ bảng ghim trực quan' : 'Visual pinboard view'}
                    aria-pressed={viewMode === 'board'}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{lang === 'VI' ? 'Bảng Ghim' : 'Pinboard'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-2 py-1 rounded text-xs font-typewriter flex items-center gap-1 transition-colors min-h-[30px] cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'text-[#D8C7B0] hover:text-white'
                    }`}
                    title={lang === 'VI' ? 'Chế độ danh sách dễ tiếp cận' : 'Accessible list view'}
                    aria-pressed={viewMode === 'list'}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{lang === 'VI' ? 'Danh Sách' : 'List View'}</span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => {
                    onClose();
                    triggerRef?.current?.focus();
                  }}
                  className="p-1.5 rounded bg-[#452A12] hover:bg-white/10 text-[#FAF6EC] border border-[#7A4F26] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  title={lang === 'VI' ? 'Đóng bảng ghim (Esc)' : 'Close pinboard (Esc)'}
                  aria-label={lang === 'VI' ? 'Đóng bảng ghim' : 'Close pinboard'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corkboard Main Content Area */}
            <div
              ref={containerRef}
              className="flex-1 overflow-auto p-4 sm:p-6 relative select-none"
              onScroll={updatePinCoordinates}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-noir-ink p-8">
                  <Database className="w-10 h-10 animate-spin text-noir-inkMuted mb-3" />
                  <p className="font-serif italic text-sm">
                    {lang === 'VI'
                      ? 'Đang trải các hồ sơ trinh sát lên mặt bảng...'
                      : 'Pinning evidence dossiers to the corkboard...'}
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                /* ================= ACCESSIBLE LIST VIEW ALTERNATIVE ================= */
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="bg-noir-paperLight border-2 border-noir-borderDark rounded-[6px] p-4 shadow-noir-card">
                    <h3 className="font-typewriter text-xs font-bold uppercase tracking-wider text-noir-blood mb-3 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-red-700" />
                      <span>
                        {lang === 'VI'
                          ? 'DANH SÁCH MỐI NỐI KHÓA NGOẠI (FOREIGN KEY RELATIONSHIPS)'
                          : 'ACCESSIBLE FOREIGN KEY RELATIONSHIP DIRECTORY'}
                      </span>
                    </h3>

                    {relationships.length === 0 ? (
                      <p className="text-xs font-serif italic text-noir-inkMuted p-4 text-center">
                        {lang === 'VI'
                          ? 'Vụ án này không có liên kết khóa ngoại (Foreign Keys) giữa các bảng.'
                          : 'No foreign key links between tables in this case file.'}
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {relationships.map((rel, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-noir-borderDark rounded-[4px] flex items-center justify-between gap-3 hover:border-red-600 transition-colors shadow-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap font-mono text-xs font-bold text-noir-ink">
                                <span className="bg-noir-card px-2 py-0.5 rounded text-noir-ink">
                                  {rel.fromTable}.{rel.fromCol}
                                </span>
                                <span className="text-red-700 font-sans font-bold">➔</span>
                                <span className="bg-noir-card px-2 py-0.5 rounded text-noir-ink">
                                  {rel.toTable}.{rel.toCol}
                                </span>
                              </div>
                              <p className="text-xs text-noir-inkMuted font-serif italic mt-1">
                                {lang === 'VI'
                                  ? `Liên kết bảng ${rel.fromTable} với ${rel.toTable}`
                                  : `Relationship between ${rel.fromTable} and ${rel.toTable}`}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleYarnClick(
                                  rel.fromTable,
                                  rel.toTable,
                                  rel.fromCol,
                                  rel.toCol
                                )
                              }
                              className="px-3 py-1.5 rounded-[3px] bg-red-700 hover:bg-red-800 text-white font-typewriter text-xs font-bold uppercase transition-colors shrink-0 flex items-center gap-1.5 min-h-[36px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                              aria-label={
                                lang === 'VI'
                                  ? `Chèn JOIN giữa ${rel.fromTable} và ${rel.toTable}`
                                  : `Insert JOIN between ${rel.fromTable} and ${rel.toTable}`
                              }
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{lang === 'VI' ? 'Chèn JOIN' : 'Insert JOIN'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ================= VISUAL CORKBOARD WITH YARNS ================= */
                <div className="relative min-h-[640px] pb-12">
                  {/* Empty state when case has no foreign keys */}
                  {relationships.length === 0 && (
                    <div className="mb-6 p-4 max-w-lg mx-auto bg-noir-paperLight/95 border-2 border-dashed border-amber-800 rounded-[6px] shadow-noir-card text-center">
                      <Info className="w-6 h-6 text-amber-800 mx-auto mb-2" />
                      <p className="text-xs font-typewriter font-bold text-noir-ink uppercase">
                        {lang === 'VI'
                          ? 'Hiện trường này chưa ghi nhận liên kết khóa ngoại (Foreign Keys)'
                          : 'No foreign key relationships detected in this case'}
                      </p>
                      <p className="text-xs font-serif italic text-noir-inkMuted mt-1">
                        {lang === 'VI'
                          ? 'Bạn vẫn có thể nhấp trực tiếp vào bất kỳ thẻ hồ sơ nào bên dưới để nạp lệnh truy vấn.'
                          : 'You can still click any evidence card below to insert its query into the monitor.'}
                      </p>
                    </div>
                  )}

                  {/* SVG Red Yarns Layer */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                    style={{ minHeight: '640px' }}
                    aria-hidden="true"
                  >
                    <defs>
                      {/* Glow filter for highlighted yarn */}
                      <filter id="yarn-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#DC2626" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {relationships.map((rel, idx) => {
                      const fromCoord = pinCoordinates[rel.fromTable];
                      const toCoord = pinCoordinates[rel.toTable];
                      if (!fromCoord || !toCoord) return null;

                      const isYarnActive =
                        hoveredYarnIndex === idx ||
                        hoveredTable === rel.fromTable ||
                        hoveredTable === rel.toTable;

                      // Calculate curved hanging sag path
                      const dx = toCoord.x - fromCoord.x;
                      const dy = toCoord.y - fromCoord.y;
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const sag = 25 + Math.min(dist * 0.12, 60);

                      const midX = (fromCoord.x + toCoord.x) / 2;
                      const midY = (fromCoord.y + toCoord.y) / 2 + sag;

                      const pathD = `M ${fromCoord.x} ${fromCoord.y} Q ${midX} ${midY} ${toCoord.x} ${toCoord.y}`;

                      return (
                        <g key={rel.id}>
                          {/* Wider invisible stroke for easy click/hover detection */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={20}
                            className="cursor-pointer pointer-events-auto"
                            onMouseEnter={() => setHoveredYarnIndex(idx)}
                            onMouseLeave={() => setHoveredYarnIndex(null)}
                            onClick={() =>
                              handleYarnClick(
                                rel.fromTable,
                                rel.toTable,
                                rel.fromCol,
                                rel.toCol
                              )
                            }
                          />

                          {/* Shadow string underneath */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#3B1E08"
                            strokeWidth={isYarnActive ? 4 : 2.5}
                            strokeOpacity={0.4}
                            transform="translate(0, 3)"
                          />

                          {/* Red forensic yarn with draw-in animation */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isYarnActive ? '#EF4444' : '#B91C1C'}
                            strokeWidth={isYarnActive ? 4 : 2.5}
                            strokeDasharray={reducedMotion ? 'none' : isYarnActive ? 'none' : '4, 2'}
                            strokeLinecap="round"
                            filter={isYarnActive ? 'url(#yarn-glow)' : undefined}
                            className="cursor-pointer pointer-events-auto transition-all duration-150"
                            onMouseEnter={() => setHoveredYarnIndex(idx)}
                            onMouseLeave={() => setHoveredYarnIndex(null)}
                            onClick={() =>
                              handleYarnClick(
                                rel.fromTable,
                                rel.toTable,
                                rel.fromCol,
                                rel.toCol
                              )
                            }
                          />

                          {/* Brass pin heads at anchors */}
                          <circle
                            cx={fromCoord.x}
                            cy={fromCoord.y}
                            r={isYarnActive ? 5 : 4}
                            fill="#F59E0B"
                            stroke="#78350F"
                            strokeWidth={1.5}
                          />
                          <circle
                            cx={toCoord.x}
                            cy={toCoord.y}
                            r={isYarnActive ? 5 : 4}
                            fill="#F59E0B"
                            stroke="#78350F"
                            strokeWidth={1.5}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Responsive Grid of Polaroid Table Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-20">
                    {tables.map((table) => {
                      const theme = getTableTheme(table.tableName);
                      const Icon = theme.icon;
                      const isMatching = filteredTableNames
                        ? filteredTableNames.has(table.tableName)
                        : true;

                      const isConnectedToHovered =
                        hoveredTable !== null &&
                        relationships.some(
                          (r) =>
                            (r.fromTable === hoveredTable && r.toTable === table.tableName) ||
                            (r.toTable === hoveredTable && r.fromTable === table.tableName)
                        );

                      const isHighlighted =
                        hoveredTable === table.tableName || isConnectedToHovered;

                      const isDimmed =
                        (!isMatching && filteredTableNames !== null) ||
                        (hoveredTable !== null && !isHighlighted);

                      const pkCol =
                        table.columnDTOList.find((c) => c.isPrimaryKey) ||
                        table.columnDTOList.find((c) => c.columnName.toLowerCase() === 'id');

                      const sampleCols = table.columnDTOList
                        .filter((c) => c !== pkCol)
                        .slice(0, 3);

                      return (
                        <div
                          key={table.tableName}
                          ref={(el) => {
                            cardRefs.current[table.tableName] = el;
                          }}
                          onMouseEnter={() => setHoveredTable(table.tableName)}
                          onMouseLeave={() => setHoveredTable(null)}
                          onClick={() => handleCardClick(table.tableName)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCardClick(table.tableName);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={
                            lang === 'VI'
                              ? `Bảng chứng cứ ${table.tableName}. Bấm để nạp câu lệnh vào màn hình.`
                              : `Evidence table ${table.tableName}. Click to load query.`
                          }
                          className={`group relative bg-[#FAF6EC] border-2 rounded-[6px] p-3.5 pt-5 shadow-noir-card transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 ${
                            isDimmed ? 'opacity-35 scale-[0.98]' : 'opacity-100'
                          } ${
                            isHighlighted
                              ? 'ring-2 ring-red-700 border-red-700 shadow-noir-lift -translate-y-1'
                              : 'border-[#A38E75] hover:border-[#6B421C] hover:-translate-y-0.5'
                          }`}
                        >
                          {/* Realistic Brass Pushpin at top center */}
                          <div
                            className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none"
                            aria-hidden="true"
                          >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 border border-amber-950 shadow-md flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-100" />
                            </div>
                          </div>

                          {/* Polaroid Tape Accent */}
                          <div className="absolute top-1 left-2 w-8 h-2.5 bg-amber-200/50 -rotate-3 border border-amber-300/40 pointer-events-none" />

                          {/* Card Header */}
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E5D9BC]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-6 h-6 rounded bg-[#EFE5CE] border border-[#C4B6A0] flex items-center justify-center text-noir-ink shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-mono font-bold text-xs text-noir-ink truncate tracking-tight">
                                {table.tableName}
                              </span>
                            </div>
                            <span className="text-xs font-typewriter uppercase tracking-wider text-noir-inkMuted bg-[#EDE3C9] px-1.5 py-0.5 rounded border border-[#C4B6A0] shrink-0 font-bold">
                              {table.columnDTOList.length} col
                            </span>
                          </div>

                          {/* Table Description */}
                          <p className="text-xs text-noir-inkMuted font-serif italic py-1.5 truncate">
                            {lang === 'VI'
                              ? table.descriptionVi || 'Tài liệu trinh sát hiện trường'
                              : table.descriptionEn || 'Forensic evidence table'}
                          </p>

                          {/* Pinned Columns Preview */}
                          <div className="space-y-1 pt-1 border-t border-dashed border-[#E5D9BC] text-xs font-mono">
                            {/* Primary Key */}
                            {pkCol && (
                              <div className="flex items-center justify-between text-xs bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-300/50">
                                <span className="flex items-center gap-1 text-amber-900 font-bold truncate">
                                  <Key className="w-3 h-3 text-amber-700 shrink-0" />
                                  <span className="truncate">{pkCol.columnName}</span>
                                </span>
                                <span className="text-xs text-amber-800 opacity-80 uppercase shrink-0">
                                  PK
                                </span>
                              </div>
                            )}

                            {/* Sample Columns */}
                            {sampleCols.map((c) => {
                              const isFk = c.columnName.toLowerCase().endsWith('_id');
                              return (
                                <div
                                  key={c.columnName}
                                  className="flex items-center justify-between text-xs px-1 py-0.5 text-noir-ink"
                                >
                                  <span className="flex items-center gap-1 truncate text-noir-ink">
                                    {isFk ? (
                                      <Link2 className="w-3 h-3 text-red-600 shrink-0" />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-noir-inkMuted/40 shrink-0" />
                                    )}
                                    <span className="truncate">{c.columnName}</span>
                                  </span>
                                  <span className="text-xs text-noir-inkMuted font-mono shrink-0">
                                    {c.dataType}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Card Footer Call to Action */}
                          <div className="mt-2.5 pt-2 border-t border-[#E5D9BC] flex items-center justify-between text-xs font-typewriter text-noir-blood font-bold">
                            <span className="flex items-center gap-1">
                              <Plus className="w-3 h-3" />
                              <span>{lang === 'VI' ? 'Nạp Lệnh' : 'Query Table'}</span>
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-mono text-noir-inkMuted">
                              LIMIT 10
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Corkboard Docket */}
            <div className="bg-[#613D1C] px-4 py-2 border-t-4 border-[#452A12] flex items-center justify-between text-xs font-typewriter text-[#EDE3C9] shrink-0">
              <span className="flex items-center gap-1.5">
                <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === 'VI'
                    ? 'Nhấp vào bảng hoặc dây đỏ để tự động chèn vào màn hình máy tính'
                    : 'Click any table or red yarn to automatically insert into monitor'}
                </span>
              </span>
              <span className="font-bold text-amber-300">
                {lang === 'VI' ? 'HỒ SƠ HIỆN TRƯỜNG' : 'CRIME EVIDENCE'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
