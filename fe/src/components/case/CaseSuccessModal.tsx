import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLanguageStore } from '@/store/languageStore';
import { Trophy, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CaseSuccessModalProps {
  isOpen: boolean;
  scoreEarned: number;
  hasNextQuestion: boolean;
  badgeName?: string;
  badgeIcon?: string;
  onNextQuestion: () => void;
  onBackToCases: () => void;
  onViewProfile?: () => void;
}

export const CaseSuccessModal: React.FC<CaseSuccessModalProps> = ({
  isOpen,
  scoreEarned,
  hasNextQuestion,
  badgeName,
  badgeIcon,
  onNextQuestion,
  onBackToCases,
  onViewProfile,
}) => {
  const { lang } = useLanguageStore();

  return (
    <Modal
      isOpen={isOpen}
      onClose={hasNextQuestion ? onNextQuestion : onBackToCases}
      showCloseButton={false}
      maxWidth="md"
    >
      <div className="text-center py-2 space-y-5 select-none">
        {/* Success Rubber Stamp Icon */}
        <div className="relative inline-block animate-stamp-impact">
          <div className="w-20 h-20 mx-auto rounded-[3px] bg-noir-stamp/10 border-2 border-dashed border-noir-stamp flex items-center justify-center shadow-sm">
            {hasNextQuestion ? (
              <CheckCircle2 className="w-10 h-10 text-noir-stamp" />
            ) : (
              <Trophy className="w-10 h-10 text-noir-candleDark" />
            )}
          </div>
          {badgeIcon && !hasNextQuestion && (
            <div className="absolute -bottom-2 -right-2 text-3xl filter drop-shadow-md">{badgeIcon}</div>
          )}
        </div>

        <div>
          <div className="inline-block text-[10px] font-typewriter uppercase tracking-widest text-noir-stamp font-bold px-2 py-0.5 border border-dashed border-noir-stamp mb-2 bg-noir-stamp/5">
            {lang === 'VI' ? 'KHEN THƯỞNG VỤ ÁN • ĐÃ XÁC NHẬN' : 'CASE COMMENDATION • CONFIRMED'}
          </div>
          <h2 className="text-xl font-display font-black text-noir-ink tracking-tight uppercase">
            {hasNextQuestion
              ? lang === 'VI'
                ? 'Chứng Cứ Hợp Lệ!'
                : 'Evidence Validated!'
              : lang === 'VI'
              ? 'Phá Án Thành Công — Khép Lại Hồ Sơ!'
              : 'Case Solved — Investigation Concluded!'}
          </h2>
          <p className="text-xs font-serif italic text-noir-inkMuted mt-1 max-w-sm mx-auto leading-relaxed">
            {hasNextQuestion
              ? lang === 'VI'
                ? 'Kết quả truy vấn khớp hoàn toàn với hồ sơ giám định. Tiếp tục điều tra đầu mối tiếp theo.'
                : 'The submitted query results match forensic records. Proceed to interrogating the next lead.'
              : lang === 'VI'
              ? `Xuất sắc! Bạn đã phá giải toàn bộ vụ án và vinh dự nhận huân chương "${badgeName || 'SQL Detective'}".`
              : `Outstanding work! You have cracked the entire case file and earned the "${badgeName || 'SQL Detective'}" commendation.`}
          </p>
        </div>

        {/* Rewards Summary Box */}
        <div className="bg-noir-card border-2 border-noir-borderDark rounded-[3px] p-4 flex items-center justify-center font-typewriter shadow-inner shadow-noir-ink/5">
          <div className="text-center">
            <div className="text-[11px] text-noir-inkMuted font-bold uppercase tracking-wider">
              {lang === 'VI' ? 'ĐIỂM ĐIỀU TRA NHẬN ĐƯỢC' : 'INVESTIGATION SCORE EARNED'}
            </div>
            <div className="text-2xl font-black text-noir-candleDark mt-0.5">+{scoreEarned} ⭐</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {hasNextQuestion ? (
            <Button
              variant="gold"
              className="w-full sm:w-auto"
              onClick={onNextQuestion}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {lang === 'VI' ? 'Câu Hỏi / Đầu Mối Tiếp Theo' : 'Next Question / Lead'}
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={onBackToCases}>
                {lang === 'VI' ? 'Quay Lại Hồ Sơ Vụ Án' : 'Return to Case Files'}
              </Button>
              <Button
                variant="gold"
                onClick={onViewProfile || onBackToCases}
                leftIcon={<Award className="w-4 h-4" />}
              >
                {lang === 'VI' ? 'Xem Hồ Sơ & Huy Hiệu' : 'View Detective Badge'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
