import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth.api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { StampBadge } from '@/components/ui/StampBadge';
import { useLanguageStore } from '@/store/languageStore';
import { Shield, Lock, User as UserIcon, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { lang } = useLanguageStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // Reset password modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      newErrors.username = lang === 'VI' ? 'Mã định danh đặc vụ không được để trống' : 'Agent codename cannot be blank';
    } else if (username.length < 5 || username.length > 30) {
      newErrors.username = lang === 'VI' ? 'Mã định danh đặc vụ phải từ 5 đến 30 ký tự' : 'Agent codename must be 5 to 30 characters';
    }

    if (!password) {
      newErrors.password = lang === 'VI' ? 'Mật khẩu bảo mật không được để trống' : 'Investigation passphrase cannot be blank';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await login({ username, password });
      toast.success(
        lang === 'VI'
          ? 'Xác thực thành công. Chào mừng trở lại bàn làm việc!'
          : 'Authentication verified. Welcome back to the investigation desk!'
      );
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/cases';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string> } } })?.response?.data;
      const msg =
        data?.message ||
        (data?.errors ? Object.values(data.errors)[0] : undefined) ||
        (lang === 'VI'
          ? 'Thông tin đăng nhập không khớp với hồ sơ lưu trữ'
          : 'Agent credentials do not match bureau records');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      toast.error(lang === 'VI' ? 'Vui lòng cung cấp địa chỉ email hợp lệ' : 'Please provide a valid email address');
      return;
    }

    try {
      setIsResetting(true);
      const res = await authApi.forgotPassword({ email: resetEmail });
      toast.success(
        res.message ||
          (lang === 'VI'
            ? 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư!'
            : 'If your email exists, reset instructions have been dispatched to it!')
      );
      setShowResetModal(false);
      setResetEmail('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (lang === 'VI'
          ? 'Không tìm thấy hồ sơ nào khớp với địa chỉ email này'
          : 'No matching bureau profile found for this email address');
      toast.error(msg);
    } finally {
      setIsResetting(false);
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
              {lang === 'VI' ? 'HỒ SƠ MẬT' : 'CLASSIFIED DOSSIER'}
            </StampBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-noir-ink uppercase">
            {lang === 'VI' ? 'XÁC THỰC DANH TÍNH' : 'IDENTIFICATION CHECK'}
          </h1>
          <p className="text-[10px] font-typewriter text-noir-inkMuted mt-1 uppercase tracking-widest font-bold">
            SQL DETECTIVE NOIR • {lang === 'VI' ? 'ĐIỀU TRA HÌNH SỰ' : 'FORENSIC INVESTIGATION'}
          </p>
        </div>

        {/* Login Docket Card */}
        <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 sm:p-8 shadow-noir-lift relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-noir-blood" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={lang === 'VI' ? 'Mã Định Danh Đặc Vụ (Tên Đăng Nhập)' : 'Agent Codename (Username)'}
              placeholder={lang === 'VI' ? 'ví dụ: detective_cole' : 'e.g. detective_cole'}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors({ ...errors, username: undefined });
              }}
              error={errors.username}
              leftIcon={<UserIcon className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <Input
              label={lang === 'VI' ? 'Mật Khẩu Bảo Mật' : 'Security Passphrase'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide security passphrase' : 'Show security passphrase'}
                  className="hover:text-noir-blood text-noir-inkMuted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-noir-blood rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              }
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-xs pt-1 font-serif">
              <span className="text-noir-inkMuted italic">
                {lang === 'VI' ? 'Mức độ bảo mật cấp 3' : 'Security clearance level 3'}
              </span>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-noir-blood hover:text-noir-bloodDark font-semibold italic underline"
              >
                {lang === 'VI' ? 'Quên mật khẩu?' : 'Lost credentials?'}
              </button>
            </div>

            <Button
              type="submit"
              variant="gold"
              isLoading={isLoading}
              className="w-full mt-2 shadow-noir-card"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {lang === 'VI' ? 'Vào Trụ Sở Làm Việc' : 'Enter Headquarters'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-noir-borderDark/70 w-full"></div>
            <div className="bg-noir-paper px-3 text-[10.5px] font-typewriter uppercase tracking-wider text-noir-inkMuted shrink-0">
              {lang === 'VI' ? 'Hoặc đăng nhập với' : 'Or continue with'}
            </div>
          </div>

          {/* Google Sign In */}
          <GoogleAuthButton mode="login" />

          {/* Register Link */}
          <div className="mt-6 pt-4 border-t-2 border-noir-borderDark/60 text-center text-xs font-serif text-noir-inkMuted">
            {lang === 'VI' ? 'Chưa có tài khoản?' : "Don't have an account?"}{' '}
            <Link
              to="/register"
              className="text-noir-blood hover:underline font-bold font-typewriter"
            >
              {lang === 'VI' ? 'Đăng Ký Ngay' : 'Register Now'}
            </Link>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={lang === 'VI' ? 'KHÔI PHỤC MẬT KHẨU BẢO MẬT' : 'RECOVER SECURITY PASSPHRASE'}
        subtitle={
          lang === 'VI'
            ? 'Mã tạm thời sẽ được gửi tới email đăng ký của bạn'
            : 'A temporary code will be dispatched to your registered bureau email'
        }
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label={lang === 'VI' ? 'Email Đăng Ký Trụ Sở' : 'Bureau Dispatch Email'}
            type="email"
            placeholder="detective@bureau.gov"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
            required
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowResetModal(false)}
              disabled={isResetting}
            >
              {lang === 'VI' ? 'Đóng' : 'Close'}
            </Button>
            <Button
              type="submit"
              variant="gold"
              isLoading={isResetting}
            >
              {lang === 'VI' ? 'Gửi Mã Xác Nhận' : 'Dispatch Code'}
            </Button>
          </div>
        </form>
      </Modal>
    </AnimatedPage>
  );
};
