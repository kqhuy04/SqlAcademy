export type PostStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TagResponse {
  id: number;
  name: string;
}

export interface PostSummaryResponse {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  status: PostStatus;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl: string | null;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  tags: string[];
}

export interface PostDetailResponse {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  content: string;
  status: PostStatus;
  rejectReason: string | null;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl: string | null;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  viewCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface PostListResponse {
  items: PostSummaryResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
}

export interface CreateCommentResponse {
  id: number;
  postId: number;
  userId: number;
  username: string;
  userAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  thumbnailUrl?: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  thumbnailUrl?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
}

export interface ApprovePostRequest {
  postId: number;
}

export interface RejectPostRequest {
  postId: number;
  reason: string;
}

export interface ToggleLikeResponse {
  postId: number;
  liked: boolean;
  likeCount: number;
}

export interface ToggleBookmarkResponse {
  postId: number;
  bookmarked: boolean;
  bookmarkCount: number;
}
