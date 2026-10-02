import React, { useState, useEffect, useRef } from 'react';
import {
  FileEdit,
  Save,
  Copy,
  Trash2,
  Check,
  PlusCircle,
  Clock,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DetectiveNotesProps {
  storageKey: string;
  lang?: 'VI' | 'EN';
  title?: string;
  placeholder?: string;
  className?: string;
}

export const DetectiveNotes: React.FC<DetectiveNotesProps> = ({
  storageKey,
  lang = 'VI',
  title,
  placeholder,
  className = '',
}) => {
  const [noteContent, setNoteContent] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved note on key change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setNoteContent(saved);
      } else {
        setNoteContent('');
      }
      setLastSaved(null);
    } catch {
      // LocalStorage access error handling
    }
  }, [storageKey]);

  // Debounced auto-save
  const handleContentChange = (val: string) => {
    setNoteContent(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, val);
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastSaved(timeStr);
      } catch {
        // LocalStorage quota error
      }
    }, 400);
  };

  // Insert structured deduction templates
  const handleInsertTemplate = (template: string) => {
    const nextVal = noteContent ? `${noteContent.trimEnd()}\n${template}` : template;
    handleContentChange(nextVal);
    toast.success(lang === 'VI' ? 'Đã thêm gợi ý vào sổ tay' : 'Template added to notes');
  };

  // Copy notes to clipboard
  const handleCopyNotes = () => {
    if (!noteContent.trim()) {
      toast(lang === 'VI' ? 'Sổ tay chưa có nội dung để sao chép' : 'No notes to copy', {
        icon: '📝',
      });
      return;
    }
    navigator.clipboard.writeText(noteContent);
    setIsCopied(true);
    toast.success(lang === 'VI' ? 'Đã sao chép ghi chú trinh sát!' : 'Detective notes copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Clear notes with custom Noir modal confirmation
  const handleClearNotes = () => {
    if (!noteContent.trim()) return;
    setShowConfirmClear(true);
  };

  const executeClearNotes = () => {
    setNoteContent('');
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setLastSaved(null);
    setShowConfirmClear(false);
    toast.success(lang === 'VI' ? 'Đã xóa toàn bộ sổ tay' : 'Notes discarded');
  };

  const defaultTitle =
    lang === 'VI' ? 'SỔ TAY TRINH SÁT HIỆN TRƯỜNG' : 'INVESTIGATION FIELD LOG';
  const defaultPlaceholder =
    lang === 'VI'
      ? `Ghi chép nhanh các suy luận của bạn tại đây:
- Nghi phạm tiềm năng & ngoại phạm
- Các giá trị ID, mốc thời gian hoặc biển số cần theo dấu
- Ý tưởng câu lệnh SQL tiếp theo...`
      : `Record your deductive thoughts and clues here:
- Prime suspects & alibis
- IDs, timestamps, or license plates to track
- Next SQL query ideas...`;

  const charCount = noteContent.length;
  const lineCount = noteContent ? noteContent.split('\n').length : 0;

  return (
    <div
      className={`bg-noir-paper border-2 border-noir-borderDark rounded-[4px] shadow-noir-card flex flex-col min-h-[340px] overflow-hidden ${className}`}
    >
      {/* Top Docket Header */}
      <div className="bg-noir-card px-4 py-2.5 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-noir-blood" />
          <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-noir-ink">
            {title || defaultTitle}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-noir-paper text-noir-inkMuted border border-noir-borderDark/60">
            {lineCount} {lang === 'VI' ? 'dòng' : lineCount === 1 ? 'line' : 'lines'} • {charCount} {lang === 'VI' ? 'ký tự' : 'chars'}
          </span>
        </div>

        {/* Auto-save badge & Action buttons */}
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-950/10 px-2 py-0.5 rounded border border-emerald-800/30">
              <Save className="w-2.5 h-2.5" />
              <span>
                {lang === 'VI' ? `Đã lưu ${lastSaved}` : `Saved ${lastSaved}`}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyNotes}
            className="flex items-center gap-1 text-[11px] font-typewriter px-2 py-1 rounded-[2px] bg-noir-paper hover:bg-noir-cardHover border border-noir-borderDark text-noir-ink transition-colors"
            title={lang === 'VI' ? 'Sao chép ghi chú' : 'Copy notes'}
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-noir-stamp" />
            ) : (
              <Copy className="w-3 h-3 text-noir-inkMuted" />
            )}
            <span className="hidden sm:inline">
              {isCopied
                ? lang === 'VI'
                  ? 'Đã chép'
                  : 'Copied'
                : lang === 'VI'
                ? 'Sao chép'
                : 'Copy'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleClearNotes}
            disabled={!noteContent.trim()}
            className="p-1 rounded-[2px] hover:bg-noir-blood/10 text-noir-inkMuted hover:text-noir-blood border border-transparent hover:border-noir-blood/30 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-noir-inkMuted"
            title={lang === 'VI' ? 'Xóa toàn bộ ghi chú' : 'Clear notes'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Template Toolbar */}
      <div className="bg-[#FAF6EC] px-4 py-2 border-b border-noir-borderDark/40 flex items-center gap-1.5 flex-wrap text-xs">
        <span className="text-[10.5px] font-typewriter uppercase text-noir-inkMuted mr-1 font-bold flex items-center gap-1">
          <PlusCircle className="w-3 h-3 text-noir-candleDark" />
          {lang === 'VI' ? 'Mẫu nhanh:' : 'Quick tags:'}
        </span>

        <button
          type="button"
          onClick={() =>
            handleInsertTemplate(
              lang === 'VI' ? '[ ] Nghi phạm mục tiêu: ' : '[ ] Target suspect: '
            )
          }
          className="text-[10px] font-typewriter px-2 py-0.5 rounded-[2px] bg-noir-card/60 hover:bg-noir-card border border-noir-borderDark text-noir-ink transition-colors flex items-center gap-1"
        >
          <Shield className="w-2.5 h-2.5 text-noir-blood" />
          <span>{lang === 'VI' ? '+ Nghi phạm' : '+ Suspect'}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            handleInsertTemplate(
              lang === 'VI'
                ? '[✓] Manh mối đã xác thực: '
                : '[✓] Verified clue: '
            )
          }
          className="text-[10px] font-typewriter px-2 py-0.5 rounded-[2px] bg-noir-card/60 hover:bg-noir-card border border-noir-borderDark text-noir-ink transition-colors"
        >
          {lang === 'VI' ? '+ Manh mối' : '+ Clue'}
        </button>

        <button
          type="button"
          onClick={() =>
            handleInsertTemplate(
              lang === 'VI'
                ? '[✗] Loại trừ ngoại phạm: '
                : '[✗] Ruled out (Alibi): '
            )
          }
          className="text-[10px] font-typewriter px-2 py-0.5 rounded-[2px] bg-noir-card/60 hover:bg-noir-card border border-noir-borderDark text-noir-ink transition-colors"
        >
          {lang === 'VI' ? '+ Loại trừ' : '+ Rule out'}
        </button>

        <button
          type="button"
          onClick={() =>
            handleInsertTemplate(
              lang === 'VI'
                ? `[🕒 ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Ghi nhận: `
                : `[🕒 ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Log: `
            )
          }
          className="text-[10px] font-typewriter px-2 py-0.5 rounded-[2px] bg-noir-card/60 hover:bg-noir-card border border-noir-borderDark text-noir-ink transition-colors flex items-center gap-1"
        >
          <Clock className="w-2.5 h-2.5 text-noir-candleDark" />
          <span>{lang === 'VI' ? '+ Mốc giờ' : '+ Timestamp'}</span>
        </button>
      </div>

      {/* Main Notepad Area */}
      <div className="flex-1 p-3 bg-[#FCF9F2] relative">
        <textarea
          value={noteContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full h-full min-h-[220px] bg-transparent border-0 focus:ring-0 focus:outline-none font-typewriter text-xs sm:text-sm text-noir-ink placeholder-noir-inkFaint leading-relaxed resize-none selection:bg-noir-candle/30"
          spellCheck={false}
        />
      </div>

      {/* Notepad Footer Status */}
      <div className="px-4 py-1.5 bg-noir-card/40 border-t border-noir-borderDark/40 flex items-center justify-between text-[10px] font-typewriter text-noir-inkMuted">
        <span>
          {lang === 'VI'
            ? 'Tự động lưu vào bộ nhớ trình duyệt'
            : 'Auto-saved to local browser storage'}
        </span>
        <span className="italic">
          {lang === 'VI' ? 'Hồ sơ bảo mật nội bộ' : 'Confidential dossier memo'}
        </span>
      </div>

      {/* Clear Notes Confirmation Modal */}
      <Modal
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        title={lang === 'VI' ? 'TIÊU HỦY GHI CHÚ ĐIỀU TRA' : 'DISCARD FIELD LOG'}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-noir-blood/10 border border-noir-blood/30 rounded">
            <AlertTriangle className="w-5 h-5 text-noir-blood flex-shrink-0 mt-0.5" />
            <div className="text-xs font-sans text-noir-ink leading-relaxed">
              {lang === 'VI' ? (
                <>
                  Bạn có chắc chắn muốn xóa toàn bộ ghi chú hiện trường này không?
                  <br />
                  <span className="font-semibold text-noir-blood">Dữ liệu ghi chép sẽ bị xóa vĩnh viễn</span> và không thể khôi phục lại.
                </>
              ) : (
                <>
                  Are you sure you want to discard this entire investigation docket?
                  <br />
                  <span className="font-semibold text-noir-blood">All field notes will be permanently erased</span> and cannot be recovered.
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmClear(false)}
            >
              {lang === 'VI' ? 'Giữ lại' : 'Keep'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={executeClearNotes}
            >
              {lang === 'VI' ? 'Xác nhận tiêu hủy' : 'Confirm Discard'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
