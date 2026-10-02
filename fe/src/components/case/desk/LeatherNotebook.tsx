import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  Book,
  PenTool,
  Save,
  Copy,
  Trash2,
  Check,
  PlusCircle,
  Clock,
  Shield,
  AlertTriangle,
  X,
  FileText,
  CornerDownRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface LeatherNotebookProps {
  storageKey: string;
  lang?: 'VI' | 'EN';
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  reducedMotion?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  variant?: 'full' | 'compact' | 'dialog-only';
  className?: string;
}

export const LeatherNotebook: React.FC<LeatherNotebookProps> = ({
  storageKey,
  lang: langProp,
  isOpen,
  onOpen,
  onClose,
  reducedMotion = false,
  triggerRef,
  variant = 'full',
  className = '',
}) => {
  const { lang: globalLang } = useLanguageStore();
  const lang = langProp || globalLang;

  const [noteContent, setNoteContent] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteContentRef = useRef<string>('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keep ref synchronized with current content for instant flush on unmount/close
  useEffect(() => {
    noteContentRef.current = noteContent;
  }, [noteContent]);

  // Load saved note on mount or storageKey change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setNoteContent(saved);
        noteContentRef.current = saved;
      } else {
        setNoteContent('');
        noteContentRef.current = '';
      }
      setLastSaved(null);
    } catch {
      // LocalStorage access error
    }
  }, [storageKey]);

  // Flush debounced save to prevent data loss on close/unmount
  const flushSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    try {
      localStorage.setItem(storageKey, noteContentRef.current);
      const now = new Date();
      setLastSaved(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch {
      // Storage quota or privacy mode
    }
  }, [storageKey]);

  useEffect(() => {
    return () => {
      // Flush on unmount
      flushSave();
    };
  }, [flushSave]);

  // Handle content edits with 400ms debounce
  const handleContentChange = (val: string) => {
    setNoteContent(val);
    noteContentRef.current = val;

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

  const handleClose = useCallback(() => {
    flushSave();
    onClose();
    triggerRef?.current?.focus();
  }, [flushSave, onClose, triggerRef]);

  // Keyboard navigation & Esc handling
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showConfirmClear) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showConfirmClear, handleClose]);

  // Insert template and refocus textarea
  const handleInsertTemplate = (template: string) => {
    const nextVal = noteContent ? `${noteContent.trimEnd()}\n${template}` : template;
    handleContentChange(nextVal);
    toast.success(lang === 'VI' ? 'Đã thêm gợi ý vào sổ tay' : 'Template added to notebook');

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextVal.length, nextVal.length);
      }
    }, 50);
  };

  // Copy notes to clipboard
  const handleCopyNotes = () => {
    if (!noteContent.trim()) {
      toast(lang === 'VI' ? 'Sổ tay chưa có nội dung' : 'No notes to copy', {
        icon: '📋',
      });
      return;
    }
    navigator.clipboard.writeText(noteContent);
    setIsCopied(true);
    toast.success(lang === 'VI' ? 'Đã sao chép sổ tay trinh sát!' : 'Field notes copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Execute notes deletion
  const executeClearNotes = () => {
    setNoteContent('');
    noteContentRef.current = '';
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setLastSaved(null);
    setShowConfirmClear(false);
    toast.success(lang === 'VI' ? 'Đã tiêu hủy toàn bộ ghi chép' : 'Field notes discarded');
    textareaRef.current?.focus();
  };

  const lineCount = noteContent ? noteContent.split('\n').length : 0;
  const charCount = noteContent.length;

  return (
    <>
      {/* ================= PHYSICAL LEATHER NOTEBOOK TRIGGER ================= */}
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
                ? 'bg-noir-leatherDark text-noir-parchment border-noir-borderDark shadow-inner'
                : 'bg-gradient-to-br from-[#54331C] via-[#633E26] to-[#3B2212] text-[#EDE3C9] border-[#7A4F32] hover:border-noir-brass shadow-noir-card hover:-translate-y-0.5'
            }`}
            title={
              lang === 'VI'
                ? `Sổ tay da trinh sát (${lineCount} dòng ghi chú - Phím 4)`
                : `Leather Field Notebook (${lineCount} lines - Key 4)`
            }
            aria-label={
              lang === 'VI'
                ? `Mở sổ tay hiện trường. Đang có ${lineCount} dòng ghi chú.`
                : `Open investigation notebook. Contains ${lineCount} lines.`
            }
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            {/* Stitched Edge Detail & Brass Corners */}
            <div className="relative flex items-center justify-center">
              {isOpen ? (
                <BookOpen className="w-4 h-4 text-noir-brassLight" aria-hidden="true" />
              ) : (
                <Book className="w-4 h-4 text-noir-brass" aria-hidden="true" />
              )}
              <PenTool className="w-2.5 h-2.5 text-noir-brassLight/80 absolute -bottom-1 -right-1" aria-hidden="true" />
            </div>

            {variant === 'full' && (
              <span className="text-xs font-typewriter font-bold tracking-tight">
                {lang === 'VI' ? 'Sổ Tay' : 'Notes'}
              </span>
            )}

            {/* Ribbon Bookmark Detail */}
            <div className="absolute top-0 right-2 w-1.5 h-2.5 bg-noir-blood rounded-b-xs shadow-xs" />

            {/* Line Count Badge */}
            {lineCount > 0 && (
              <span
                className={`${
                  variant === 'full' ? 'ml-auto' : 'absolute -top-1.5 -right-1.5'
                } min-w-[18px] h-[18px] px-1 rounded-full bg-noir-brassDark text-noir-parchment font-mono text-xs font-bold flex items-center justify-center border border-noir-paperLight shadow-xs`}
                title={lang === 'VI' ? `${lineCount} dòng ghi chú` : `${lineCount} lines`}
              >
                {lineCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ================= OPEN 3D LEATHER NOTEBOOK DIALOG ================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          <button
            type="button"
            tabIndex={-1}
            aria-label={lang === 'VI' ? 'Đóng sổ tay' : 'Close notebook'}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] cursor-default w-full h-full border-0 p-0 m-0"
            onClick={handleClose}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notebook-dialog-title"
            ref={dialogRef}
            className={`relative z-10 w-full max-w-2xl bg-[#54331C] border-4 border-[#351E0E] rounded-[10px] shadow-noir-modal overflow-hidden flex flex-col max-h-[92vh] transition-all duration-300 ${
              reducedMotion
                ? 'animate-none'
                : 'animate-[fadeIn_0.25s_ease-out] [perspective:1200px]'
            }`}
          >
            {/* Outer Leather Frame Header */}
            <div className="bg-gradient-to-r from-[#3B2212] via-[#54331C] to-[#3B2212] px-4 py-2.5 border-b-2 border-[#2B180B] flex items-center justify-between gap-3 text-noir-parchment shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-sm bg-[#2B180B] border border-amber-600/40 flex items-center justify-center text-noir-brassLight shadow-inner shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="notebook-dialog-title"
                    className="font-serif font-black text-sm sm:text-base text-noir-parchment tracking-wide uppercase truncate"
                  >
                    {lang === 'VI' ? 'Sổ Tay Trinh Sát Hiện Trường' : 'Investigation Field Logbook'}
                  </h2>
                  <p className="text-xs font-mono text-[#D5C2A5] truncate">
                    {lineCount} {lang === 'VI' ? 'dòng' : lineCount === 1 ? 'line' : 'lines'} • {charCount} {lang === 'VI' ? 'ký tự' : 'characters'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Copy, Clear, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                {lastSaved && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    <Save className="w-3 h-3" />
                    <span>{lang === 'VI' ? `Đã lưu ${lastSaved}` : `Saved ${lastSaved}`}</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleCopyNotes}
                  className="px-2.5 py-1 rounded-[3px] bg-[#3B2212] hover:bg-[#2B180B] text-[#EDE3C9] border border-[#7A4F32] text-xs font-typewriter flex items-center gap-1 transition-colors min-h-[36px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassLight"
                  title={lang === 'VI' ? 'Sao chép toàn bộ sổ tay' : 'Copy notes'}
                  aria-label={lang === 'VI' ? 'Sao chép ghi chú' : 'Copy notes'}
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isCopied ? (lang === 'VI' ? 'Đã chép' : 'Copied') : (lang === 'VI' ? 'Sao chép' : 'Copy')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmClear(true)}
                  disabled={!noteContent.trim()}
                  className="p-1.5 rounded-[3px] bg-[#3B2212] hover:bg-noir-blood text-[#EDE3C9] border border-[#7A4F32] hover:border-noir-blood transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:hover:bg-[#3B2212] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-blood"
                  title={lang === 'VI' ? 'Tiêu hủy sổ tay' : 'Discard notes'}
                  aria-label={lang === 'VI' ? 'Tiêu hủy sổ tay' : 'Discard notes'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-[3px] bg-[#2B180B] hover:bg-white/10 text-noir-parchment border border-[#52321A] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassLight ml-1"
                  title={lang === 'VI' ? 'Gấp sổ lại (Esc)' : 'Close notebook (Esc)'}
                  aria-label={lang === 'VI' ? 'Đóng sổ tay' : 'Close notebook'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Deduction Template Toolbar */}
            <div className="bg-[#FAF3E0] px-4 py-2 border-b border-noir-borderDark flex items-center gap-1.5 flex-wrap shrink-0">
              <span className="text-xs font-typewriter uppercase text-noir-ink font-bold flex items-center gap-1 mr-1">
                <PlusCircle className="w-3.5 h-3.5 text-noir-candleDark" />
                <span>{lang === 'VI' ? 'Mẫu trinh sát:' : 'Templates:'}</span>
              </span>

              <button
                type="button"
                onClick={() =>
                  handleInsertTemplate(
                    lang === 'VI' ? '[ ] Nghi phạm mục tiêu: ' : '[ ] Target suspect: '
                  )
                }
                className="text-xs font-typewriter px-2.5 py-1 rounded-[3px] bg-noir-card hover:bg-noir-cardHover border border-noir-borderDark text-noir-ink transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassDark"
                aria-label={lang === 'VI' ? 'Chèn mẫu nghi phạm' : 'Insert suspect template'}
              >
                <Shield className="w-3.5 h-3.5 text-noir-blood" />
                <span>{lang === 'VI' ? '+ Nghi phạm' : '+ Suspect'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleInsertTemplate(
                    lang === 'VI' ? '[✓] Manh mối xác thực: ' : '[✓] Verified clue: '
                  )
                }
                className="text-xs font-typewriter px-2.5 py-1 rounded-[3px] bg-noir-card hover:bg-noir-cardHover border border-noir-borderDark text-noir-ink transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassDark"
                aria-label={lang === 'VI' ? 'Chèn mẫu manh mối' : 'Insert clue template'}
              >
                <FileText className="w-3.5 h-3.5 text-noir-stamp" />
                <span>{lang === 'VI' ? '+ Manh mối' : '+ Clue'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleInsertTemplate(
                    lang === 'VI' ? '[✗] Loại trừ ngoại phạm: ' : '[✗] Ruled out (Alibi): '
                  )
                }
                className="text-xs font-typewriter px-2.5 py-1 rounded-[3px] bg-noir-card hover:bg-noir-cardHover border border-noir-borderDark text-noir-ink transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassDark"
                aria-label={lang === 'VI' ? 'Chèn mẫu loại trừ ngoại phạm' : 'Insert rule-out template'}
              >
                <X className="w-3.5 h-3.5 text-noir-blood" />
                <span>{lang === 'VI' ? '+ Loại trừ' : '+ Rule out'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  handleInsertTemplate(
                    lang === 'VI' ? `[🕒 ${time}] Mốc giờ: ` : `[🕒 ${time}] Timestamp: `
                  );
                }}
                className="text-xs font-typewriter px-2.5 py-1 rounded-[3px] bg-noir-card hover:bg-noir-cardHover border border-noir-borderDark text-noir-ink transition-colors flex items-center gap-1 min-h-[34px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassDark"
                aria-label={lang === 'VI' ? 'Chèn mốc thời gian' : 'Insert timestamp'}
              >
                <Clock className="w-3.5 h-3.5 text-noir-candleDark" />
                <span>{lang === 'VI' ? '+ Mốc giờ' : '+ Timestamp'}</span>
              </button>
            </div>

            {/* Inside Lined Paper Notepad Area (Patrick Hand 18px aligned to 28px ruled lines) */}
            <div className="flex-1 p-4 sm:p-6 bg-[#FCF9F2] relative overflow-hidden flex flex-col">
              {/* Ruled Notebook Paper Background aligned to 28px line-height */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={noteContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={
                    lang === 'VI'
                      ? `Sổ tay trinh sát hiện trường (hỗ trợ tiếng Việt Ể Ạ Ặ Ủ Ữ Ộ):
- Ghi lại các nghi phạm, ID, biển số và manh mối thu thập được
- Phác thảo ý tưởng mệnh đề SQL cho câu lệnh tiếp theo...`
                      : `Field investigation notebook:
- Note down suspects, IDs, license plates, and verified clues
- Sketch SQL query structures for your next deduction...`
                  }
                  aria-label={
                    lang === 'VI'
                      ? 'Nội dung sổ tay ghi chép hiện trường'
                      : 'Field investigation logbook content'
                  }
                  className="w-full h-full min-h-[280px] bg-transparent border-0 focus:ring-0 focus:outline-none font-handwriting text-[18px] text-noir-ink placeholder:text-noir-inkFaint leading-[28px] resize-none selection:bg-noir-candle/30"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 27px, #E5D9BC 28px)',
                    backgroundAttachment: 'local',
                    backgroundPosition: '0 4px',
                    lineHeight: '28px',
                  }}
                  spellCheck={false}
                />
              </div>

              {/* Red Margin Line on the left */}
              <div
                className="absolute top-0 bottom-0 left-6 sm:left-8 w-px bg-red-400/50 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* Notebook Bottom Docket Footer */}
            <div className="bg-[#EDE3C9] px-4 py-2 border-t-2 border-noir-borderDark flex items-center justify-between text-xs font-typewriter text-noir-inkMuted shrink-0">
              <span className="flex items-center gap-1.5">
                <CornerDownRight className="w-3.5 h-3.5 text-noir-stamp" />
                <span>
                  {lang === 'VI'
                    ? 'Tự động lưu vào bộ nhớ trình duyệt • Đóng sổ không mất dữ liệu'
                    : 'Auto-saved to local browser storage • Closed without data loss'}
                </span>
              </span>
              <span className="font-bold text-noir-leatherDark">
                {lang === 'VI' ? 'SỔ TAY CÁ NHÂN' : 'FIELD DOCKET'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Notes */}
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
    </>
  );
};
