import { apiClient } from './client';
import type {
  UserTutorialProgressDTO,
  TutorialSubmitResponse,
} from '@/types/tutorial.types';

export interface SaveTutorialProgressRequest {
  moduleId: string;
  lessonId: string;
  scoreEarned: number;
  attempts: number;
}

export const tutorialApi = {
  getProgress: async (): Promise<UserTutorialProgressDTO[]> => {
    try {
      const res = await apiClient.get<UserTutorialProgressDTO[]>('/tutorials/progress');
      return res.data;
    } catch {
      return [];
    }
  },

  saveProgress: async (
    data: SaveTutorialProgressRequest
  ): Promise<TutorialSubmitResponse | null> => {
    try {
      const res = await apiClient.post<TutorialSubmitResponse>('/tutorials/progress', data);
      return res.data;
    } catch {
      return null;
    }
  },
};
