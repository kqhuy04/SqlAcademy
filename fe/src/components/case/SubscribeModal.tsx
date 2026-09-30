import React, { useState } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Award, Zap, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi } from '@/api/payment.api';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
  onSuccess: _onSuccess,
}) => {
  const { lang } = useLanguageStore();
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      const res = await paymentApi.createCheckout('VNPAY');
      if (res.paymentUrl) {
        toast.success(lang === 'VI' ? 'Đang chuyển hướng đến cổng thanh toán bảo mật...' : 'Redirecting to secure payment gateway...');
        window.location.href = res.paymentUrl;
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (lang === 'VI' ? 'Không thể khởi tạo lệnh thanh toán. Vui lòng kiểm tra cấu hình cổng thanh toán.' : 'Failed to generate payment order. Please ensure payment gateway is configured.');
      toast.error(msg);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'VI' ? 'LỆNH CẤP QUYỀN ĐIỀU TRA VIÊN ĐẶC BIỆT' : 'SPECIAL INVESTIGATOR CLEARANCE WARRANT'}
      subtitle={
        lang === 'VI'
          ? 'Mở khóa toàn quyền truy cập hồ sơ vụ án tối mật và cơ sở dữ liệu pháp y hình sự'
          : 'Unlock full access to classified case archives and forensic databases'
      }
      maxWidth="lg"
    >
      <div className="space-y-5">
        <div className="bg-noir-card border-2 border-dashed border-noir-borderDark rounded-[3px] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-typewriter font-bold text-noir-blood uppercase tracking-wider">
            <Lock className="w-4 h-4 text-noir-blood" />
            <span>
              {lang === 'VI'
                ? 'Đặc quyền được phê chuẩn theo Lệnh Cấp Quyền Đặc Biệt:'
                : 'Privileges Granted Under Special Clearance:'}
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-noir-ink leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-noir-stamp shrink-0 mt-0.5" />
              <span>
                {lang === 'VI'
                  ? 'Quyền truy cập trực tiếp 10 cơ sở dữ liệu pháp y hình sự thực tế.'
                  : 'Direct clearance to 10 live criminal forensics databases.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-noir-blood shrink-0 mt-0.5" />
              <span>
                {lang === 'VI'
                  ? 'Thực thi không giới hạn các lệnh truy vấn SQL trên trạm điều tra chuyên sâu.'
                  : 'Unlimited SQL query executions across forensic investigation terminals.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Award className="w-4 h-4 text-noir-candleDark shrink-0 mt-0.5" />
              <span>
                {lang === 'VI'
                  ? 'Ghi danh nhận đầy đủ huy hiệu vinh danh và thăng quân hàm trên Bảng Vàng Danh Dự.'
                  : 'Earn all official Commendation badges and rank on the Detective Roll of Honor.'}
              </span>
            </li>
          </ul>
        </div>

        <div className="border-t-2 border-noir-borderDark/60 pt-4 flex flex-col-reverse sm:flex-row gap-3 justify-end items-stretch sm:items-center">
          <Button variant="secondary" onClick={onClose} disabled={isSubscribing} className="w-full sm:w-auto">
            {lang === 'VI' ? 'Hủy Bỏ' : 'Cancel'}
          </Button>
          <Button
            variant="gold"
            isLoading={isSubscribing}
            onClick={handleSubscribe}
            leftIcon={<Award className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {lang === 'VI' ? 'Kích Hoạt Quyền Hạn' : 'Issue Clearance Warrant'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
