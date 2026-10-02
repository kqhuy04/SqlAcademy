import { create } from 'zustand';
import type { UserProfileResponse } from '@/types/user.types';

interface AuthState {
  accessToken: string | null;
  user: UserProfileResponse | null;
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: UserProfileResponse | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const REFRESH_TOKEN_KEY = 'police_academy_refresh_token';

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isLoading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user }),

  setTokens: (accessToken: string, refreshToken?: string) => {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    set({ accessToken });
  },

  logout: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ accessToken: null, user: null, isLoading: false });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

if (typeof window !== 'undefined') {
  (window as unknown as { __AUTH_STORE__: typeof useAuthStore }).__AUTH_STORE__ = useAuthStore;
}
