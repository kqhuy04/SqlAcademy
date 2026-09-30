import { apiClient } from './client';
import type {
  UserProfileResponse,
  UserProgressResponse,
  LeaderboardEntryResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  SubscriptionResponse,
} from '@/types/user.types';

export const userApi = {
  getMe: async (): Promise<UserProfileResponse> => {
    const res = await apiClient.get<UserProfileResponse>('/users/me');
    return res.data;
  },

  getProgress: async (): Promise<UserProgressResponse[]> => {
    const res = await apiClient.get<UserProgressResponse[]>('/users/me/progress');
    return res.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntryResponse[]> => {
    const res = await apiClient.get<LeaderboardEntryResponse[]>('/users/leaderboard');
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const res = await apiClient.patch<ChangePasswordResponse>('/users/me/password', data);
    return res.data;
  },

  subscribe: async (): Promise<SubscriptionResponse> => {
    const res = await apiClient.patch<SubscriptionResponse>('/users/me/subscriptions', {});
    return res.data;
  },

  deleteAccount: async (data: DeleteUserRequest): Promise<DeleteUserResponse> => {
    const res = await apiClient.delete<DeleteUserResponse>('/users/me', { data });
    return res.data;
  },

  uploadAvatar: async (file: File): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ message: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
