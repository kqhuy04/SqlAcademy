import { apiClient } from './client';
import type {
  PostListResponse,
  PostDetailResponse,
  CreateCommentResponse,
  TagResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  ApprovePostRequest,
  RejectPostRequest,
  ToggleLikeResponse,
  ToggleBookmarkResponse,
} from '@/types/post.types';

export const postApi = {
  // Public
  getApprovedPosts: async (tag?: string, page = 0, size = 10): Promise<PostListResponse> => {
    const params: Record<string, string | number> = { page, size };
    if (tag) params.tag = tag;
    const res = await apiClient.get<PostListResponse>('/posts', { params });
    return res.data;
  },

  getPostBySlug: async (slug: string): Promise<PostDetailResponse> => {
    const res = await apiClient.get<PostDetailResponse>(`/posts/${slug}`);
    return res.data;
  },

  getComments: async (postId: number): Promise<CreateCommentResponse[]> => {
    const res = await apiClient.get<CreateCommentResponse[]>(`/posts/${postId}/comments`);
    return res.data;
  },

  getAllTags: async (): Promise<TagResponse[]> => {
    const res = await apiClient.get<TagResponse[]>('/tags');
    return res.data;
  },

  // Author & User
  createPost: async (data: CreatePostRequest): Promise<PostDetailResponse> => {
    const res = await apiClient.post<PostDetailResponse>('/posts', data);
    return res.data;
  },

  updatePost: async (id: number, data: UpdatePostRequest): Promise<PostDetailResponse> => {
    const res = await apiClient.put<PostDetailResponse>(`/posts/${id}`, data);
    return res.data;
  },

  submitPost: async (id: number): Promise<void> => {
    await apiClient.patch(`/posts/${id}/submit`);
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  getMyPosts: async (page = 0, size = 10): Promise<PostListResponse> => {
    const res = await apiClient.get<PostListResponse>('/posts/me', { params: { page, size } });
    return res.data;
  },

  toggleLike: async (id: number): Promise<ToggleLikeResponse> => {
    const res = await apiClient.post<ToggleLikeResponse>(`/posts/${id}/like`);
    return res.data;
  },

  toggleBookmark: async (id: number): Promise<ToggleBookmarkResponse> => {
    const res = await apiClient.post<ToggleBookmarkResponse>(`/posts/${id}/bookmark`);
    return res.data;
  },

  getMyBookmarks: async (page = 0, size = 10): Promise<PostListResponse> => {
    const res = await apiClient.get<PostListResponse>('/posts/bookmarks', { params: { page, size } });
    return res.data;
  },

  addComment: async (data: CreateCommentRequest): Promise<CreateCommentResponse> => {
    const res = await apiClient.post<CreateCommentResponse>('/posts/comments', data);
    return res.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/posts/comments/${commentId}`);
  },

  // Admin moderation
  getPendingPosts: async (page = 0, size = 10): Promise<PostListResponse> => {
    const res = await apiClient.get<PostListResponse>('/admin/posts/pending', { params: { page, size } });
    return res.data;
  },

  approvePost: async (data: ApprovePostRequest): Promise<void> => {
    await apiClient.post('/admin/posts/approve', data);
  },

  rejectPost: async (data: RejectPostRequest): Promise<void> => {
    await apiClient.post('/admin/posts/reject', data);
  },
};
