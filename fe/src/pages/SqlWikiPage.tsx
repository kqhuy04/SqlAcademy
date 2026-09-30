import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Modal } from '@/components/ui/Modal';
import { useLanguageStore } from '@/store/languageStore';
import { SQL_WIKI_ENTRIES, SqlClauseExample } from '@/data/sqlWikiData';
import {
  Search,
  Copy,
  Check,
  Code2,
  Terminal,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Layers,
  Table as TableIcon,
  GraduationCap,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const SqlWikiPage: React.FC = () => {
  const { lang } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExecOrder, setSelectedExecOrder] = useState<number | null>(null);
  const [activeModalEntry, setActiveModalEntry] = useState<SqlClauseExample | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Execution order steps
  const executionSteps = [
    { step: 1, name: 'FROM & JOIN', descVi: 'Xác định bảng & kết nối nguồn', descEn: 'Identify & join tables' },
    { step: 2, name: 'WHERE', descVi: 'Lọc dữ liệu từng dòng', descEn: 'Filter individual rows' },
    { step: 3, name: 'GROUP BY', descVi: 'Gom nhóm các bản ghi', descEn: 'Aggregate into groups' },
    { step: 4, name: 'HAVING', descVi: 'Lọc kết quả sau khi gom nhóm', descEn: 'Filter aggregated groups' },
    { step: 5, name: 'SELECT', descVi: 'Trích xuất cột & tính toán', descEn: 'Select columns & evaluate' },
    { step: 6, name: 'DISTINCT', descVi: 'Loại bỏ các dòng trùng lặp', descEn: 'Eliminate duplicate rows' },
    { step: 7, name: 'WINDOW', descVi: 'Thi hành các hàm OVER()', descEn: 'Execute window functions' },
    { step: 8, name: 'ORDER BY', descVi: 'Sắp xếp kết quả cuối', descEn: 'Sort the result set' },
    { step: 9, name: 'LIMIT', descVi: 'Giới hạn số dòng hiển thị', descEn: 'Constrain output row count' },
  ];

  // Alphabetically sorted and filtered entries
  const alphabetSortedEntries = useMemo(() => {
    let list = [...SQL_WIKI_ENTRIES];

    // Filter by execution order if step selected
    if (selectedExecOrder !== null) {
      list = list.filter((e) => e.executionOrder === selectedExecOrder);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((entry) => {
        const matchesName = entry.name.toLowerCase().includes(q);
        const matchesSyntax = entry.syntax.toLowerCase().includes(q);
        const matchesSummary = (lang === 'VI' ? entry.summaryVi : entry.summaryEn).toLowerCase().includes(q);
        const matchesScenario = (lang === 'VI' ? entry.detectiveScenarioVi : entry.detectiveScenarioEn).toLowerCase().includes(q);
        return matchesName || matchesSyntax || matchesSummary || matchesScenario;
      });
    }

    // Sort alphabetically by clause name
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, selectedExecOrder, lang]);

  const handleCopySql = (id: string, sqlText: string) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 2000);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedExecOrder(null);
  };

  return (
    <PageWrapper>
      <AnimatedPage>
        {/* Header Section */}
        <div className="mb-8 border-b-2 border-noir-borderDark pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-noir-ink tracking-tight uppercase">
              {lang === 'VI' ? 'Cẩm Nang' : 'Detective Handbook'}
            </h1>
            <p className="text-xs sm:text-sm font-serif text-noir-inkMuted mt-1 max-w-xl italic">
              {lang === 'VI'
                ? '“Quy trình thực thi và bảng tra cứu cú pháp điều tra dữ liệu tội phạm theo bảng chữ cái.”'
                : '“Query execution pipeline and alphabetical reference directory for forensic data detectives.”'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start md:self-auto bg-noir-card border border-noir-border px-3.5 py-1.5 rounded-lg text-xs font-typewriter text-noir-inkMuted shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {lang === 'VI' ? `${SQL_WIKI_ENTRIES.length} Lệnh & Cú Pháp Chuẩn` : `${SQL_WIKI_ENTRIES.length} Standard SQL Clauses`}
            </span>
          </div>
        </div>

        {/* PHẦN TRÊN: SQL Engine Execution Order Flowchart */}
        <div className="mb-8 bg-gradient-to-br from-[#1C1917] to-[#292524] text-stone-100 rounded-xl p-5 border-2 border-stone-700 shadow-noir-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-typewriter font-bold uppercase tracking-wider text-amber-300">
                {lang === 'VI' ? 'Thứ Tự Thi Hành Của Động Cơ SQL (Execution Order)' : 'SQL Engine Query Execution Order'}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-stone-400">
              {lang === 'VI' ? '💡 Nhấp vào một bước để lọc các lệnh tương ứng' : '💡 Click a step to filter matching clauses'}
            </span>
          </div>

          <p className="text-xs text-stone-300 mb-4 leading-relaxed">
            {lang === 'VI' ? (
              <>
                Thứ tự viết code (<span className="text-amber-300 font-mono">SELECT ... FROM ... WHERE</span>) khác với{' '}
                <span className="text-emerald-400 font-bold">thứ tự thực tế bộ máy SQL vận hành</span>: Bắt đầu từ nạp dữ liệu bảng nguồn{' '}
                <span className="text-amber-300 font-mono font-semibold">FROM & JOIN</span>, qua các bước lọc, gom nhóm, rồi mới tới{' '}
                <span className="text-amber-300 font-mono font-semibold">SELECT</span> và sắp xếp cuối cùng.
              </>
            ) : (
              <>
                The written query order (<span className="text-amber-300 font-mono">SELECT ... FROM ... WHERE</span>) differs from the{' '}
                <span className="text-emerald-400 font-bold">actual engine execution pipeline</span>: It begins at source loading{' '}
                <span className="text-amber-300 font-mono font-semibold">FROM & JOIN</span>, moves through filters and grouping, evaluates{' '}
                <span className="text-amber-300 font-mono font-semibold">SELECT</span>, and finishes at ordering.
              </>
            )}
          </p>

          {/* Stepper Grid (1 -> 9) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
            {executionSteps.map((item) => {
              const isSelected = selectedExecOrder === item.step;
              return (
                <button
                  key={item.step}
                  onClick={() => setSelectedExecOrder(isSelected ? null : item.step)}
                  className={cn(
                    'relative text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between group cursor-pointer',
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                      : 'bg-stone-900/80 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:border-stone-500'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold',
                        isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-amber-400 border border-stone-700'
                      )}
                    >
                      {item.step}
                    </span>
                    {isSelected && <span className="text-[10px] font-mono text-amber-400">✓</span>}
                  </div>
                  <div className="font-mono text-xs font-bold text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                    {lang === 'VI' ? item.descVi : item.descEn}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedExecOrder !== null && (
            <div className="mt-3.5 pt-3 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs text-amber-300 font-typewriter">
                {lang === 'VI'
                  ? `Đang lọc các lệnh thuộc Bước #${selectedExecOrder} (${executionSteps[selectedExecOrder - 1]?.name})`
                  : `Filtering clauses evaluated at Step #${selectedExecOrder} (${executionSteps[selectedExecOrder - 1]?.name})`}
              </span>
              <button
                onClick={() => setSelectedExecOrder(null)}
                className="text-xs text-stone-400 hover:text-white underline font-mono cursor-pointer"
              >
                {lang === 'VI' ? 'Hiển thị tất cả' : 'Show all steps'}
              </button>
            </div>
          )}
        </div>

        {/* PHẦN DƯỚI: Search Bar & Alphabetical Table */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-noir-inkMuted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={
                  lang === 'VI'
                    ? 'Tìm kiếm câu lệnh SQL'
                    : 'Search SQL clause'
                }
                placeholder={
                  lang === 'VI'
                    ? 'Tìm kiếm lệnh (SELECT, WHERE, JOIN, GROUP BY...)'
                    : 'Search clause (SELECT, WHERE, JOIN, GROUP BY...)'
                }
                className="w-full pl-10 pr-10 py-2.5 bg-noir-paper border-2 border-noir-borderDark rounded-[3px] text-xs font-sans text-noir-ink placeholder:text-noir-inkMuted focus:outline-none focus:border-noir-blood shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={lang === 'VI' ? 'Xóa từ khóa tìm kiếm' : 'Clear search query'}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-xs font-mono text-noir-inkMuted hover:text-noir-ink rounded cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-typewriter text-noir-inkMuted uppercase">
                {lang === 'VI'
                  ? `Sắp xếp A → Z • ${alphabetSortedEntries.length} lệnh`
                  : `Sorted A → Z • ${alphabetSortedEntries.length} clauses`}
              </span>

              {(selectedExecOrder !== null || searchQuery) && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-3 py-1.5 bg-noir-card hover:bg-noir-paper border border-noir-borderDark rounded-[3px] text-[11px] font-typewriter text-noir-blood font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  <span>{lang === 'VI' ? 'Đặt lại' : 'Reset'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Alphabetical Table */}
        <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] shadow-noir-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-noir-card border-b-2 border-noir-borderDark text-[11px] font-typewriter font-bold uppercase tracking-wider text-noir-ink">
                  <th className="py-3 px-4 sm:px-6 w-[32%] sm:w-[28%] border-r border-noir-borderDark/60">
                    {lang === 'VI' ? 'Lệnh / Cú Pháp SQL' : 'SQL Clause / Command'}
                  </th>
                  <th className="py-3 px-4 sm:px-6">
                    <div className="flex items-center justify-between gap-2">
                      <span>{lang === 'VI' ? 'Tác Dụng & Giải Thích Ngắn Gọn' : 'Brief Explanation & Utility'}</span>
                      <span className="hidden sm:inline text-[10px] font-mono text-noir-inkMuted lowercase italic">
                        {lang === 'VI' ? '(Nhấp vào dòng để xem chi tiết & ví dụ)' : '(Click row for details & examples)'}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-borderDark/60">
                {alphabetSortedEntries.length > 0 ? (
                  alphabetSortedEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      tabIndex={0}
                      role="button"
                      onClick={() => setActiveModalEntry(entry)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveModalEntry(entry);
                        }
                      }}
                      className="group cursor-pointer hover:bg-amber-500/10 focus-visible:outline-none focus-visible:bg-amber-500/15 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-noir-blood transition-colors"
                      title={lang === 'VI' ? `Nhấp để xem chi tiết ${entry.name}` : `Click to view details for ${entry.name}`}
                    >
                      {/* Column 1: Clause Name & Step */}
                      <td className="py-3 px-4 sm:px-6 border-r border-noir-borderDark/60 align-middle">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                          <span className="font-mono text-sm font-bold text-noir-ink group-hover:text-noir-blood transition-colors">
                            {entry.name}
                          </span>
                          {entry.executionOrder > 0 && (
                            <span className="inline-block w-fit px-1.5 py-0.5 bg-noir-card border border-noir-borderDark text-[10px] font-mono rounded text-noir-inkMuted group-hover:border-amber-500/50">
                              {lang === 'VI' ? `#${entry.executionOrder}` : `Step #${entry.executionOrder}`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Short Summary */}
                      <td className="py-3 px-4 sm:px-6 align-middle">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs sm:text-sm font-sans text-noir-ink/90 leading-relaxed">
                            {lang === 'VI' ? entry.summaryVi : entry.summaryEn}
                          </span>
                          <span className="shrink-0 text-xs font-mono text-noir-inkMuted group-hover:text-noir-blood flex items-center gap-1 transition-colors">
                            <span className="hidden sm:inline text-[11px] font-typewriter uppercase">
                              {lang === 'VI' ? 'Chi tiết' : 'Details'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-12 text-center text-noir-inkMuted">
                      <Search className="w-8 h-8 mx-auto mb-2 text-noir-inkMuted" />
                      <p className="text-sm font-typewriter font-bold text-noir-ink">
                        {lang === 'VI' ? 'Không tìm thấy câu lệnh phù hợp' : 'No matching clauses found'}
                      </p>
                      <button
                        onClick={resetAllFilters}
                        className="mt-3 text-xs text-noir-blood font-mono underline cursor-pointer"
                      >
                        {lang === 'VI' ? 'Hiển thị tất cả lệnh' : 'Show all clauses'}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* POPUP / MODAL: Detailed Explanation + Practical Example + Tutorial Link */}
        <Modal
          isOpen={activeModalEntry !== null}
          onClose={() => setActiveModalEntry(null)}
          maxWidth="2xl"
          title={
            activeModalEntry ? (
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xl font-black font-mono text-noir-ink tracking-tight">
                  {activeModalEntry.name}
                </span>
                <span className="px-2 py-0.5 bg-noir-card border border-noir-borderDark text-[10.5px] font-mono rounded text-noir-inkMuted uppercase">
                  {activeModalEntry.category}
                </span>
                {activeModalEntry.executionOrder > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded text-[11px] font-mono font-bold">
                    {lang === 'VI'
                      ? `Bước thi hành #${activeModalEntry.executionOrder}`
                      : `Execution Step #${activeModalEntry.executionOrder}`}
                  </span>
                )}
              </div>
            ) : null
          }
          subtitle={
            activeModalEntry ? (
              <span>{lang === 'VI' ? activeModalEntry.summaryVi : activeModalEntry.summaryEn}</span>
            ) : null
          }
        >
          {activeModalEntry && (
            <div className="space-y-4">
              {/* Detailed Explanation */}
              <div>
                <p className="text-xs sm:text-sm font-sans text-noir-ink leading-relaxed">
                  {lang === 'VI' ? activeModalEntry.explanationVi : activeModalEntry.explanationEn}
                </p>
              </div>

              {/* Syntax Specification */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-typewriter font-bold text-noir-inkMuted mb-1 uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-noir-inkMuted" />
                  <span>{lang === 'VI' ? 'Cấu Trúc Cú Pháp (Syntax)' : 'Syntax Specification'}</span>
                </div>
                <div className="bg-[#1C1917] text-amber-200/95 font-mono text-xs p-3 rounded-[3px] border border-stone-800 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                  {activeModalEntry.syntax}
                </div>
              </div>

              {/* Detective Forensic Scenario */}
              <div className="bg-amber-500/10 border-l-[3px] border-amber-600 p-3 rounded-r-[3px]">
                <div className="flex items-center gap-1.5 text-[11px] font-typewriter font-bold text-amber-900 mb-1 uppercase tracking-wide">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'VI' ? 'Tình Huống Phá Án Thực Tế' : 'Forensic Investigation Case'}</span>
                </div>
                <p className="text-xs font-sans text-stone-800 leading-relaxed italic">
                  "{lang === 'VI' ? activeModalEntry.detectiveScenarioVi : activeModalEntry.detectiveScenarioEn}"
                </p>
              </div>

              {/* Example SQL Code Block */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-typewriter font-bold text-noir-inkMuted uppercase tracking-wider">
                    <Code2 className="w-3.5 h-3.5 text-noir-inkMuted" />
                    <span>{lang === 'VI' ? 'Ví Dụ Truy Vấn Thực Chiến' : 'Practical Query Example'}</span>
                  </div>
                  <button
                    onClick={() => handleCopySql(activeModalEntry.id, activeModalEntry.exampleSql)}
                    className={cn(
                      'px-2.5 py-1 rounded text-[11px] font-mono font-medium flex items-center gap-1 transition-all border cursor-pointer',
                      copiedId === activeModalEntry.id
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : 'bg-noir-card hover:bg-noir-paper border-noir-borderDark text-noir-ink'
                    )}
                    title="Copy SQL code"
                  >
                    {copiedId === activeModalEntry.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>{lang === 'VI' ? 'Đã sao chép' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-noir-inkMuted" />
                        <span>{lang === 'VI' ? 'Sao chép SQL' : 'Copy SQL'}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-[#18181B] text-emerald-300 font-mono text-[12px] p-3 rounded-[3px] border border-stone-800 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                  {activeModalEntry.exampleSql}
                </div>
              </div>

              {/* Output Preview (if present) */}
              {activeModalEntry.expectedOutputPreview && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-typewriter font-bold text-noir-inkMuted mb-1 uppercase tracking-wider">
                    <TableIcon className="w-3.5 h-3.5 text-noir-inkMuted" />
                    <span>{lang === 'VI' ? 'Kết Quả Dự Kiến' : 'Expected Output'}</span>
                  </div>
                  <div className="bg-stone-900/90 text-stone-300 font-mono text-[11px] p-2.5 rounded-[3px] border border-stone-800 whitespace-pre-wrap overflow-x-auto leading-normal">
                    {activeModalEntry.expectedOutputPreview}
                  </div>
                </div>
              )}

              {/* Pro Tip (if present) */}
              {(activeModalEntry.tipsVi || activeModalEntry.tipsEn) && (
                <div className="pt-2 border-t border-noir-borderDark/40 flex items-start gap-2 text-xs font-sans text-noir-inkMuted">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong className="text-noir-ink font-semibold">
                      {lang === 'VI' ? 'Kinh nghiệm pháp y: ' : 'Forensic tip: '}
                    </strong>
                    {lang === 'VI' ? activeModalEntry.tipsVi : activeModalEntry.tipsEn}
                  </span>
                </div>
              )}

              {/* Tutorial Direct Link Button */}
              {activeModalEntry.tutorialPath && (
                <div className="mt-4 pt-4 border-t border-noir-borderDark flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-500/10 p-3.5 rounded-[4px] border border-amber-600/30">
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <div className="p-2 rounded bg-amber-600 text-white shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-typewriter font-bold uppercase tracking-wider text-amber-900">
                        {lang === 'VI' ? 'Bài học liên quan trong Học Viện' : 'Related Lesson in Academy'}
                      </div>
                      <div className="text-xs font-sans text-noir-ink font-bold">
                        {lang === 'VI' ? activeModalEntry.tutorialTitleVi : activeModalEntry.tutorialTitleEn}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={activeModalEntry.tutorialPath}
                    onClick={() => setActiveModalEntry(null)}
                    className="w-full sm:w-auto px-4 py-2 bg-noir-blood hover:bg-noir-blood/90 text-white rounded-[3px] text-xs font-typewriter font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    <span>{lang === 'VI' ? 'Vào bài học' : 'Go to Lesson'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </Modal>
      </AnimatedPage>
    </PageWrapper>
  );
};
