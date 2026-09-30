import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Table, AlertCircle, Database, Layers } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useLanguageStore } from '@/store/languageStore';

interface ResultTableProps {
  data: Record<string, unknown>[] | null;
  error: string | null;
  isLoading: boolean;
  attempts: number;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  data,
  error,
  isLoading,
  attempts,
}) => {
  const { lang } = useLanguageStore();

  // Generate columns dynamically based on keys in the first row
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => {
        const val = info.getValue();
        if (val === null || val === undefined) {
          return <span className="text-noir-inkFaint italic font-mono">NULL</span>;
        }
        if (typeof val === 'boolean') {
          return <span className="font-mono text-noir-blood font-bold">{val ? 'TRUE' : 'FALSE'}</span>;
        }
        return <span className="font-mono text-noir-ink">{String(val)}</span>;
      },
    }));
  }, [data]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] overflow-hidden shadow-noir-card flex flex-col min-h-[220px]">
      {/* Table Header / Action Bar */}
      <div className="bg-noir-card px-4 py-2.5 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-typewriter text-noir-ink">
          <Table className="w-4 h-4 text-noir-blood" />
          <span className="font-bold uppercase tracking-wider">
            {lang === 'VI' ? 'BIÊN BẢN TRUY VẤN CHỨNG CỨ' : 'EVIDENCE QUERY TRANSCRIPT'}
          </span>
          {data && data.length > 0 && (
            <span className="bg-noir-parchment text-noir-blood px-2 py-0.5 rounded-[2px] text-[11px] font-bold border border-noir-borderDark font-mono">
              {data.length} {lang === 'VI' ? 'bản ghi' : 'records'}
            </span>
          )}
        </div>

        <div className="text-[11px] font-typewriter text-noir-inkMuted">
          {lang === 'VI' ? 'Số lần thử:' : 'Attempts:'} <span className="font-bold text-noir-blood">{attempts}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto max-h-[360px] p-0.5 bg-[#FAF6EC]">
        {/* Loading */}
        {isLoading && (
          <div className="h-48 flex items-center justify-center">
            <Spinner
              size="md"
              label={
                lang === 'VI'
                  ? 'ĐANG THẨM VẤN CƠ SỞ DỮ LIỆU TỘI PHẠM...'
                  : 'INTERROGATING CRIME DATABASE...'
              }
            />
          </div>
        )}

        {/* Error Alert */}
        {!isLoading && error && (
          <div className="p-4 m-3 bg-noir-blood/10 border-2 border-dashed border-noir-blood rounded-[3px] flex items-start gap-3 text-noir-blood text-xs font-typewriter leading-relaxed">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-noir-blood" />
            <div>
              <div className="font-bold uppercase tracking-wider mb-1">
                {lang === 'VI'
                  ? 'LỆNH BỊ TỪ CHỐI / LỖI THỰC THI SQL:'
                  : 'COMMAND REJECTED / SQL EXECUTION ERROR:'}
              </div>
              <div className="font-mono text-noir-ink text-[11.5px] bg-noir-parchment p-2 rounded border border-noir-borderDark/60 mt-1">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Not Run Yet */}
        {!isLoading && !error && !data && (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-noir-inkMuted">
            <Database className="w-8 h-8 text-noir-borderDark mb-2" />
            <p className="text-xs font-typewriter font-bold uppercase tracking-wider text-noir-ink">
              {lang === 'VI' ? 'Chưa Có Kết Quả Truy Vấn' : 'No Query Results Yet'}
            </p>
            <p className="text-[11px] font-serif italic text-noir-inkMuted mt-0.5">
              {lang === 'VI'
                ? 'Soạn thảo câu lệnh SQL ở trên và nhấn "Thực Thi Truy Vấn" để trích xuất bằng chứng hiện trường.'
                : 'Draft an SQL query above and click "Execute Query" to uncover crime scene evidence.'}
            </p>
          </div>
        )}

        {/* 0 Records Returned */}
        {!isLoading && !error && data && data.length === 0 && (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-noir-inkMuted">
            <Layers className="w-8 h-8 text-noir-candleDark mb-2" />
            <p className="text-xs font-typewriter font-bold uppercase text-noir-ink">
              {lang === 'VI'
                ? 'Truy Vấn Thành Công — 0 Bản Ghi Được Tìm Thấy'
                : 'Query Executed Successfully — 0 Records Returned'}
            </p>
            <p className="text-[11px] font-serif italic text-noir-inkMuted mt-0.5">
              {lang === 'VI'
                ? 'Hãy kiểm tra lại mệnh đề WHERE, điều kiện lọc hoặc logic JOIN bảng của bạn.'
                : 'Inspect your WHERE clause, filtering conditions, or table JOIN logic.'}
            </p>
          </div>
        )}

        {/* TanStack Table Render */}
        {!isLoading && !error && data && data.length > 0 && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-noir-card border-b-2 border-noir-borderDark">
                    <th className="px-3 py-2 text-[11px] font-typewriter text-noir-inkMuted font-bold w-10 text-center border-r border-noir-borderDark/60">
                      #
                    </th>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2 text-[11px] font-typewriter uppercase tracking-wider text-noir-ink font-bold border-r border-noir-borderDark/60 last:border-r-0 whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-noir-borderDark/30 font-mono">
                {table.getRowModel().rows.map((row, rowIdx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-noir-card/60 transition-colors odd:bg-noir-paper/50 even:bg-noir-parchment/60"
                  >
                    <td className="px-3 py-1.5 font-typewriter text-[11px] text-noir-inkMuted text-center border-r border-noir-borderDark/40 select-none">
                      {rowIdx + 1}
                    </td>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-1.5 whitespace-nowrap border-r border-noir-borderDark/40 last:border-r-0 text-[12px]"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
