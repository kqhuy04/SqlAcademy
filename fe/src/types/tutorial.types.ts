export interface TableColumnMetadata {
  name: string;
  type: string;
  isPk?: boolean;
  noteVi?: string;
  noteEn?: string;
}

export interface TableMetadata {
  name: string;
  columns: TableColumnMetadata[];
}

export interface LessonHint {
  level: number;
  titleVi: string;
  titleEn: string;
  textVi: string;
  textEn: string;
}

export interface InteractiveExample {
  query: string;
  captionVi: string;
  captionEn: string;
}

export interface DetectiveAnalogy {
  actionVi: string;
  actionEn: string;
  storyVi: string;
  storyEn: string;
  syntaxTakeawayVi?: string;
  syntaxTakeawayEn?: string;
}

// ============================================================================
// 3-TAB PEDAGOGICAL MODEL FOR SQL DETECTIVE
// ============================================================================

// Tab 1: "Hồ sơ vụ án" (~2 phút, học nhanh, trực quan)
export interface CasePain {
  storyVi: string;
  storyEn?: string;
  naiveQuery: string;
  naiveResultNoteVi: string;
  naiveResultNoteEn?: string;
}

export interface SingleMetaphor {
  metaphorVi: string;
  metaphorEn?: string;
  visualType?: 'sieve' | 'magnifier' | 'funnel' | 'highlight';
}

export interface LiveQueryClause {
  keyword: string;
  code: string;
  explanationVi: string;
  explanationEn?: string;
  visualEffect: 'keep_columns' | 'source_table' | 'filter_rows';
}

export interface LiveQuery {
  fullQuery: string;
  clauses: LiveQueryClause[];
}

export interface Tab1Dossier {
  casePain: CasePain;
  metaphor: SingleMetaphor;
  liveQuery: LiveQuery;
}

// Tab 2: "Thẩm vấn" (~2-3 phút, quiz, bug hunting, thẻ bài)
export interface PredictionQuizOption {
  id: string;
  textVi: string;
  textEn?: string;
  isCorrect: boolean;
}

export interface PredictionQuiz {
  questionVi: string;
  questionEn?: string;
  query: string;
  options: PredictionQuizOption[];
  explanationVi: string;
  explanationEn?: string;
}

export interface BugBounty {
  id: string;
  titleVi: string;
  titleEn?: string;
  buggyQuery: string;
  expectedErrorSnippet: string;
  flashcardVi: string; // Thẻ nhớ 1 dòng
  flashcardEn?: string;
}

export interface CheatCard {
  keyword: string;
  labelVi: string;
  labelEn?: string;
  syntaxTemplate: string;
  exampleQuery: string;
  descriptionVi: string;
  descriptionEn?: string;
}

export interface Tab2Interrogation {
  predictionQuiz: PredictionQuiz;
  bugBounties: BugBounty[];
  cheatCards: CheatCard[];
}

// Tab 3: "Phá án" (~2 phút, 4 thử thách tăng dần có bẫy + thẻ nhớ chốt bài)
export interface ChallengeTierHint {
  level1ConceptVi: string; // (1) Nhắc khái niệm
  level1ConceptEn?: string;
  level2TemplateVi: string; // (2) Gợi ý khung có chỗ trống
  level2TemplateEn?: string;
  level3SolutionQuery: string; // (3) Lời giải hoàn chỉnh
}

export interface Challenge {
  id: string;
  difficulty: 1 | 2 | 3 | 4; // 1: ⭐, 2: ⭐⭐, 3: ⭐⭐⭐, 4: ⭐⭐⭐ Bẫy
  titleVi: string;
  titleEn?: string;
  missionVi: string; // Tình huống nghiệp vụ trinh thám, không dùng thuật ngữ SQL
  missionEn?: string;
  starterCode?: string;
  expectedQuery: string;
  hints: ChallengeTierHint;
  isTrap?: boolean;
}

export interface TakeawayFlashcard {
  summaryLinesVi: [string, string, string]; // Đúng 3 dòng
  summaryLinesEn?: [string, string, string];
  reviewTopic: string;
}

export interface Tab3SolveCase {
  challenges: Challenge[];
  takeawayFlashcard: TakeawayFlashcard;
}

export interface TutorialLesson {
  id: string;
  moduleId: string;
  orderIndex: number;
  titleVi: string;
  titleEn: string;
  briefingVi: string;
  briefingEn: string;
  theoryVi: string;
  theoryEn: string;
  detectiveAnalogy?: DetectiveAnalogy;
  interactiveExample?: InteractiveExample;
  objectiveVi: string;
  objectiveEn: string;
  starterQuery: string;
  expectedSolutionQuery: string;
  schemaSql: string;
  seedSql: string;
  tables: TableMetadata[];
  hints: LessonHint[];
  requiredKeywords?: string[];
  forbiddenKeywords?: string[];
  xpReward: number;
  isOptimizationLesson?: boolean;

  // New 3-Tab Architecture fields
  tab1Dossier?: Tab1Dossier;
  tab2Interrogation?: Tab2Interrogation;
  tab3SolveCase?: Tab3SolveCase;
}

export interface TutorialModule {
  id: string;
  orderIndex: number;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  badgeCode: string;
  badgeNameVi: string;
  badgeNameEn: string;
  badgeIcon: string;
  lessons: TutorialLesson[];
}

export type SqlCell = string | number | boolean | Uint8Array | null;

export interface QueryResult {
  columns: string[];
  values: SqlCell[][];
  executionTimeMs: number;
  rowCount: number;
}

export interface ExplainPlanRow {
  id: number;
  parent: number;
  notused: number;
  detail: string;
}

export interface ValidationResult {
  passed: boolean;
  messageVi: string;
  messageEn: string;
  actualCount: number;
  expectedCount: number;
  missingKeywords?: string[];
}

export interface UserTutorialProgressDTO {
  moduleId: string;
  lessonId: string;
  status: string;
  scoreEarned: number;
  attempts: number;
  completedAt: string;
}

export interface TutorialSubmitResponse {
  message: string;
  isFirstCompletion: boolean;
  scoreEarned: number;
  totalScore: number;
  newBadgeAwarded?: string | null;
  badgesEarned?: string | null;
}
