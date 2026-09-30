import React, { useState } from 'react';
import type { TutorialLesson } from '@/types/tutorial.types';
import {
  Workflow,
  ArrowRight,
  Filter,
  Layers,
  Database,
  Table,
  CheckCircle2,
  ListOrdered,
  Zap,
  Info,
} from 'lucide-react';

interface SqlExecutionDiagramProps {
  lesson: TutorialLesson;
  lang: 'VI' | 'EN';
  className?: string;
}

export const SqlExecutionDiagram: React.FC<SqlExecutionDiagramProps> = ({
  lesson,
  lang,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'concept'>('concept');
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Determine lesson concept category
  const title = (lesson.titleVi + ' ' + lesson.titleEn + ' ' + lesson.starterQuery + ' ' + (lesson.requiredKeywords || []).join(' ')).toUpperCase();
  const isJoin = title.includes('JOIN');
  const isGroupBy = title.includes('GROUP BY') || title.includes('COUNT') || title.includes('SUM') || title.includes('AVG');
  const isFilter = title.includes('WHERE') || title.includes('LIKE') || title.includes('BETWEEN') || title.includes('IN (');
  const isOrderOrLimit = title.includes('ORDER BY') || title.includes('LIMIT');
  const isOptimization = lesson.isOptimizationLesson || title.includes('INDEX') || title.includes('OPTIMIZ');

  // Standard 6-step logical query processing order
  const logicalSteps = [
    {
      num: 1,
      keyword: 'FROM & JOIN',
      descVi: 'Xác định bảng nguồn & liên kết dữ liệu theo khóa ngoại',
      descEn: 'Identify target table & join matching relational rows',
      icon: Database,
      highlight: isJoin,
    },
    {
      num: 2,
      keyword: 'WHERE',
      descVi: 'Lọc các hàng thô theo điều kiện hiện trường',
      descEn: 'Evaluate row conditions and eliminate non-matching clues',
      icon: Filter,
      highlight: isFilter,
    },
    {
      num: 3,
      keyword: 'GROUP BY',
      descVi: 'Gom các bản ghi vào từng nhóm (phân loại địa bàn, tội danh)',
      descEn: 'Aggregate records into buckets for forensic calculation',
      icon: Layers,
      highlight: isGroupBy,
    },
    {
      num: 4,
      keyword: 'SELECT',
      descVi: 'Trích xuất cột cần xem, tính toán biểu thức & đặt bí danh AS',
      descEn: 'Project specific columns, compute formulas and aliases',
      icon: Table,
      highlight: !isJoin && !isGroupBy && !isFilter && !isOrderOrLimit && !isOptimization,
    },
    {
      num: 5,
      keyword: 'ORDER BY',
      descVi: 'Sắp xếp danh sách chứng cứ tăng hoặc giảm dần',
      descEn: 'Sort forensic records chronologically or by rank',
      icon: ListOrdered,
      highlight: isOrderOrLimit,
    },
    {
      num: 6,
      keyword: 'LIMIT',
      descVi: 'Cắt lấy Top N bản ghi đầu tiên cần kiểm tra',
      descEn: 'Limit returned output to the most critical Top N suspects',
      icon: Zap,
      highlight: isOrderOrLimit,
    },
  ];

  return (
    <div
      className={`bg-noir-paper border-2 border-noir-borderDark rounded-[4px] shadow-noir-card overflow-hidden ${className}`}
    >
      {/* Diagram Header with Mode Switcher */}
      <div className="bg-noir-card px-4 py-2.5 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-noir-blood" />
          <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-noir-ink">
            {lang === 'VI'
              ? 'SƠ ĐỒ TRỰC QUAN HÓA CÁCH CHẠY SQL'
              : 'VISUAL SQL EXECUTION FLOW ARCHITECTURE'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-noir-paper border border-noir-borderDark rounded-[2px] p-0.5 text-xs font-typewriter">
          <button
            type="button"
            onClick={() => setActiveTab('concept')}
            className={`px-2.5 py-1 rounded-[2px] font-bold transition-colors ${
              activeTab === 'concept'
                ? 'bg-noir-blood text-noir-parchment'
                : 'text-noir-ink hover:bg-noir-card'
            }`}
          >
            {lang === 'VI' ? 'Minh Họa Khái Niệm' : 'Visual Concept'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-2.5 py-1 rounded-[2px] font-bold transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-noir-blood text-noir-parchment'
                : 'text-noir-ink hover:bg-noir-card'
            }`}
          >
            {lang === 'VI' ? 'Luồng Thực Thi RDBMS' : 'Logical Pipeline'}
          </button>
        </div>
      </div>

      {/* Concept-Specific Diagram Visualizer */}
      {activeTab === 'concept' && (
        <div className="p-4 sm:p-6 bg-[#FCF9F2] space-y-4">
          <div className="flex items-center gap-2 text-xs font-typewriter text-noir-inkMuted pb-2 border-b border-noir-borderDark/40">
            <Info className="w-3.5 h-3.5 text-noir-candleDark" />
            <span>
              {lang === 'VI'
                ? 'Mô phỏng đường đi của dữ liệu từ bảng lưu trữ đến kết quả hiển thị:'
                : 'Forensic data stream simulation from disk storage to output display:'}
            </span>
          </div>

          {/* Render corresponding visual chart */}
          {isJoin ? (
            <JoinVisualDiagram lang={lang} lesson={lesson} />
          ) : isGroupBy ? (
            <GroupByVisualDiagram lang={lang} />
          ) : isFilter ? (
            <FilterVisualDiagram lang={lang} />
          ) : isOrderOrLimit ? (
            <OrderLimitVisualDiagram lang={lang} />
          ) : isOptimization ? (
            <OptimizationVisualDiagram lang={lang} />
          ) : (
            <SelectProjectionVisualDiagram lang={lang} lesson={lesson} />
          )}
        </div>
      )}

      {/* Logical Execution Order Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="p-4 sm:p-6 bg-[#FCF9F2] space-y-4">
          <div className="p-3 bg-[#FAF6EC] border border-noir-borderDark/60 rounded text-xs font-serif text-noir-ink italic leading-relaxed">
            {lang === 'VI'
              ? '💡 Master SQL Tip: Khác với ngôn ngữ lập trình chạy từ trên xuống, SQL Engine luôn chạy theo thứ tự logic: tìm bảng (FROM) -> lọc hàng (WHERE) -> gom nhóm (GROUP BY) -> rồi mới chọn cột hiển thị (SELECT) và sắp xếp (ORDER BY).'
              : '💡 Master SQL Tip: Unlike procedural code, SQL execution order is logical: FROM (tables) -> WHERE (filters) -> GROUP BY (buckets) -> SELECT (projections) -> ORDER BY (sorting) -> LIMIT (clipping).'}
          </div>

          {/* Responsive Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {logicalSteps.map((step) => {
              const Icon = step.icon;
              const isSelected = activeStep === step.num || step.highlight;

              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`p-3 rounded-[3px] border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-noir-card border-noir-blood shadow-noir-sm scale-[1.01]'
                      : 'bg-noir-paper border-noir-borderDark/60 opacity-80 hover:opacity-100 hover:border-noir-borderDark'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-noir-blood text-noir-parchment flex items-center justify-center font-mono font-bold text-xs">
                        {step.num}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-noir-candleDark" />
                      <span className="font-mono font-bold text-xs text-noir-ink">
                        {step.keyword}
                      </span>
                    </div>
                    {step.highlight && (
                      <span className="text-[9px] font-typewriter uppercase bg-noir-candle/20 text-noir-candleDark px-1.5 py-0.5 rounded border border-noir-candleDark font-bold">
                        {lang === 'VI' ? 'Bài này' : 'Active'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-serif text-noir-inkMuted leading-snug">
                    {lang === 'VI' ? step.descVi : step.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-noir-card/60 px-4 py-2 border-t border-noir-borderDark/40 flex items-center justify-between text-[11px] font-typewriter text-noir-inkMuted">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-noir-stamp" />
          <span>
            {lang === 'VI' ? 'Tương thích SQLite 3 & chuẩn ANSI SQL' : 'SQLite 3 & ANSI SQL Verified'}
          </span>
        </span>
        <span className="font-mono text-[10px] text-noir-blood font-bold">
          ID: {lesson.id}
        </span>
      </div>
    </div>
  );
};

// =========================================================================
// SPECIFIC CONCEPT VISUALIZERS
// =========================================================================

// 1. SELECT Projection (Trích xuất cột)
const SelectProjectionVisualDiagram: React.FC<{ lang: 'VI' | 'EN'; lesson: TutorialLesson }> = ({
  lang,
  lesson,
}) => {
  const table = lesson.tables[0];
  const colNames = table ? table.columns.map((c) => c.name) : ['id', 'full_name', 'alias', 'age', 'record'];
  const targetCols = colNames.slice(0, 2);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2">
      {/* Source Table */}
      <div className="bg-noir-card/80 border border-noir-borderDark rounded p-3 w-full md:w-56 shadow-sm">
        <div className="font-typewriter text-[11px] font-bold text-noir-blood uppercase mb-2 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          <span>{lang === 'VI' ? `Bảng nguồn (${table?.name || 'suspects'})` : `Source Table (${table?.name || 'suspects'})`}</span>
        </div>
        <div className="space-y-1">
          {colNames.slice(0, 5).map((col) => {
            const isPicked = targetCols.includes(col);
            return (
              <div
                key={col}
                className={`font-mono text-xs px-2 py-1 rounded flex items-center justify-between border ${
                  isPicked
                    ? 'bg-noir-paper border-noir-blood text-noir-blood font-bold'
                    : 'bg-noir-paper/50 border-noir-border text-noir-inkMuted'
                }`}
              >
                <span>{col}</span>
                {isPicked && <span className="text-[10px] uppercase font-typewriter">✓ Selected</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Projection Pipeline Arrow */}
      <div className="flex flex-col items-center justify-center text-noir-blood">
        <div className="font-typewriter text-[10px] font-bold uppercase mb-1 bg-noir-card px-2 py-0.5 rounded border border-noir-borderDark">
          SELECT Projection
        </div>
        <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
      </div>

      {/* Result Stream */}
      <div className="bg-emerald-950/10 border-2 border-emerald-800/40 rounded p-3 w-full md:w-56 shadow-sm">
        <div className="font-typewriter text-[11px] font-bold text-emerald-900 uppercase mb-2 flex items-center gap-1.5">
          <Table className="w-3.5 h-3.5" />
          <span>{lang === 'VI' ? 'Tập kết quả trả về' : 'Target Result Set'}</span>
        </div>
        <div className="space-y-1">
          {targetCols.map((col) => (
            <div
              key={col}
              className="font-mono text-xs px-2 py-1 rounded bg-noir-paper border border-emerald-800 text-emerald-950 font-bold flex items-center justify-between"
            >
              <span>{col}</span>
              <span className="text-[9px] font-typewriter text-emerald-800">READY</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. WHERE Filtering Gate (Lọc bản ghi)
const FilterVisualDiagram: React.FC<{ lang: 'VI' | 'EN' }> = ({ lang }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2">
      {/* Raw Records */}
      <div className="bg-noir-card/80 border border-noir-borderDark rounded p-3 w-full md:w-52 shadow-sm space-y-1.5 text-xs font-mono">
        <div className="font-typewriter text-[11px] font-bold text-noir-blood uppercase mb-1">
          {lang === 'VI' ? 'Hồ sơ đầu vào (100%)' : 'Raw Records (100%)'}
        </div>
        <div className="p-1.5 bg-noir-paper rounded border border-noir-border flex justify-between">
          <span>Row #1: Age = 45</span>
          <span className="text-emerald-800 font-bold">MATCH</span>
        </div>
        <div className="p-1.5 bg-noir-paper rounded border border-noir-border flex justify-between opacity-50">
          <span>Row #2: Age = 22</span>
          <span className="text-noir-blood">DROP</span>
        </div>
        <div className="p-1.5 bg-noir-paper rounded border border-noir-border flex justify-between">
          <span>Row #3: Age = 38</span>
          <span className="text-emerald-800 font-bold">MATCH</span>
        </div>
      </div>

      {/* Filter Gate */}
      <div className="flex flex-col items-center justify-center text-noir-blood px-2 text-center">
        <div className="font-typewriter text-[10.5px] font-bold uppercase mb-1 bg-noir-blood text-noir-parchment px-2.5 py-1 rounded shadow-sm">
          WHERE Condition Gate
        </div>
        <span className="text-[10px] font-mono text-noir-inkMuted italic">Predicate: age &gt; 30</span>
        <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0 mt-1" />
      </div>

      {/* Filtered Records */}
      <div className="bg-emerald-950/10 border-2 border-emerald-800/40 rounded p-3 w-full md:w-52 shadow-sm space-y-1.5 text-xs font-mono">
        <div className="font-typewriter text-[11px] font-bold text-emerald-900 uppercase mb-1">
          {lang === 'VI' ? 'Manh mối hợp lệ' : 'Qualified Dossiers'}
        </div>
        <div className="p-1.5 bg-noir-paper rounded border border-emerald-800/50 text-emerald-950 font-bold">
          Row #1: Age = 45
        </div>
        <div className="p-1.5 bg-noir-paper rounded border border-emerald-800/50 text-emerald-950 font-bold">
          Row #3: Age = 38
        </div>
      </div>
    </div>
  );
};

// 3. JOIN Relational Matching (Ghép nối bảng)
const JoinVisualDiagram: React.FC<{ lang: 'VI' | 'EN'; lesson: TutorialLesson }> = ({
  lang,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 py-2">
      {/* Table A */}
      <div className="bg-noir-card/80 border border-noir-borderDark rounded p-3 w-full lg:w-48 shadow-sm">
        <div className="font-typewriter text-[11px] font-bold text-noir-blood uppercase mb-2">
          Table A: suspects
        </div>
        <div className="space-y-1 text-xs font-mono">
          <div className="p-1 bg-noir-paper rounded border border-noir-borderDark flex justify-between">
            <span className="font-bold text-noir-candleDark">id: 101</span>
            <span>Vance</span>
          </div>
          <div className="p-1 bg-noir-paper rounded border border-noir-borderDark flex justify-between">
            <span className="font-bold text-noir-candleDark">id: 102</span>
            <span>Rostova</span>
          </div>
        </div>
      </div>

      {/* Relational Connector */}
      <div className="flex flex-col items-center justify-center text-center px-2">
        <div className="font-typewriter text-[10.5px] font-bold uppercase bg-noir-blood text-noir-parchment px-2.5 py-1 rounded shadow-sm">
          ON A.id = B.suspect_id
        </div>
        <span className="text-[10px] font-mono text-noir-inkMuted mt-1">Foreign Key Link</span>
        <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0 mt-1 text-noir-blood" />
      </div>

      {/* Table B */}
      <div className="bg-noir-card/80 border border-noir-borderDark rounded p-3 w-full lg:w-48 shadow-sm">
        <div className="font-typewriter text-[11px] font-bold text-noir-blood uppercase mb-2">
          Table B: crime_scenes
        </div>
        <div className="space-y-1 text-xs font-mono">
          <div className="p-1 bg-noir-paper rounded border border-noir-borderDark flex justify-between">
            <span className="font-bold text-noir-candleDark">suspect_id: 101</span>
            <span>Bank Rob</span>
          </div>
          <div className="p-1 bg-noir-paper rounded border border-noir-borderDark flex justify-between">
            <span className="font-bold text-noir-candleDark">suspect_id: 101</span>
            <span>Getaway</span>
          </div>
        </div>
      </div>

      {/* Result Joined Table */}
      <div className="bg-emerald-950/10 border-2 border-emerald-800/40 rounded p-3 w-full lg:w-56 shadow-sm">
        <div className="font-typewriter text-[11px] font-bold text-emerald-900 uppercase mb-2">
          {lang === 'VI' ? 'Bảng ghép hoàn chỉnh' : 'Joined Composite Result'}
        </div>
        <div className="space-y-1 text-xs font-mono text-emerald-950 font-medium">
          <div className="p-1 bg-noir-paper rounded border border-emerald-800/40 text-[11px]">
            [101] Vance ➔ Bank Rob
          </div>
          <div className="p-1 bg-noir-paper rounded border border-emerald-800/40 text-[11px]">
            [101] Vance ➔ Getaway
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. GROUP BY & Aggregates (Gom nhóm & tổng hợp)
const GroupByVisualDiagram: React.FC<{ lang: 'VI' | 'EN' }> = ({ lang }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2">
      {/* Individual items */}
      <div className="bg-noir-card/80 border border-noir-borderDark rounded p-3 w-full md:w-48 shadow-sm text-xs font-mono space-y-1">
        <div className="font-typewriter text-[11px] font-bold text-noir-blood uppercase mb-1.5">
          {lang === 'VI' ? 'Dữ liệu phân tán' : 'Raw Data'}
        </div>
        <div className="p-1 bg-noir-paper rounded border border-noir-border">Suspect A - Dist 1</div>
        <div className="p-1 bg-noir-paper rounded border border-noir-border">Suspect B - Dist 2</div>
        <div className="p-1 bg-noir-paper rounded border border-noir-border">Suspect C - Dist 1</div>
        <div className="p-1 bg-noir-paper rounded border border-noir-border">Suspect D - Dist 1</div>
      </div>

      {/* Bucket Aggregation Flow */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="font-typewriter text-[10.5px] font-bold uppercase bg-noir-blood text-noir-parchment px-2 py-0.5 rounded">
          GROUP BY district
        </div>
        <span className="text-[10px] font-mono text-noir-inkMuted mt-1">Aggregator: COUNT(*)</span>
        <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0 mt-1 text-noir-blood" />
      </div>

      {/* Aggregated Buckets */}
      <div className="bg-emerald-950/10 border-2 border-emerald-800/40 rounded p-3 w-full md:w-52 shadow-sm text-xs font-mono space-y-1.5">
        <div className="font-typewriter text-[11px] font-bold text-emerald-900 uppercase mb-1">
          {lang === 'VI' ? 'Nhóm đã tổng hợp' : 'Aggregated Buckets'}
        </div>
        <div className="p-1.5 bg-noir-paper rounded border border-emerald-800/40 flex justify-between font-bold">
          <span>District 1</span>
          <span className="text-emerald-800">count = 3</span>
        </div>
        <div className="p-1.5 bg-noir-paper rounded border border-emerald-800/40 flex justify-between font-bold">
          <span>District 2</span>
          <span className="text-emerald-800">count = 1</span>
        </div>
      </div>
    </div>
  );
};

// 5. ORDER BY & LIMIT (Sắp xếp & Cắt tỉa)
const OrderLimitVisualDiagram: React.FC<{ lang: 'VI' | 'EN' }> = ({ lang }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-2 text-xs font-mono">
      <div className="bg-noir-card/80 border border-noir-borderDark rounded p-3 w-full md:w-44 space-y-1">
        <div className="font-typewriter text-[11px] font-bold text-noir-blood uppercase mb-1">
          {lang === 'VI' ? 'Chưa sắp xếp' : 'Unsorted'}
        </div>
        <div className="p-1 bg-noir-paper rounded border border-noir-border">Suspect A (Age 25)</div>
        <div className="p-1 bg-noir-paper rounded border border-noir-border">Suspect B (Age 42)</div>
        <div className="p-1 bg-noir-paper rounded border border-noir-border">Suspect C (Age 31)</div>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="font-typewriter text-[10px] font-bold uppercase bg-noir-card px-2 py-0.5 rounded border border-noir-borderDark mb-1">
          ORDER BY age DESC
        </div>
        <div className="font-typewriter text-[10px] font-bold uppercase bg-noir-blood text-noir-parchment px-2 py-0.5 rounded">
          LIMIT 2
        </div>
        <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0 mt-1 text-noir-blood" />
      </div>

      <div className="bg-emerald-950/10 border-2 border-emerald-800/40 rounded p-3 w-full md:w-48 space-y-1">
        <div className="font-typewriter text-[11px] font-bold text-emerald-900 uppercase mb-1">
          {lang === 'VI' ? 'Top 2 Lớn Tuổi Nhất' : 'Top 2 Ranked'}
        </div>
        <div className="p-1 bg-noir-paper rounded border border-emerald-800/40 font-bold">
          #1: Suspect B (Age 42)
        </div>
        <div className="p-1 bg-noir-paper rounded border border-emerald-800/40 font-bold">
          #2: Suspect C (Age 31)
        </div>
      </div>
    </div>
  );
};

// 6. Index Optimization Diagram
const OptimizationVisualDiagram: React.FC<{ lang: 'VI' | 'EN' }> = ({ lang }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
      {/* Full Table Scan */}
      <div className="p-3 rounded border-2 border-noir-blood/40 bg-noir-blood/5 text-xs font-mono space-y-1">
        <div className="font-typewriter text-[11px] font-bold text-noir-blood uppercase">
          ❌ Full Table Scan (O(N))
        </div>
        <p className="font-serif text-[11px] text-noir-inkMuted leading-relaxed">
          {lang === 'VI'
            ? 'Quét tuần tự từng trang đĩa để tìm kiếm. Rất chậm khi bảng có hàng triệu hồ sơ.'
            : 'Scans every single row on disk sequentially. Poor performance on massive datasets.'}
        </p>
      </div>

      {/* B-Tree Index Seek */}
      <div className="p-3 rounded border-2 border-emerald-800/50 bg-emerald-950/10 text-xs font-mono space-y-1">
        <div className="font-typewriter text-[11px] font-bold text-emerald-900 uppercase">
          ⚡ B-Tree Index Seek (O(log N))
        </div>
        <p className="font-serif text-[11px] text-noir-inkMuted leading-relaxed">
          {lang === 'VI'
            ? 'Nhảy trực tiếp đến vị trí con trỏ bằng cây chỉ mục B-Tree. Tốc độ tức thì.'
            : 'Traverses B-Tree hierarchy directly to the target record pointer. Instantaneous lookup.'}
        </p>
      </div>
    </div>
  );
};
