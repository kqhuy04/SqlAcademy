import { apiClient } from './client';
import type {
  PremiumCaseListResponse,
  PremiumCaseDTO,
  GetCaseListParams,
  SQLQueryRequest,
  SQLQueryResponse,
  EndCaseRequest,
  EndCaseResponse,
  GetTableResponse,
} from '@/types/case.types';

export const caseApi = {
  getCaseList: async (params?: GetCaseListParams): Promise<PremiumCaseListResponse> => {
    const res = await apiClient.get<PremiumCaseListResponse>('/premium_cases', { params });
    return res.data;
  },

  getCaseDetail: async (id: number): Promise<PremiumCaseDTO> => {
    const res = await apiClient.get<PremiumCaseDTO>(`/premium_cases/${id}`);
    return res.data;
  },

  getCaseTables: async (id: number): Promise<GetTableResponse> => {
    const res = await apiClient.get<GetTableResponse>(`/premium_cases/${id}/tables`);
    return res.data;
  },

  runQuery: async (data: SQLQueryRequest): Promise<SQLQueryResponse> => {
    const res = await apiClient.post<SQLQueryResponse>('/premium_cases/run', data);
    return res.data;
  },

  unlockHint: async (data: import('@/types/case.types').UnlockHintRequest): Promise<import('@/types/case.types').UnlockHintResponse> => {
    const res = await apiClient.post<import('@/types/case.types').UnlockHintResponse>('/premium_cases/hint', data);
    return res.data;
  },

  submitAnswer: async (data: EndCaseRequest): Promise<EndCaseResponse> => {
    const res = await apiClient.post<EndCaseResponse>('/premium_cases/end', data);
    return res.data;
  },
};
