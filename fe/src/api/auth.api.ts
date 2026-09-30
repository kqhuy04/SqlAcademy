import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await apiClient.post<RegisterResponse>('/auth/register', data);
    return res.data;
  },

  logout: async (data: LogoutRequest): Promise<LogoutResponse> => {
    const res = await apiClient.post<LogoutResponse>('/auth/logout', data);
    return res.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const res = await apiClient.post<RefreshTokenResponse>('/auth/refresh', data);
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const res = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return res.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const res = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
    return res.data;
  },

  googleLogin: async (data: { idToken: string }): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/google', data);
    return res.data;
  },
};
