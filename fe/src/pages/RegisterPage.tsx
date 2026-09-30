import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { StampBadge } from '@/components/ui/StampBadge';
import { useLanguageStore } from '@/store/languageStore';
import { Shield, Lock, User as UserIcon, Mail, Check, X, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const { lang } = useLanguageStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, login } = useAuth();
  const navigate = useNavigate();

  // Password rule checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!username.trim()) {
      errs.username = lang === 'VI' ? 'Mã định danh đặc vụ không được để trống' : 'Agent codename cannot be blank';
    } else if (username.length < 5 || username.length > 30) {
      errs.username = lang === 'VI' ? 'Mã định danh đặc vụ phải từ 5 đến 30 ký tự' : 'Agent codename must be 5 to 30 characters';
    }

    if (!email.trim() || !email.includes('@')) {
      errs.email = lang === 'VI' ? 'Vui lòng cung cấp email hợp lệ' : 'Please provide a valid dispatch email';
    }

    if (!password) {
      errs.password = lang === 'VI' ? 'Mật khẩu bảo mật không được để trống' : 'Investigation passphrase cannot be blank';
    } else if (!isPasswordValid) {
      errs.password = lang === 'VI' ? 'Mật khẩu chưa đạt tiêu chuẩn bảo mật' : 'Passphrase does not meet security standards';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = lang === 'VI' ? 'Mật khẩu xác nhận không trùng khớp' : 'Confirmation passphrase does not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await register({ username, email, password });
      toast.success(
        lang === 'VI'
          ? 'Hồ sơ đã được phê duyệt! Đang cấp quyền truy cập...'
          : 'Agent credential approved! Initiating bureau clearance...'
      );

      // Automatic login after successful registration
      try {
        await login({ username, password });
        navigate('/cases');
      } catch {
        navigate('/login');
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string> } } })?.response?.data;
      const msg =
        data?.message ||
        (data?.errors ? Object.values(data.errors)[0] : undefined) ||
        (lang === 'VI'
          ? 'Mã định danh hoặc email đã tồn tại trong hồ sơ'
          : 'Agent codename or email already exists in bureau records');
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
            <StampBadge variant="stamp" size="sm" rotation={0}>
              {lang === 'VI' ? 'HỒ SƠ ĐĂNG KÝ' : 'REGISTRATION DOSSIER'}
            </StampBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-noir-ink uppercase">
            {lang === 'VI' ? 'ĐĂNG KÝ ĐẶC VỤ MỚI' : 'REGISTER NEW AGENT'}
          </h1>
          <p className="text-[10px] font-typewriter text-noir-inkMuted mt-1 uppercase tracking-widest font-bold">
            {lang === 'VI' ? 'ĐĂNG KÝ SQL DETECTIVE NOIR' : 'REGISTER FOR SQL DETECTIVE NOIR'}
          </p>
        </div>

        {/* Register Docket Card */}
        <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 sm:p-8 shadow-noir-lift relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-noir-blood" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={lang === 'VI' ? 'Mã Định Danh Đặc Vụ (5-30 ký tự)' : 'Agent Codename (5-30 chars)'}
              placeholder={lang === 'VI' ? 'ví dụ: sherlock_sql' : 'e.g. sherlock_sql'}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors({ ...errors, username: '' });
              }}
              error={errors.username}
              leftIcon={<UserIcon className="w-4 h-4" />}
              required
            />

            <Input
              label={lang === 'VI' ? 'Email Đăng Ký Trụ Sở' : 'Bureau Dispatch Email'}
              type="email"
              placeholder="detective@bureau.gov"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label={lang === 'VI' ? 'Mật Khẩu Bảo Mật' : 'Security Passphrase'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
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
              required
            />

            {/* Password security checklist */}
            {password.length > 0 && (
              <div className="bg-noir-card/70 border-2 border-dashed border-noir-borderDark rounded-[3px] p-3 space-y-1.5 text-xs font-typewriter">
                <div className="text-[10.5px] font-bold text-noir-ink uppercase tracking-wider mb-1">
                  {lang === 'VI' ? 'Tiêu Chuẩn Bảo Mật Mật Khẩu:' : 'Passphrase Security Standards:'}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-noir-stamp font-bold' : 'text-noir-inkMuted'}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-noir-stamp" /> : <X className="w-3.5 h-3.5" />}
                    <span>{lang === 'VI' ? 'Tối thiểu 8 ký tự' : 'At least 8 chars'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-noir-stamp font-bold' : 'text-noir-inkMuted'}`}>
                    {hasUpperCase ? <Check className="w-3.5 h-3.5 text-noir-stamp" /> : <X className="w-3.5 h-3.5" />}
                    <span>{lang === 'VI' ? '1 chữ cái in hoa' : '1 uppercase letter'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-noir-stamp font-bold' : 'text-noir-inkMuted'}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-noir-stamp" /> : <X className="w-3.5 h-3.5" />}
                    <span>{lang === 'VI' ? '1 chữ số' : '1 numeric digit'}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-noir-stamp font-bold' : 'text-noir-inkMuted'}`}>
                    {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-noir-stamp" /> : <X className="w-3.5 h-3.5" />}
                    <span>{lang === 'VI' ? '1 ký tự đặc biệt' : '1 special symbol'}</span>
                  </div>
                </div>
              </div>
            )}

            <Input
              label={lang === 'VI' ? 'Xác Nhận Mật Khẩu' : 'Confirm Passphrase'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="gold"
              isLoading={isLoading}
              className="w-full mt-3 shadow-noir-card"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {lang === 'VI' ? 'Đăng Ký Tài Khoản' : 'Register Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-noir-borderDark/70 w-full"></div>
            <div className="bg-noir-paper px-3 text-[10.5px] font-typewriter uppercase tracking-wider text-noir-inkMuted shrink-0">
              {lang === 'VI' ? 'Hoặc đăng ký với' : 'Or register with'}
            </div>
          </div>

          {/* Google Sign Up */}
          <GoogleAuthButton mode="register" />

          {/* Login Link */}
          <div className="mt-6 pt-4 border-t-2 border-noir-borderDark/60 text-center text-xs font-serif text-noir-inkMuted">
            {lang === 'VI' ? 'Đã có tài khoản?' : 'Already have an account?'}{' '}
            <Link
              to="/login"
              className="text-noir-blood hover:underline font-bold font-typewriter"
            >
              {lang === 'VI' ? 'Đăng Nhập Tại Đây' : 'Sign In Here'}
            </Link>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};
