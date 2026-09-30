import React, { useState } from 'react';
import {
  History,
  Play,
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';

export interface QueryHistoryItem {
  id: string;
  timestamp: string;
  query: string;
  status: 'SUCCESS' | 'ERROR';
  rowCount?: number;
  errorMessage?: string;
  executionTimeMs?: number;
  // Snapshot of result rows (supports both Case API object array and SQLite WASM column/values)
  resultData?:
    | Record<string, unknown>[]
    | { columns: string[]; values: (string | number | boolean | Uint8Array | null)[][] }
    | null;
}

interface QueryHistoryPanelProps {
  history: QueryHistoryItem[];
  onSelectQuery?: (query: string) => void;
  onClearHistory?: () => void;
  lang?: 'VI' | 'EN';
  className?: string;
}

export const QueryHistoryPanel: React.FC<QueryHistoryPanelProps> = ({
  history,
  onSelectQuery,
  onClearHistory,
  lang = 'VI',
  className = '',
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<QueryHistoryItem | null>(null);
  const [filterText, setFilterText] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleCopyQuery = (query: string, id: string) => {
    navigator.clipboard.writeText(query);
    setCopiedId(id);
    toast.success(lang === 'VI' ? 'Đã sao chép câu lệnh SQL' : 'SQL query copied');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRestoreQuery = (query: string) => {
    if (onSelectQuery) {
      onSelectQuery(query);
      toast.success(
        lang === 'VI' ? 'Đã nạp câu lệnh vào trình soạn thảo' : 'Query loaded into editor'
      );
    }
  };

  const filteredHistory = history.filter((item) =>
    item.query.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div
      className={`bg-noir-paper border-2 border-noir-borderDark rounded-[4px] shadow-noir-card flex flex-col min-h-[340px] overflow-hidden ${className}`}
    >
      {/* Top Header */}
      <div className="bg-noir-card px-4 py-2.5 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-noir-blood" />
          <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-noir-ink">
            {lang === 'VI' ? 'NHẬT KÝ TRUY VẤN LỊCH SỬ' : 'QUERY EXECUTION LOG'}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-noir-paper text-noir-inkMuted border border-noir-borderDark/60">
            {history.length}{' '}
            {lang === 'VI' ? 'bản ghi' : history.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && onClearHistory && (
            confirmClear ? (
              <div className="flex items-center gap-1.5 bg-noir-paper px-2 py-1 rounded-[2px] border border-noir-blood/60">
                <span className="text-[11px] font-typewriter font-bold text-noir-blood">
                  {lang === 'VI' ? 'Xác nhận xóa?' : 'Clear all?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                    toast.success(lang === 'VI' ? 'Đã xóa lịch sử' : 'History cleared');
                  }}
                  className="text-[10px] font-typewriter font-bold px-2 py-0.5 rounded bg-noir-blood text-noir-parchment hover:bg-noir-bloodDark transition-colors"
                >
                  {lang === 'VI' ? 'Xóa' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="text-[10px] font-typewriter font-bold px-2 py-0.5 rounded bg-noir-card text-noir-ink hover:bg-noir-cardHover border border-noir-borderDark transition-colors"
                >
                  {lang === 'VI' ? 'Hủy' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1 text-[11px] font-typewriter px-2 py-1 rounded-[2px] bg-noir-paper hover:bg-noir-blood/10 text-noir-inkMuted hover:text-noir-blood border border-noir-borderDark transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>{lang === 'VI' ? 'Xóa lịch sử' : 'Clear Log'}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Filter search bar if multiple items */}
      {history.length > 3 && (
        <div className="bg-noir-paperLight px-3 py-1.5 border-b border-noir-borderDark/40 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-noir-inkMuted" />
          <input
            type="text"
            aria-label={lang === 'VI' ? 'Tìm kiếm trong lịch sử câu lệnh' : 'Filter queries'}
            placeholder={
              lang === 'VI'
                ? 'Tìm kiếm trong lịch sử câu lệnh...'
                : 'Filter queries...'
            }
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-mono text-noir-ink focus:outline-none focus:ring-0 p-0 placeholder-noir-inkFaint"
          />
          {filterText && (
            <button
              type="button"
              onClick={() => setFilterText('')}
              aria-label={lang === 'VI' ? 'Xóa bộ lọc tìm kiếm' : 'Clear search filter'}
              className="text-noir-inkMuted hover:text-noir-blood text-xs font-mono p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] p-3 space-y-2.5 bg-noir-paperLight">
        {filteredHistory.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-noir-inkMuted">
            <History className="w-8 h-8 text-noir-borderDark mb-2 opacity-50" />
            <p className="text-xs font-typewriter font-bold uppercase text-noir-ink">
              {lang === 'VI' ? 'Chưa có lịch sử truy vấn' : 'No Query History Yet'}
            </p>
            <p className="text-[11px] font-serif italic text-noir-inkMuted mt-0.5 max-w-xs">
              {lang === 'VI'
                ? 'Mỗi lần bạn nhấn "Execute Query", câu lệnh và kết quả sẽ được lưu lại tại đây để đối chiếu.'
                : 'Whenever you execute a query, the SQL string and result snapshot will be recorded here.'}
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
                : item.resultData.values.length > 0);

            return (
              <div
                key={item.id}
                className="border-2 border-noir-borderDark rounded-[3px] bg-noir-paper p-3 space-y-2 shadow-noir-sm hover:border-noir-blood/60 transition-colors"
              >
                {/* Status Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-noir-inkMuted font-bold">
                      #{filteredHistory.length - idx}
                    </span>
                    <span className="font-mono text-[10.5px] text-noir-inkMuted">
                      {item.timestamp}
                    </span>

                    {isSuccess ? (
                      <span className="flex items-center gap-1 text-[10px] font-typewriter font-bold text-emerald-800 bg-emerald-950/10 px-1.5 py-0.5 rounded border border-emerald-800/30 uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {item.rowCount !== undefined
                            ? `${item.rowCount} ${item.rowCount === 1 ? 'row' : 'rows'}`
                            : 'OK'}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-typewriter font-bold text-noir-blood bg-noir-blood/10 px-1.5 py-0.5 rounded border border-noir-blood/30 uppercase">
                        <AlertCircle className="w-3 h-3" />
                        <span>ERROR</span>
                      </span>
                    )}

                    {item.executionTimeMs !== undefined && (
                      <span className="font-mono text-[10px] text-noir-inkMuted">
                        {item.executionTimeMs.toFixed(1)}ms
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* View Snapshot Result */}
                    {hasResultSnapshot && (
                      <button
                        type="button"
                        onClick={() => setInspectItem(item)}
                        className="flex items-center gap-1 text-[10.5px] font-typewriter px-2 py-0.5 rounded-[2px] bg-noir-candle/15 hover:bg-noir-candle/30 text-noir-ink border border-noir-candleDark font-bold transition-colors"
                        title={
                          lang === 'VI'
                            ? 'Xem lại bảng kết quả của lần query này'
                            : 'View result snapshot'
                        }
                      >
                        <Eye className="w-3 h-3 text-noir-candleDark" />
                        <span>{lang === 'VI' ? 'Xem kết quả' : 'Snapshot'}</span>
                      </button>
                    )}

                    {/* Restore to Editor */}
                    {onSelectQuery && (
                      <button
                        type="button"
                        onClick={() => handleRestoreQuery(item.query)}
                        className="flex items-center gap-1 text-[10.5px] font-typewriter px-2 py-0.5 rounded-[2px] bg-noir-card hover:bg-noir-cardHover text-noir-ink border border-noir-borderDark font-bold transition-colors"
                        title={
                          lang === 'VI'
                            ? 'Nạp lại câu lệnh này vào trình soạn thảo'
                            : 'Restore query to editor'
                        }
                      >
                        <Play className="w-2.5 h-2.5 fill-noir-blood text-noir-blood" />
                        <span>{lang === 'VI' ? 'Nạp lại' : 'Use'}</span>
                      </button>
                    )}

                    {/* Copy Query */}
                    <button
                      type="button"
                      onClick={() => handleCopyQuery(item.query, item.id)}
                      className="p-1 rounded-[2px] hover:bg-noir-card border border-transparent hover:border-noir-borderDark text-noir-inkMuted hover:text-noir-ink transition-colors"
                      title={lang === 'VI' ? 'Sao chép SQL' : 'Copy query'}
                      aria-label={lang === 'VI' ? 'Sao chép SQL' : 'Copy query'}
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-noir-stamp" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Query Snippet */}
                <pre className="font-mono text-xs bg-noir-paperLight p-2 rounded border border-noir-borderDark/50 text-noir-ink overflow-x-auto whitespace-pre-wrap selection:bg-noir-candle/20">
                  {item.query}
                </pre>

                {/* Error message preview if failed */}
                {!isSuccess && item.errorMessage && (
                  <div className="font-mono text-[11px] text-noir-blood bg-noir-blood/5 p-1.5 rounded border border-noir-blood/20 flex items-start gap-1.5">
                    <span className="font-bold shrink-0">[Log]:</span>
                    <span className="break-all">{item.errorMessage}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Result Snapshot Modal Dialog */}
      <SnapshotModal
        item={inspectItem}
        lang={lang}
        onClose={() => setInspectItem(null)}
        onRestoreQuery={
          onSelectQuery && inspectItem ? () => handleRestoreQuery(inspectItem.query) : undefined
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
  // Extract columns and rows depending on data format
  let columns: string[] = [];
  let rows: (string | number | boolean | null)[][] = [];

  if (item?.resultData) {
    if (Array.isArray(item.resultData)) {
      if (item.resultData.length > 0) {
        columns = Object.keys(item.resultData[0]);
        rows = item.resultData.map((obj) => columns.map((col) => obj[col] as string | number | boolean | null));
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
              {lang === 'VI' ? 'KẾT QUẢ TRUY VẤN CŨ' : 'QUERY RESULT SNAPSHOT'}
            </span>
            <span className="font-mono text-[10px] text-noir-inkMuted bg-noir-paper px-1.5 py-0.5 rounded border border-noir-borderDark">
              {item.timestamp}
            </span>
            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-950/10 px-1.5 py-0.5 rounded border border-emerald-800/30">
              {rows.length} {lang === 'VI' ? 'dòng' : 'rows'}
            </span>
          </div>
        ) : undefined
      }
    >
      {item && (
        <div className="space-y-4">
          {/* Modal Query Sub-banner */}
          <div className="px-3.5 py-2.5 bg-noir-paperLight border border-noir-borderDark/60 rounded-[3px] flex items-center justify-between gap-3">
            <pre className="font-mono text-xs text-noir-ink truncate flex-1">{item.query}</pre>
            {onRestoreQuery && (
              <button
                type="button"
                onClick={() => {
                  onRestoreQuery();
                  onClose();
                }}
                className="text-[11px] font-typewriter font-bold text-noir-blood hover:underline flex items-center gap-1 shrink-0 min-h-[32px] px-2"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{lang === 'VI' ? 'Nạp vào Editor' : 'Restore'}</span>
              </button>
            )}
          </div>

          {/* Modal Body: Table render */}
          <div className="max-h-[55vh] overflow-auto bg-noir-paperLight rounded-[3px]">
            {rows.length === 0 ? (
              <div className="py-8 text-center text-xs font-typewriter text-noir-inkMuted">
                {lang === 'VI' ? 'Không có dữ liệu trả về' : '0 records returned'}
              </div>
            ) : (
              <div className="w-full overflow-x-auto border border-noir-borderDark rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-noir-card border-b-2 border-noir-borderDark font-typewriter text-[11px] text-noir-ink font-bold uppercase">
                      <th className="py-2 px-3 w-10 text-center border-r border-noir-borderDark/60">#</th>
                      {columns.map((col) => (
                        <th key={col} className="py-2 px-3 border-r border-noir-borderDark/60 last:border-r-0 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-noir-borderDark/30 font-mono text-xs">
                    {rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-noir-card/50 odd:bg-noir-paper/40 even:bg-noir-parchment/40">
                        <td className="py-1.5 px-3 text-center text-noir-inkMuted border-r border-noir-borderDark/30 select-none text-[11px]">
                          {rIdx + 1}
                        </td>
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-3 border-r border-noir-borderDark/30 last:border-r-0 whitespace-nowrap text-[12px]">
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

          {/* Modal Footer */}
          <div className="pt-2 border-t border-noir-borderDark flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 min-h-[38px] text-xs font-typewriter font-bold bg-noir-paper border border-noir-borderDark rounded hover:bg-noir-cardHover text-noir-ink transition-colors"
            >
              {lang === 'VI' ? 'Đóng cửa sổ' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
