import React, { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  X,
  Volume2,
  Radio,
} from 'lucide-react';

export interface DeskTelephoneProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  hasHint1?: boolean;
  hasHint2?: boolean;
  hasHint3?: boolean;
  hint1?: string | null;
  hint2?: string | null;
  hint3?: string | null;
  revealedHints: number[];
  onRevealHint: (hintNumber: number) => Promise<void> | void;
  isUnlocking?: boolean;
  reducedMotion?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  variant?: 'full' | 'compact' | 'dialog-only';
  className?: string;
}

export const DeskTelephone: React.FC<DeskTelephoneProps> = ({
  isOpen,
  onOpen,
  onClose,
  hasHint1,
  hasHint2,
  hasHint3,
  hint1,
  hint2,
  hint3,
  revealedHints,
  onRevealHint,
  isUnlocking = false,
  reducedMotion = false,
  triggerRef,
  variant = 'full',
  className = '',
}) => {
  const { lang } = useLanguageStore();

  const hints = [
    {
      number: 1,
      available: hasHint1 ?? Boolean(hint1),
      text: hint1,
      title: lang === 'VI' ? 'Đầu Mối 1: Bảng & Cột Trọng Tâm' : 'Clue 1: Target Tables & Columns',
      summary: lang === 'VI' ? 'Tài liệu nghiệp vụ trinh sát' : 'Forensic case dossiers',
    },
    {
      number: 2,
      available: hasHint2 ?? Boolean(hint2),
      text: hint2,
      title: lang === 'VI' ? 'Đầu Mối 2: Điều Kiện Lọc & Đối Soát' : 'Clue 2: Filter & Matching Rules',
      summary: lang === 'VI' ? 'Quy tắc khoanh vùng đối tượng' : 'Suspect boundary criteria',
    },
    {
      number: 3,
      available: hasHint3 ?? Boolean(hint3),
      text: hint3,
      title: lang === 'VI' ? 'Đầu Mối 3: Cấu Trúc Lệnh Truy Vấn' : 'Clue 3: Query Architecture Blueprint',
      summary: lang === 'VI' ? 'Hướng dẫn mệnh đề SQL quyết định' : 'Final SQL structure guide',
    },
  ].filter((h) => h.available);

  const lockedHints = hints.filter((h) => !revealedHints.includes(h.number));
  const remainingLockedCount = lockedHints.length;

  // Track cosmetic typing animation for newly revealed hints (max 800ms)
  const [animatingHintNumbers, setAnimatingHintNumbers] = useState<number[]>([]);
  const prevRevealedCountRef = useRef<number>(revealedHints.length);
  const [unlockError, setUnlockError] = useState<{ hintNumber: number; message: string } | null>(null);

  // Focus trap ref
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Idle phone ring / vibrate pulse every ~10s when >= 1 hint is locked and !reducedMotion
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (reducedMotion || remainingLockedCount === 0 || isOpen) {
      setIsRinging(false);
      return;
    }

    const ringInterval = setInterval(() => {
      setIsRinging(true);
      const stopTimer = setTimeout(() => {
        setIsRinging(false);
      }, 1200);
      return () => clearTimeout(stopTimer);
    }, 10000);

    return () => clearInterval(ringInterval);
  }, [reducedMotion, remainingLockedCount, isOpen]);

  // Check when a hint was newly unlocked to trigger cosmetic typing indicator
  useEffect(() => {
    if (revealedHints.length > prevRevealedCountRef.current) {
      // Find the newly unlocked hint
      const newlyUnlocked = revealedHints[revealedHints.length - 1];
      if (newlyUnlocked) {
        setAnimatingHintNumbers((prev) => [...prev, newlyUnlocked]);
        const timer = setTimeout(() => {
          setAnimatingHintNumbers((prev) => prev.filter((n) => n !== newlyUnlocked));
        }, 750);
        return () => clearTimeout(timer);
      }
    }
    prevRevealedCountRef.current = revealedHints.length;
  }, [revealedHints]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        triggerRef?.current?.focus();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleUnlockClick = async (hintNum: number) => {
    setUnlockError(null);
    try {
      await onRevealHint(hintNum);
    } catch (err: unknown) {
      setUnlockError({
        hintNumber: hintNum,
        message:
          lang === 'VI'
            ? 'Mất tín hiệu liên lạc bảo mật! Vui lòng thử lại.'
            : 'Confidential line interrupted! Please try again.',
      });
    }
  };

  return (
    <>
      {/* ================= PHYSICAL DESK TELEPHONE TRIGGER ================= */}
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
                : 'bg-gradient-to-b from-[#2C241E] to-[#1A1612] text-[#E5D9BC] border-[#4A3E30] hover:border-noir-brass shadow-noir-card hover:-translate-y-0.5'
            }`}
            title={
              lang === 'VI'
                ? `Điện thoại thám tử (${remainingLockedCount} manh mối chưa mở - Phím 3)`
                : `Detective Telephone (${remainingLockedCount} clues locked - Key 3)`
            }
            aria-label={
              lang === 'VI'
                ? `Mở điện thoại chỉ điểm. Còn ${remainingLockedCount} manh mối.`
                : `Open informant telephone. ${remainingLockedCount} clues locked.`
            }
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            {/* Handset Icon & Rotary Plate with Shake Animation */}
            <div
              className={`relative flex items-center justify-center transition-transform ${
                isRinging && !reducedMotion ? 'animate-[bounce_0.35s_infinite]' : ''
              }`}
            >
              {isOpen ? (
                <PhoneOff className="w-4 h-4 text-noir-blood" aria-hidden="true" />
              ) : isRinging ? (
                <PhoneCall className="w-4 h-4 text-noir-candleLight animate-pulse" aria-hidden="true" />
              ) : (
                <Phone className="w-4 h-4 text-noir-brass" aria-hidden="true" />
              )}
            </div>

            {variant === 'full' && (
              <span className="text-xs font-typewriter font-bold tracking-tight">
                {lang === 'VI' ? 'Gợi Ý' : 'Hints'}
              </span>
            )}

            {/* Remaining Locked Hints Badge */}
            {remainingLockedCount > 0 ? (
              <span
                className={`${
                  variant === 'full' ? 'ml-auto' : 'absolute -top-1.5 -right-1.5'
                } min-w-[18px] h-[18px] px-1 rounded-full bg-noir-blood text-noir-parchment font-typewriter text-xs font-bold flex items-center justify-center border border-noir-paperLight shadow-xs`}
                title={
                  lang === 'VI'
                    ? `Còn ${remainingLockedCount} gợi ý chưa mở`
                    : `${remainingLockedCount} locked hints remaining`
                }
              >
                {remainingLockedCount}
              </span>
            ) : (
              <span
                className={`${
                  variant === 'full' ? 'ml-auto' : 'absolute -top-1.5 -right-1.5'
                } w-[18px] h-[18px] rounded-full bg-noir-stamp text-noir-parchment flex items-center justify-center border border-noir-paperLight shadow-xs`}
                title={lang === 'VI' ? 'Đã mở tất cả gợi ý' : 'All hints unlocked'}
              >
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            )}
          </button>
        </div>
      )}

      {/* ================= SECURE INFORMANT DIRECT LINE DIALOG ================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <button
            type="button"
            tabIndex={-1}
            aria-label={lang === 'VI' ? 'Đóng đường dây liên lạc' : 'Close telephone line'}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] cursor-default w-full h-full border-0 p-0 m-0"
            onClick={() => {
              onClose();
              triggerRef?.current?.focus();
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="telephone-dialog-title"
            ref={dialogRef}
            className={`relative z-10 w-full max-w-lg bg-noir-paper border-2 border-noir-borderDark rounded-[6px] shadow-noir-modal overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ${
              reducedMotion ? 'animate-none' : 'animate-fadeIn'
            }`}
          >
            {/* Telephone Top Bar / Handset Receiver Header */}
            <div className="bg-gradient-to-r from-[#221C16] via-[#332A22] to-[#221C16] text-[#FAF6EC] px-4 py-3 border-b-2 border-noir-borderDark flex items-center justify-between gap-3 shadow-md shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#18130E] border-2 border-noir-brass/80 flex items-center justify-center shrink-0 shadow-inner">
                  <Radio className="w-4 h-4 text-noir-brassLight animate-pulse" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      id="telephone-dialog-title"
                      className="font-serif font-black text-sm sm:text-base text-noir-parchment tracking-wide uppercase truncate"
                    >
                      {lang === 'VI' ? 'Người Chỉ Điểm Mật' : 'The Informant'}
                    </h2>
                    <span className="text-xs font-typewriter uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shrink-0 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {lang === 'VI' ? 'ĐƯỜNG DÂY NÓNG' : 'DIRECT LINE'}
                    </span>
                  </div>
                  <p className="text-xs text-[#C5B49D] font-mono truncate">
                    {lang === 'VI'
                      ? 'Tần số nội bộ 142.85 MHz • Nguồn tin cậy cấp A'
                      : 'Classified freq 142.85 MHz • Tier-A Informant'}
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => {
                  onClose();
                  triggerRef?.current?.focus();
                }}
                className="p-2 rounded-[4px] text-[#D8C7B0] hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-brassLight cursor-pointer"
                title={lang === 'VI' ? 'Gác máy (Esc)' : 'Hang up (Esc)'}
                aria-label={lang === 'VI' ? 'Đóng đường dây liên lạc' : 'Close telephone line'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Conversation Scroll Area */}
            <div
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-[#F5ECD7] to-[#EFE5CD]"
              aria-live="polite"
              aria-atomic="false"
            >
              {/* Informant Introduction Bubble */}
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-[#352B20] text-noir-brassLight flex items-center justify-center shrink-0 border border-[#524434] shadow-xs text-xs font-serif font-bold">
                  I
                </div>
                <div className="bg-[#FAF6EC] border border-noir-borderDark/80 rounded-2xl rounded-tl-sm p-3 shadow-noir-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-serif font-bold text-noir-ink">
                      {lang === 'VI' ? 'Người Chỉ Điểm' : 'The Informant'}
                    </span>
                    <span className="text-xs font-mono text-noir-inkMuted">
                      {lang === 'VI' ? 'Vừa kết nối' : 'Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-noir-ink font-sans leading-relaxed">
                    {lang === 'VI'
                      ? 'Trinh sát đấy à? Tôi vừa thu thập được một vài hồ sơ nội bộ liên quan trực tiếp tới hiện trường này. Mỗi lần giải mật sẽ tính vào chi phí điều tra (−20% điểm thưởng). Hãy chọn đầu mối cần làm sáng tỏ:'
                      : 'Officer? I have intercepted field intelligence directly tied to this case. Each decrypted clue deducts −20% from the case reward. Select which lead you need clarified:'}
                  </p>
                </div>
              </div>

              {/* Progressive Hints List */}
              {hints.map((hint) => {
                const isRevealed = revealedHints.includes(hint.number);
                const isCurrentlyTyping = animatingHintNumbers.includes(hint.number);

                return (
                  <div key={hint.number} className="space-y-2">
                    {/* Clue Container */}
                    <div
                      className={`border-2 rounded-[6px] p-3 transition-all ${
                        isRevealed
                          ? 'bg-[#FAF6EC] border-noir-borderDark shadow-noir-xs'
                          : 'bg-[#EDE3C9] border-dashed border-noir-borderDark/90'
                      }`}
                    >
                      {/* Header of each clue */}
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-1.5 border-b border-noir-borderDark/40">
                        <div className="flex items-center gap-1.5">
                          {isRevealed ? (
                            <span className="w-5 h-5 rounded-full bg-noir-stamp/20 text-noir-stamp flex items-center justify-center shrink-0">
                              <Unlock className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-noir-candleDark/20 text-noir-candleDark flex items-center justify-center shrink-0">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                          <span className="text-xs font-typewriter font-bold text-noir-ink">
                            {hint.title}
                          </span>
                        </div>

                        {/* Status Stamp / Cost Pill */}
                        <div>
                          {isRevealed ? (
                            <span className="text-xs font-typewriter uppercase tracking-wider text-noir-stamp bg-noir-stamp/10 px-2 py-0.5 rounded-[2px] border border-dashed border-noir-stamp font-bold">
                              {lang === 'VI' ? 'ĐÃ GIẢI MẬT' : 'UNSEALED'}
                            </span>
                          ) : (
                            <span className="text-xs font-typewriter font-bold text-noir-blood bg-noir-blood/10 px-2 py-0.5 rounded-[2px] border border-dashed border-noir-blood flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {lang === 'VI' ? '−20% điểm' : '−20% score'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Area */}
                      {isRevealed ? (
                        <div className="pt-2">
                          {isCurrentlyTyping ? (
                            /* Cosmetic Typing Dots Indicator (max 800ms) */
                            <div className="flex items-center gap-2 py-3 px-3 bg-[#FAF6EC] rounded text-noir-inkMuted text-xs font-mono">
                              <span className="italic">
                                {lang === 'VI' ? 'Người chỉ điểm đang đọc mã...' : 'Informant decoding intelligence...'}
                              </span>
                              <div className="flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-noir-blood animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-noir-blood animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-noir-blood animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          ) : (
                            /* Unsealed Revealed Clue Bubble */
                            <div className="bg-[#FAF6EC] border border-noir-borderDark/60 rounded p-2.5 text-xs text-noir-ink font-mono leading-relaxed select-text shadow-inner">
                              {hint.text}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Locked Hint Action Button */
                        <div className="pt-2.5 flex items-center justify-between gap-3">
                          <p className="text-xs text-noir-inkMuted font-serif italic truncate">
                            {hint.summary}
                          </p>

                          <button
                            type="button"
                            onClick={() => handleUnlockClick(hint.number)}
                            disabled={isUnlocking}
                            className="px-3 py-1.5 rounded-[3px] bg-noir-blood hover:bg-noir-bloodDark text-noir-parchment font-typewriter text-xs font-bold uppercase transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 min-h-[40px] flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noir-blood"
                            aria-label={
                              lang === 'VI'
                                ? `Mở gợi ý ${hint.number}, trừ 20% điểm thưởng`
                                : `Unlock clue ${hint.number}, deduct 20% score`
                            }
                          >
                            {isUnlocking ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>{lang === 'VI' ? 'Đang giải mã...' : 'Unsealing...'}</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>
                                  {lang === 'VI'
                                    ? `Mở gợi ý ${hint.number} (−20% điểm)`
                                    : `Unlock hint ${hint.number} (−20% score)`}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Unlock Error Bubble with Retry */}
              {unlockError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border-2 border-noir-blood rounded-[4px] shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-noir-blood shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-noir-blood">{unlockError.message}</p>
                    <button
                      type="button"
                      onClick={() => handleUnlockClick(unlockError.hintNumber)}
                      className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-noir-blood text-white font-typewriter text-xs font-bold hover:bg-noir-bloodDark transition-colors min-h-[32px] cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{lang === 'VI' ? 'Gọi lại ngay' : 'Retry call'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Telephone Footer Docket */}
            <div className="bg-[#E5D9BC] px-4 py-2 border-t-2 border-noir-borderDark flex items-center justify-between text-xs font-typewriter text-noir-inkMuted shrink-0">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-noir-candleDark" />
                <span>
                  {lang === 'VI'
                    ? 'Bấm phím Esc hoặc nhấp ngoài để gác máy'
                    : 'Press Esc or click outside to hang up'}
                </span>
              </span>
              <span className="font-bold text-noir-blood">
                {lang === 'VI' ? 'BẢO MẬT TUYỆT ĐỐI' : 'CLASSIFIED COMMS'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
