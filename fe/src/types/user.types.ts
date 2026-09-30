export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  isPremium: boolean;
  premiumPurchasedAt: string | null;
  totalScore: number;
  badgesEarned: string | null;
  avatarUrl?: string | null;
}

export interface UserProgressResponse {
  caseId: number;
  caseTitle: string;
  difficulty: string;
  questionId: number;
  questionOrderIndex: number;
  scoreEarned: number;
  hintsUsed: number;
  attempts: number;
  completedAt: string;
  status?: string;
}

export interface LeaderboardEntryResponse {
  rank: number;
  username: string;
  totalScore: number;
  casesCompleted: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface DeleteUserRequest {
  password: string;
}

export interface DeleteUserResponse {
  message: string;
}

export interface SubscriptionResponse {
  message: string;
}
