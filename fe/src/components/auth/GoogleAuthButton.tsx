import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageStore } from '@/store/languageStore';
import toast from 'react-hot-toast';

interface GoogleAuthButtonProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getNotDisplayedReason?: () => string;
            }) => void
          ) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

const DEFAULT_CLIENT_ID = '551403863226-p43b8i70lq0p211g01he6ee7nbnkqiuc.apps.googleusercontent.com';

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ mode, onSuccess }) => {
  const { lang } = useLanguageStore();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;

  const handleCredentialResponse = async (response: { credential: string }) => {
    if (!response.credential) {
      toast.error(
        lang === 'VI'
          ? 'Không nhận được mã xác thực từ Google'
          : 'No Google credential token received'
      );
      return;
    }

    try {
      setIsLoading(true);
      await loginWithGoogle(response.credential);
      toast.success(
        lang === 'VI'
          ? 'Xác thực tài khoản Google thành công!'
          : 'Successfully authenticated with Google!'
      );
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/cases', { replace: true });
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const msg =
        data?.message ||
        (lang === 'VI'
          ? 'Đăng nhập bằng Google thất bại. Vui lòng kiểm tra lại tài khoản!'
          : 'Google sign-in failed. Please try again!');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !buttonContainerRef.current) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        buttonContainerRef.current.innerHTML = '';

        // Calculate responsive width (max 380, fits card)
        const containerWidth = buttonContainerRef.current.parentElement?.clientWidth || 360;
        const targetWidth = Math.min(380, Math.max(240, containerWidth - 8));

        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          width: targetWidth,
          logo_alignment: 'left',
          locale: lang === 'VI' ? 'vi' : 'en',
        });

        if (isMounted) setIsGsiReady(true);
        return true;
      } catch (err) {
        console.warn('Google GSI initialization error:', err);
        return false;
      }
    };

    // Try immediately
    if (!renderGoogleButton()) {
      // Poll every 200ms for up to 6 seconds until script is loaded
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (renderGoogleButton() || Date.now() - startTime > 6000) {
          clearInterval(interval);
        }
      }, 200);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [clientId, mode, lang]);

  const handleFallbackClick = () => {
    if (clientId === 'your-client-id-here.apps.googleusercontent.com') {
      toast.error(
        lang === 'VI'
          ? 'Chưa cấu hình Google Client ID trong file .env!'
          : 'Google Client ID not configured in .env!'
      );
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            toast.error(
              lang === 'VI'
                ? 'Không thể mở cửa sổ Google. Vui lòng bấm trực tiếp nút Google bên dưới hoặc kiểm tra chặn pop-up trình duyệt!'
                : 'Unable to open Google prompt. Please click the Google button directly or disable pop-up blockers!'
            );
          }
        });
      } catch {
        toast.error(
          lang === 'VI'
            ? 'Đang khởi động dịch vụ Google...'
            : 'Starting Google sign-in services...'
        );
      }
    } else {
      toast.error(
        lang === 'VI'
          ? 'Không tải được dịch vụ Google Identity. Vui lòng kiểm tra adblock hoặc kết nối mạng!'
          : 'Google Identity Service unavailable. Please check your ad blocker or connection!'
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Official Google Sign-In Button Container */}
      <div
        ref={buttonContainerRef}
        className={`w-full flex justify-center min-h-[44px] transition-opacity duration-200 ${
          isGsiReady ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
        }`}
      />

      {/* Fallback button shown while GSI is loading or if script fails */}
      {(!isGsiReady || isLoading) && (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-noir-paper hover:bg-noir-card border-2 border-noir-borderDark rounded-[3px] text-xs font-typewriter font-bold uppercase tracking-wider text-noir-ink shadow-noir-sm hover:shadow-noir-md transition-all cursor-pointer disabled:opacity-60"
        >
          {/* Official Google G Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>

          <span>
            {isLoading
              ? lang === 'VI'
                ? 'Đang xác thực Google...'
                : 'Authenticating with Google...'
              : !isGsiReady
              ? lang === 'VI'
                ? 'Đang tải nút Google...'
                : 'Loading Google Sign-In...'
              : mode === 'register'
              ? lang === 'VI'
                ? 'Đăng Ký Bằng Google'
                : 'Sign Up With Google'
              : lang === 'VI'
              ? 'Đăng Nhập Bằng Google'
              : 'Sign In With Google'}
          </span>
        </button>
      )}
    </div>
  );
};
