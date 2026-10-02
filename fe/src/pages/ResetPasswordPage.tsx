import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { StampBadge } from '@/components/ui/StampBadge';
import { useLanguageStore } from '@/store/languageStore';
import { Shield, KeyRound, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const { lang } = useLanguageStore();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ token?: string; password?: string; confirm?: string }>({});

  const navigate = useNavigate();

  // Pattern matching BE validation: ^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

  const validate = () => {
    const errs: { token?: string; password?: string; confirm?: string } = {};

    if (!token.trim()) {
      errs.token =
        lang === 'VI'
          ? 'Mã token đặt lại là bắt buộc (kiểm tra liên kết trong email)'
          : 'Reset token is required (check the link in your email)';
    } else if (token.trim().length < 12) {
      errs.token =
        lang === 'VI'
          ? 'Định dạng token không hợp lệ (tối thiểu 12 ký tự)'
          : 'Token format is invalid (minimum 12 characters)';
    }

    if (!newPassword) {
      errs.password =
        lang === 'VI' ? 'Mật khẩu mới không được để trống' : 'New passphrase cannot be blank';
    } else if (!passwordRegex.test(newPassword)) {
      errs.password =
        lang === 'VI'
          ? 'Phải có ít nhất 8 ký tự, 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt'
          : 'Must have at least 8 characters, 1 uppercase letter, 1 number, and 1 special symbol';
    }

    if (newPassword !== confirmPassword) {
      errs.confirm =
        lang === 'VI'
          ? 'Mật khẩu xác nhận không trùng khớp'
          : 'Passphrase confirmation does not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const res = await authApi.resetPassword({
        token: token.trim(),
        newPassword,
      });
      toast.success(
        res.message ||
          (lang === 'VI'
            ? 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.'
            : 'Passphrase successfully reset! You can now authenticate.')
      );
      navigate('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (lang === 'VI'
          ? 'Mã token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.'
          : 'Reset token is invalid or has expired. Please request a new link.');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-noir-parchment relative selection:bg-noir-blood selection:text-noir-parchment">
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-[3px] bg-noir-card border-2 border-noir-borderDark p-0.5 shadow-noir-card group-hover:border-noir-blood transition-colors flex items-center justify-center">
              <div className="w-full h-full bg-noir-paper rounded-[2px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-noir-blood" />
              </div>
            </div>
          </Link>
          <div className="mb-2">
            <StampBadge variant="blood" size="sm" rotation={0}>
              {lang === 'VI' ? 'CÔNG VĂN MẬT' : 'RESTRICTED DISPATCH'}
            </StampBadge>
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-noir-ink uppercase">
            {lang === 'VI' ? 'KHÔI PHỤC MẬT KHẨU' : 'RE-ESTABLISH CREDENTIALS'}
          </h1>
          <p className="text-xs font-serif italic text-noir-inkMuted mt-1">
            SQL Detective Noir • {lang === 'VI' ? 'Hồ Sơ Cấp Lại Mật Khẩu' : 'Passphrase Restoration Docket'}
          </p>
        </div>

        {/* Dossier Card Form */}
        <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 shadow-noir-card relative">
          <div className="absolute top-0 right-0 left-0 h-1 bg-noir-blood" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Token Input */}
            <Input
              label={lang === 'VI' ? 'MÃ TOKEN KHÔI PHỤC' : 'DISPATCH RECOVERY TOKEN'}
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (errors.token) setErrors((prev) => ({ ...prev, token: undefined }));
              }}
              placeholder={lang === 'VI' ? 'Dán mã token từ liên kết email nếu chưa có' : 'Paste token from email link if missing'}
              error={errors.token}
              leftIcon={<KeyRound className="w-4 h-4 text-noir-inkMuted" />}
              required
            />

            {/* New Password Input */}
            <div className="relative">
              <Input
                label={lang === 'VI' ? 'MẬT KHẨU MỚI' : 'NEW PASSPHRASE'}
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder={lang === 'VI' ? 'Tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt' : 'At least 8 chars, 1 uppercase, 1 digit, 1 symbol'}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4 text-noir-inkMuted" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-noir-inkMuted hover:text-noir-ink transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <Input
              label={lang === 'VI' ? 'XÁC NHẬN MẬT KHẨU' : 'CONFIRM PASSPHRASE'}
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
              }}
              placeholder={lang === 'VI' ? 'Nhập lại mật khẩu mới' : 'Repeat new passphrase'}
              error={errors.confirm}
              leftIcon={<Lock className="w-4 h-4 text-noir-inkMuted" />}
              required
            />

            <div className="p-3 bg-[#FAF6EC] border border-noir-borderDark/60 rounded text-[11px] text-noir-inkMuted font-mono space-y-1">
              <span className="font-bold text-noir-blood font-typewriter">
                {lang === 'VI' ? 'TIÊU CHUẨN BẢO MẬT:' : 'SECURITY REQUIREMENTS:'}
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>{lang === 'VI' ? 'Tối thiểu 8 ký tự' : 'Minimum 8 characters'}</li>
                <li>{lang === 'VI' ? 'Ít nhất 1 chữ in hoa (A-Z)' : 'At least 1 uppercase letter (A-Z)'}</li>
                <li>{lang === 'VI' ? 'Ít nhất 1 chữ số (0-9)' : 'At least 1 numerical digit (0-9)'}</li>
                <li>{lang === 'VI' ? 'Ít nhất 1 ký tự đặc biệt (@, $, !, %, *, #...)' : 'At least 1 special character (@, $, !, %, *, #...)'}</li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {lang === 'VI' ? 'Cập Nhật Mật Khẩu' : 'Update Passphrase'}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-noir-borderDark/50 text-center">
            <Link
              to="/login"
              className="text-xs font-typewriter text-noir-blood hover:text-noir-bloodDark font-bold hover:underline"
            >
              {lang === 'VI' ? 'Quay lại trang Đăng Nhập' : 'Back to Bureau Identification (Login)'}
            </Link>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};
