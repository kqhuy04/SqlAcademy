import React, { useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql, MySQL } from '@codemirror/lang-sql';
import { Button } from '@/components/ui/Button';
import { useLanguageStore } from '@/store/languageStore';
import { Play, Terminal, ShieldAlert, Database } from 'lucide-react';
import type { CaseTableDTO } from '@/types/case.types';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunQuery: () => void;
  isLoading: boolean;
  caseId: number;
  tables?: CaseTableDTO[];
  onScrollToSchema?: () => void;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  onRunQuery,
  isLoading,
  caseId,
  tables,
  onScrollToSchema,
}) => {
  const { lang } = useLanguageStore();

  // Build SQL extension with case schema for autocompletion
  const sqlExtensions = useMemo(() => {
    const schema: Record<string, string[]> = {};
    if (tables && tables.length > 0) {
      tables.forEach((t) => {
        schema[t.tableName] = (t.columnDTOList || []).map((c) => c.columnName);
      });
    }
    return [
      sql({
        dialect: MySQL,
        schema,
        upperCaseKeywords: true,
      }),
    ];
  }, [tables]);

  // Shortcut: Ctrl+Enter or Cmd+Enter to run query
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading) {
          onRunQuery();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onRunQuery]);

  return (
    <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] overflow-hidden shadow-noir-card flex flex-col">
      {/* Editor Docket Header */}
      <div className="bg-noir-card px-4 py-2.5 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-noir-blood text-noir-parchment text-[10px] font-typewriter font-bold uppercase px-2 py-0.5 rounded-[2px] tracking-wider">
            {lang === 'VI' ? 'BÀN PHÁ ÁN SQL' : 'SQL CRACKING DESK'}
          </div>
          <div className="h-4 w-px bg-noir-borderDark mx-0.5" />
          <div className="flex items-center gap-1.5 text-xs font-typewriter text-noir-ink flex-wrap">
            <Terminal className="w-3.5 h-3.5 text-noir-blood" />
            <span className="font-bold">CON-01</span>
            <span className="text-noir-borderDark">|</span>
            <span className="text-noir-inkMuted font-mono text-[11px]">DB: case_{caseId}</span>
            {tables && tables.length > 0 && (
              <>
                <span className="text-noir-borderDark">|</span>
                <button
                  type="button"
                  onClick={onScrollToSchema}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-noir-blood hover:text-noir-bloodDark hover:underline cursor-pointer bg-noir-cardHover px-1.5 py-0.5 rounded-[2px] transition-colors"
                  title={lang === 'VI' ? 'Xem các bảng dữ liệu chứng cứ' : 'View evidence tables and column schema'}
                >
                  <Database className="w-3 h-3" />
                  <span>
                    {tables.length}{' '}
                    {lang === 'VI'
                      ? 'bảng dữ liệu'
                      : tables.length === 1
                      ? 'table'
                      : 'tables'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-block text-[11px] font-typewriter text-noir-inkMuted">
            [Ctrl + Enter]
          </span>
          <Button
            size="sm"
            variant="gold"
            isLoading={isLoading}
            onClick={onRunQuery}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            {lang === 'VI' ? 'Thực Thi Truy Vấn' : 'Execute Query'}
          </Button>
        </div>
      </div>

      {/* CodeMirror Surface */}
      <div className="text-sm font-mono flex-1 min-h-[180px] max-h-[320px] overflow-auto bg-white">
        <CodeMirror
          value={value}
          height="100%"
          minHeight="180px"
          extensions={sqlExtensions}
          onChange={(val) => onChange(val)}
          placeholder={
            lang === 'VI'
              ? 'Nhập câu lệnh SQL điều tra tại đây (ví dụ: SELECT * FROM visitors WHERE ...)'
              : 'Draft SQL forensic query here (e.g. SELECT * FROM visitors WHERE ...)'
          }
          className="h-full min-h-[180px] bg-white border-none focus:outline-none"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: false,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: false,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {/* Editor Status Bar */}
      <div className="bg-noir-card/80 px-4 py-1.5 border-t border-noir-borderDark/60 flex items-center justify-between text-[11px] font-typewriter text-noir-inkMuted">
        <div className="flex items-center gap-2">
          <span className="text-noir-stamp font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-noir-stamp" />{' '}
            {lang === 'VI' ? 'HỆ THỐNG SẴN SÀNG' : 'SYSTEM READY'}
          </span>
          <span className="hidden sm:inline">
            {lang === 'VI'
              ? '• Chế độ giám định chỉ đọc (SELECT / WITH)'
              : '• Read-only forensic mode (SELECT / WITH)'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <ShieldAlert className="w-3 h-3 text-noir-candleDark" />
          <span>{lang === 'VI' ? 'GIÁM ĐỊNH MYSQL 8.0' : 'MYSQL 8.0 FORENSICS'}</span>
        </div>
      </div>
    </div>
  );
};
