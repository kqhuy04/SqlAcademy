import { useCallback } from 'react';
import { useAuthStore, REFRESH_TOKEN_KEY } from '@/store/authStore';
import { authApi } from '@/api/auth.api';
import { userApi } from '@/api/user.api';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const storeLogout = useAuthStore((s) => s.logout);
  const setLoading = useAuthStore((s) => s.setLoading);

  const initAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const refreshRes = await authApi.refreshToken({ refreshToken });
      setAccessToken(refreshRes.accessToken);

      // Fetch user profile
      const userProfile = await userApi.getMe();
      setUser(userProfile);
    } catch {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setAccessToken, setUser]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const res = await authApi.login(credentials);
      setTokens(res.accessToken, res.refreshToken);
      const profile = res.user ?? (await userApi.getMe());
      setUser(profile);
      return profile;
    },
    [setTokens, setUser]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      return await authApi.register(data);
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const res = await authApi.googleLogin({ idToken });
      setTokens(res.accessToken, res.refreshToken);
      const profile = res.user ?? (await userApi.getMe());
      setUser(profile);
      return profile;
    },
    [setTokens, setUser]
  );

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await userApi.getMe();
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  }, [setUser]);

  return {
    accessToken,
    user,
    isLoading,
    isAuthenticated: !!accessToken && !!user,
    isPremium: Boolean(user?.isPremium),
    initAuth,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshProfile,
  };
}
