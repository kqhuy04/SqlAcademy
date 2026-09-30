import React, { useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql, SQLite } from '@codemirror/lang-sql';
import { Button } from '@/components/ui/Button';
import { Play, RotateCcw, CheckCircle2, Terminal } from 'lucide-react';
import type { TableMetadata } from '@/types/tutorial.types';

interface TutorialSQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRunQuery: () => void;
  onSubmit: () => void;
  onReset: () => void;
  isQueryRunning: boolean;
  isSubmitting: boolean;
  tables?: TableMetadata[];
  lang: 'VI' | 'EN';
}

export const TutorialSQLEditor: React.FC<TutorialSQLEditorProps> = ({
  value,
  onChange,
  onRunQuery,
  onSubmit,
  onReset,
  isQueryRunning,
  isSubmitting,
  tables,
  lang,
}) => {
  // Autocompletion schema for SQLite
  const sqlExtensions = useMemo(() => {
    const schema: Record<string, string[]> = {};
    if (tables && tables.length > 0) {
      tables.forEach((t) => {
        schema[t.name] = t.columns.map((c) => c.name);
      });
    }
    return [
      sql({
        dialect: SQLite,
        schema,
        upperCaseKeywords: true,
      }),
    ];
  }, [tables]);

  // Shortcut: Ctrl+Enter / Cmd+Enter to run query
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isQueryRunning && !isSubmitting) {
          onRunQuery();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQueryRunning, isSubmitting, onRunQuery]);

  return (
    <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] overflow-hidden shadow-noir-card flex flex-col">
      {/* Editor Docket Header */}
      <div className="bg-noir-card px-4 py-2 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-typewriter text-noir-ink font-bold">
          <Terminal className="w-4 h-4 text-noir-blood" />
          <span className="uppercase tracking-wider">
            {lang === 'VI' ? 'CỬA SỔ SOẠN THẢO SQL' : 'SQL EDITOR'}
          </span>
          <span className="text-[10px] text-noir-inkMuted bg-noir-parchment px-2 py-0.5 rounded border border-noir-border font-mono hidden sm:inline">
            {lang === 'VI' ? 'Nhấn Ctrl + Enter để chạy' : 'Ctrl + Enter to run'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-7 text-xs px-2.5 flex items-center gap-1 border-noir-borderDark text-noir-inkMuted hover:text-noir-ink"
            title={lang === 'VI' ? 'Khôi phục lệnh ban đầu' : 'Reset starter query'}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{lang === 'VI' ? 'Đặt lại' : 'Reset'}</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRunQuery}
            disabled={isQueryRunning}
            className="h-7 text-xs px-3 flex items-center gap-1.5 font-bold"
          >
            <Play className="w-3 h-3 text-noir-candle fill-noir-candle" />
            <span>{isQueryRunning ? (lang === 'VI' ? 'Đang chạy...' : 'Running...') : (lang === 'VI' ? 'Chạy thử' : 'Run Query')}</span>
          </Button>

          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="h-7 text-xs px-3 flex items-center gap-1.5 font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isSubmitting ? (lang === 'VI' ? 'Đang chấm...' : 'Evaluating...') : (lang === 'VI' ? 'Nộp bài' : 'Submit')}</span>
          </Button>
        </div>
      </div>

      {/* CodeMirror Workspace */}
      <div className="min-h-[180px] max-h-[320px] overflow-auto text-sm font-mono bg-white">
        <CodeMirror
          value={value}
          height="100%"
          minHeight="180px"
          extensions={sqlExtensions}
          onChange={onChange}
          className="h-full min-h-[180px] bg-white border-none focus:outline-none"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            completionKeymap: true,
          }}
        />
      </div>
    </div>
  );
};
