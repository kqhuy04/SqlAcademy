export type CaseDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface CaseQuestionDTO {
  id: number;
  orderIndex: number;
  questionVi: string;
  questionEn: string;
  hint1?: string | null;
  hint2?: string | null;
  hint3?: string | null;
  hasHint1?: boolean;
  hasHint2?: boolean;
  hasHint3?: boolean;
  skillTags: string;
}

export interface PremiumCaseDTO {
  id: number;
  title: string;
  description: string;
  difficulty: CaseDifficulty;
  hint: string;
  orderIndex: number;
  baseScore: number;
  badgeName: string;
  badgeIcon: string;
  questionCount: number;
  isUnlocked: boolean;
  caseQuestionDTOList: CaseQuestionDTO[] | null;
}

export interface GetCaseListParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PremiumCaseListResponse {
  premiumCaseDTOList: PremiumCaseDTO[];
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  hasNext?: boolean;
}

export interface SQLQueryRequest {
  caseId: number;
  questionId?: number;
  query: string;
}

export interface SQLQueryResponse {
  result?: Record<string, unknown>[];
  rows?: Record<string, unknown>[];
}

export interface UnlockHintRequest {
  caseId: number;
  questionId: number;
  hintNumber: number;
}

export interface UnlockHintResponse {
  hintNumber: number;
  hintText: string;
  hintsUsed: number;
}

export interface EndCaseRequest {
  caseId: number;
  questionId: number;
  answer: string;
  hintsUsed?: number;
  attempts?: number;
}

export interface EndCaseResponse {
  message: string;
  correct: boolean;
  scoreEarned: number;
}

export interface CaseColumnDTO {
  columnName: string;
  dataType: string;
  isPrimaryKey?: boolean;
  descriptionVi?: string;
  descriptionEn?: string;
  sampleValues?: string;
}

export interface CaseTableDTO {
  tableName: string;
  descriptionVi?: string;
  descriptionEn?: string;
  sampleData?: string;
  columnDTOList: CaseColumnDTO[];
}

export interface GetTableResponse {
  tables: CaseTableDTO[];
}
