import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderArchive,
  Play,
  Plus,
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Code2,
  Database,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import type { QueryHistoryItem } from '@/components/common/QueryHistoryPanel';

export interface QueryCardBoxProps {
  history: QueryHistoryItem[];
  onSelectQuery?: (query: string) => void;
  onAppendQuery?: (query: string) => void;
  onClearHistory?: () => void;
  lang?: 'VI' | 'EN';
  isOpen: boolean;
  onToggleOpen: (open?: boolean) => void;
  reducedMotion?: boolean;
  className?: string;
}

export const QueryCardBox: React.FC<QueryCardBoxProps> = ({
  history,
  onSelectQuery,
  onAppendQuery,
  onClearHistory,
  lang = 'VI',
  isOpen,
  onToggleOpen,
  reducedMotion = false,
  className = '',
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<QueryHistoryItem | null>(null);
  const [filterText, setFilterText] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  // Maximum 30 entries
  const limitedHistory = useMemo(() => history.slice(0, 30), [history]);

  const handleCopyQuery = (query: string, id: string) => {
    navigator.clipboard.writeText(query);
    setCopiedId(id);
    toast.success(lang === 'VI' ? 'Đã sao chép câu lệnh SQL' : 'SQL query copied');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleReplace = (query: string) => {
    if (onSelectQuery) {
      onSelectQuery(query);
      toast.success(
        lang === 'VI' ? 'Đã nạp câu lệnh vào trình soạn thảo' : 'Loaded query into editor'
      );
    }
  };

  const handleAppend = (query: string) => {
    if (onAppendQuery) {
      onAppendQuery(query);
      toast.success(
        lang === 'VI' ? 'Đã nối câu lệnh vào trình soạn thảo' : 'Appended query to editor'
      );
    } else if (onSelectQuery) {
      onSelectQuery(query);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!filterText.trim()) return limitedHistory;
    const lower = filterText.toLowerCase();
    return limitedHistory.filter((item) => item.query.toLowerCase().includes(lower));
  }, [limitedHistory, filterText]);

  return (
    <div
      className={`border-2 border-[#2D1B0F] rounded-[4px] shadow-noir-md overflow-hidden bg-[#3D2516] flex flex-col ${className}`}
    >
      {/* ================= Wooden Drawer Front (Trigger Button) ================= */}
      <button
        type="button"
        onClick={() => onToggleOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={
          lang === 'VI'
            ? `Hộp thẻ mục lục lịch sử truy vấn (${history.length} thẻ). Nhấn để ${isOpen ? 'đóng' : 'mở'} ngăn kéo.`
            : `Query index card catalog drawer (${history.length} cards). Click to ${isOpen ? 'close' : 'open'}.`
        }
        className="w-full min-h-[44px] px-3 py-2 bg-gradient-to-r from-[#4A2F1D] via-[#5C3A24] to-[#4A2F1D] border-b-2 border-[#2D1B0F] flex items-center justify-between text-left cursor-pointer transition-colors hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassLight"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-[2px] bg-[#2A180E] border border-noir-brass/40 shadow-xs flex items-center justify-center">
            <FolderArchive className="w-4 h-4 text-noir-brassLight" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-noir-parchment drop-shadow-xs">
                {lang === 'VI' ? 'HỘP THẺ MỤC LỤC TRUY VẤN' : 'QUERY CARD CATALOG'}
              </span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-noir-blood text-noir-parchment border border-noir-bloodDark shadow-xs">
                {history.length}
              </span>
            </div>
            <p className="text-xs font-serif italic text-noir-parchment/70 leading-none mt-0.5">
              {lang === 'VI' ? 'Ngăn kéo thẻ lưu trữ lịch sử SQL' : 'Index cards of executed queries'}
            </p>
          </div>
        </div>

        {/* Vintage Brass Cup Pull Handle & Chevron */}
        <div className="flex items-center gap-2">
          <div
            className="hidden sm:flex flex-col items-center justify-center w-14 h-4 rounded-b-[4px] bg-gradient-to-b from-[#DFAB3A] to-[#8C6524] border border-[#5C4416] shadow-xs"
            aria-hidden="true"
          >
            <div className="w-8 h-0.5 bg-[#4A320C]/40 rounded-full" />
          </div>
          <span className="p-1 text-noir-brassLight">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* ================= Drawer Interior (Slides Open with Fanned Cards) ================= */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-2 sm:p-2.5 bg-gradient-to-b from-[#2A180E] to-[#1F1109] border-t border-[#1F1109] flex flex-col gap-2">
              {/* Drawer Utility Bar (Search & Clear) */}
              <div className="bg-[#3D2516] p-1.5 rounded-[3px] border border-noir-borderDark/60 flex items-center justify-between gap-2 flex-wrap">
                {/* Search / Filter Input */}
                <div className="flex-1 min-w-[140px] flex items-center gap-1.5 bg-[#1F1109] px-2 py-1 rounded-[2px] border border-[#5C3A24]">
                  <Search className="w-3.5 h-3.5 text-noir-brassLight shrink-0" aria-hidden="true" />
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder={lang === 'VI' ? 'Tìm thẻ lệnh SQL...' : 'Filter cards...'}
                    aria-label={lang === 'VI' ? 'Tìm kiếm trong thẻ mục lục' : 'Filter index cards'}
                    className="w-full bg-transparent border-0 text-xs font-mono text-noir-parchment placeholder-noir-parchment/40 focus:outline-none focus:ring-0 p-0"
                  />
                  {filterText && (
                    <button
                      type="button"
                      onClick={() => setFilterText('')}
                      aria-label={lang === 'VI' ? 'Xóa từ khóa tìm kiếm' : 'Clear filter'}
                      className="p-1 text-noir-parchment/60 hover:text-noir-parchment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Clear Log Action */}
                {history.length > 0 && onClearHistory && (
                  <div>
                    {confirmClear ? (
                      <div className="flex items-center gap-1 bg-[#2A180E] px-2 py-0.5 rounded border border-noir-blood">
                        <span className="text-xs font-typewriter font-bold text-noir-blood">
                          {lang === 'VI' ? 'Xóa thẻ?' : 'Clear?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClearHistory();
                            setConfirmClear(false);
                            toast.success(lang === 'VI' ? 'Đã dọn sạch ngăn kéo' : 'Drawer emptied');
                          }}
                          className="min-h-[30px] px-2 py-0.5 rounded text-xs font-typewriter font-bold bg-noir-blood text-noir-parchment hover:bg-noir-bloodDark transition-colors"
                        >
                          {lang === 'VI' ? 'Có' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClear(false)}
                          className="min-h-[30px] px-2 py-0.5 rounded text-xs font-typewriter font-bold bg-[#3D2516] text-noir-parchment border border-noir-borderDark hover:bg-[#4A2F1D] transition-colors"
                        >
                          {lang === 'VI' ? 'Không' : 'No'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmClear(true)}
                        className="min-h-[36px] px-2.5 py-1 rounded-[2px] bg-[#2A180E] hover:bg-noir-blood/20 text-noir-parchment/80 hover:text-noir-blood border border-[#5C3A24] text-xs font-typewriter font-bold flex items-center gap-1.5 transition-colors"
                        title={lang === 'VI' ? 'Dọn sạch ngăn kéo' : 'Clear drawer'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {lang === 'VI' ? 'Dọn ngăn kéo' : 'Empty Drawer'}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Fanned-out / Stacked Index Cards Area */}
              <div className="max-h-[360px] overflow-y-auto pr-1 space-y-2.5">
                {filteredHistory.length === 0 ? (
                  /* Empty Drawer State */
                  <div className="py-8 px-4 text-center bg-[#FAF6EC] border-2 border-dashed border-[#5C3A24] rounded-[4px] shadow-inner text-noir-ink">
                    <FolderArchive className="w-10 h-10 mx-auto mb-2 text-noir-borderDark opacity-60" />
                    <h4 className="font-typewriter font-bold text-xs uppercase tracking-wider text-noir-ink mb-1">
                      {lang === 'VI' ? 'NGĂN KÉO MỤC LỤC TRỐNG' : 'EMPTY INDEX CARD DRAWER'}
                    </h4>
                    <p className="text-xs font-serif italic text-noir-inkMuted max-w-sm mx-auto">
                      {lang === 'VI'
                        ? 'Chưa có câu lệnh nào được lưu trữ. Mỗi lần bạn chạy truy vấn trên màn hình Côn-son, một thẻ mục lục sẽ được ghi nhận vào đây.'
                        : 'No queries have been filed yet. Execute SQL queries on the console monitor to file index cards into this drawer.'}
                    </p>
                  </div>
                ) : (
                  filteredHistory.map((item, idx) => {
                    const isSuccess = item.status === 'SUCCESS';
                    const hasResultSnapshot =
                      isSuccess &&
                      item.resultData &&
                      (Array.isArray(item.resultData)
                        ? item.resultData.length > 0
                        : item.resultData.values && item.resultData.values.length > 0);

                    // First 2 lines snippet
                    const queryLines = item.query.split('\n').filter((l) => l.trim().length > 0);
                    const querySnippet = queryLines.slice(0, 2).join('\n');

                    return (
                      <motion.div
                        key={item.id}
                        initial={reducedMotion ? false : { y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                        className="bg-[#FAF6EC] border-2 border-noir-borderDark rounded-[3px] p-2.5 shadow-noir-card relative flex flex-col gap-2 hover:border-noir-blood transition-colors group"
                      >
                        {/* Top Index Card Tab Bar */}
                        <div className="flex items-center justify-between gap-1 flex-wrap border-b border-noir-borderDark/40 pb-1.5">
                          {/* Index Tab Label */}
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-noir-card border border-noir-borderDark text-xs font-mono font-bold text-noir-ink">
                              TAB-#{String(filteredHistory.length - idx).padStart(2, '0')}
                            </span>
                            <span className="text-xs font-mono text-noir-inkMuted">
                              {item.timestamp}
                            </span>
                            {item.executionTimeMs !== undefined && (
                              <span className="text-xs font-mono text-noir-inkMuted">
                                • {item.executionTimeMs.toFixed(1)}ms
                              </span>
                            )}
                          </div>

                          {/* Status Stamp */}
                          <div>
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-typewriter font-bold uppercase">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>
                                  {item.rowCount !== undefined
                                    ? `${item.rowCount} ${item.rowCount === 1 ? 'dòng' : 'dòng'}`
                                    : 'OK'}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 text-xs font-typewriter font-bold uppercase">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                                <span>{lang === 'VI' ? 'LỖI CÚ PHÁP' : 'SYNTAX ERROR'}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* SQL Snippet Body (First 2 Lines) */}
                        <div className="bg-[#FFFFFF] border border-noir-borderDark/50 rounded-[2px] p-2 font-mono text-xs text-noir-ink overflow-hidden shadow-inner">
                          <pre className="whitespace-pre-wrap font-mono line-clamp-2 selection:bg-noir-candle/30">
                            {querySnippet}
                          </pre>
                        </div>

                        {/* Error Message Preview */}
                        {!isSuccess && item.errorMessage && (
                          <div className="text-xs font-mono text-noir-blood bg-noir-blood/10 p-1.5 rounded border border-noir-blood/20 break-all">
                            <span className="font-bold mr-1">[Error]:</span>
                            {item.errorMessage}
                          </div>
                        )}

                        {/* Bottom Actions Bar (≥ 40px touch targets, real buttons, visible focus ring) */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-noir-borderDark/20 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {/* Replace query in editor */}
                            {onSelectQuery && (
                              <button
                                type="button"
                                onClick={() => handleReplace(item.query)}
                                className="min-h-[40px] px-2.5 py-1 rounded-[2px] bg-noir-card hover:bg-noir-cardHover border border-noir-borderDark text-noir-ink text-xs font-typewriter font-bold flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-blood"
                                title={
                                  lang === 'VI'
                                    ? 'Nạp thay thế câu lệnh vào trình soạn thảo'
                                    : 'Replace query in editor'
                                }
                                aria-label={
                                  lang === 'VI'
                                    ? `Nạp thay thế câu lệnh thẻ #${filteredHistory.length - idx}`
                                    : `Replace query card #${filteredHistory.length - idx}`
                                }
                              >
                                <Play className="w-3.5 h-3.5 fill-noir-blood text-noir-blood" />
                                <span>{lang === 'VI' ? 'Nạp Đè' : 'Replace'}</span>
                              </button>
                            )}

                            {/* Append query to editor */}
                            <button
                              type="button"
                              onClick={() => handleAppend(item.query)}
                              className="min-h-[40px] px-2.5 py-1 rounded-[2px] bg-noir-paper hover:bg-noir-paperLight border border-noir-borderDark text-noir-ink text-xs font-typewriter font-bold flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-blood"
                              title={
                                lang === 'VI'
                                  ? 'Nối thêm câu lệnh này vào cuối trình soạn thảo'
                                  : 'Append query to editor'
                              }
                              aria-label={
                                lang === 'VI'
                                  ? `Nối thêm câu lệnh thẻ #${filteredHistory.length - idx}`
                                  : `Append query card #${filteredHistory.length - idx}`
                              }
                            >
                              <Plus className="w-3.5 h-3.5 text-noir-candleDark" />
                              <span>{lang === 'VI' ? '+ Nối' : '+ Append'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Copy SQL Button */}
                            <button
                              type="button"
                              onClick={() => handleCopyQuery(item.query, item.id)}
                              className="min-h-[40px] min-w-[40px] p-2 rounded-[2px] bg-noir-paper hover:bg-noir-card border border-noir-borderDark text-noir-ink flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-blood"
                              title={lang === 'VI' ? 'Sao chép mã SQL' : 'Copy SQL snippet'}
                              aria-label={
                                lang === 'VI'
                                  ? `Sao chép mã SQL thẻ #${filteredHistory.length - idx}`
                                  : `Copy SQL from card #${filteredHistory.length - idx}`
                              }
                            >
                              {copiedId === item.id ? (
                                <Check className="w-4 h-4 text-noir-stamp" />
                              ) : (
                                <Copy className="w-4 h-4 text-noir-inkMuted" />
                              )}
                            </button>

                            {/* View Result Snapshot Button */}
                            {hasResultSnapshot && (
                              <button
                                type="button"
                                onClick={() => setInspectItem(item)}
                                className="min-h-[40px] px-2.5 py-1 rounded-[2px] bg-noir-candle/20 hover:bg-noir-candle/40 text-noir-candleDark border border-noir-candleDark font-bold text-xs font-typewriter flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-candleDark"
                                title={
                                  lang === 'VI'
                                    ? 'Mở biên bản kết quả truy vấn cũ'
                                    : 'View query result snapshot'
                                }
                                aria-label={
                                  lang === 'VI'
                                    ? `Mở xem kết quả thẻ #${filteredHistory.length - idx}`
                                    : `View snapshot for card #${filteredHistory.length - idx}`
                                }
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{lang === 'VI' ? 'Kết Quả' : 'Snapshot'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= Snapshot Result Modal Dialog ================= */}
      <SnapshotModal
        item={inspectItem}
        lang={lang}
        onClose={() => setInspectItem(null)}
        onRestoreQuery={
          onSelectQuery && inspectItem ? () => handleReplace(inspectItem.query) : undefined
        }
      />
    </div>
  );
};

interface SnapshotModalProps {
  item: QueryHistoryItem | null;
  lang: 'VI' | 'EN';
  onClose: () => void;
  onRestoreQuery?: () => void;
}

const SnapshotModal: React.FC<SnapshotModalProps> = ({
  item,
  lang,
  onClose,
  onRestoreQuery,
}) => {
  // Extract columns and rows
  let columns: string[] = [];
  let rows: (string | number | boolean | null)[][] = [];

  if (item?.resultData) {
    if (Array.isArray(item.resultData)) {
      if (item.resultData.length > 0) {
        columns = Object.keys(item.resultData[0]);
        rows = item.resultData.map((obj) =>
          columns.map((col) => obj[col] as string | number | boolean | null)
        );
      }
    } else if (item.resultData.columns && item.resultData.values) {
      columns = item.resultData.columns;
      rows = item.resultData.values as (string | number | boolean | null)[][];
    }
  }

  return (
    <Modal
      isOpen={Boolean(item)}
      onClose={onClose}
      maxWidth="3xl"
      title={
        item ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Database className="w-4 h-4 text-noir-blood shrink-0" />
            <span className="font-typewriter text-xs font-bold uppercase text-noir-ink">
              {lang === 'VI' ? 'BIÊN BẢN KẾT QUẢ TRUY VẤN LỊCH SỬ' : 'QUERY RESULT SNAPSHOT'}
            </span>
            <span className="font-mono text-xs text-noir-inkMuted bg-noir-paper px-2 py-0.5 rounded border border-noir-borderDark font-bold">
              {item.timestamp}
            </span>
            <span className="font-mono text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
              {rows.length} {lang === 'VI' ? 'dòng kết quả' : 'rows'}
            </span>
          </div>
        ) : undefined
      }
    >
      {item && (
        <div className="space-y-3.5">
          {/* SQL Query Snippet Bar */}
          <div className="p-3 bg-noir-paperLight border border-noir-borderDark/60 rounded-[3px] flex items-center justify-between gap-3">
            <pre className="font-mono text-xs text-noir-ink truncate flex-1 font-bold">
              {item.query}
            </pre>
            {onRestoreQuery && (
              <button
                type="button"
                onClick={() => {
                  onRestoreQuery();
                  onClose();
                }}
                className="min-h-[40px] px-3 rounded text-xs font-typewriter font-bold bg-noir-blood text-noir-parchment hover:bg-noir-bloodDark transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-blood"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{lang === 'VI' ? 'Nạp vào Editor' : 'Restore'}</span>
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="max-h-[50vh] overflow-auto bg-noir-paperLight border border-noir-borderDark rounded-[3px]">
            {rows.length === 0 ? (
              <div className="py-8 text-center text-xs font-typewriter text-noir-inkMuted font-bold">
                {lang === 'VI' ? 'Không có bản ghi dữ liệu nào' : '0 records returned'}
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-noir-card border-b-2 border-noir-borderDark font-typewriter text-xs text-noir-ink font-bold uppercase sticky top-0">
                    <th className="py-2 px-3 w-10 text-center border-r border-noir-borderDark/60">
                      #
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="py-2 px-3 border-r border-noir-borderDark/60 last:border-r-0 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-noir-borderDark/30 font-mono text-xs">
                  {rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-noir-card/50 odd:bg-noir-paper/40 even:bg-noir-parchment/40"
                    >
                      <td className="py-1.5 px-3 text-center text-noir-inkMuted border-r border-noir-borderDark/30 select-none text-xs font-bold">
                        {rIdx + 1}
                      </td>
                      {row.map((val, cIdx) => (
                        <td
                          key={cIdx}
                          className="py-1.5 px-3 border-r border-noir-borderDark/30 last:border-r-0 whitespace-nowrap text-xs"
                        >
                          {val === null || val === undefined ? (
                            <span className="text-noir-inkFaint italic">NULL</span>
                          ) : typeof val === 'boolean' ? (
                            <span className="text-noir-blood font-bold">
                              {val ? 'TRUE' : 'FALSE'}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal Close Footer */}
          <div className="pt-2 border-t border-noir-borderDark flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 text-xs font-typewriter font-bold bg-noir-paper border border-noir-borderDark rounded hover:bg-noir-card text-noir-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-blood"
            >
              {lang === 'VI' ? 'Đóng cửa sổ' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
