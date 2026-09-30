import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Database } from 'sql.js';
import { TUTORIAL_MODULES } from '@/data/tutorialData';
import {
  createSessionDb,
  executeQuery,
  explainQueryPlan,
  validateExercise,
} from '@/services/sqliteEngine';
import { tutorialApi } from '@/api/tutorial.api';
import { useAuth } from '@/hooks/useAuth';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TutorialSQLEditor } from '@/components/tutorial/TutorialSQLEditor';
import { TutorialResultTable } from '@/components/tutorial/TutorialResultTable';
import { TutorialSchemaViewer } from '@/components/tutorial/TutorialSchemaViewer';
import { TutorialExplainPlan } from '@/components/tutorial/TutorialExplainPlan';
import { DetectiveAnalogyCard } from '@/components/tutorial/DetectiveAnalogyCard';
import { TutorialNavHeader } from '@/components/tutorial/TutorialNavHeader';
import { TutorialTheorySection } from '@/components/tutorial/TutorialTheorySection';
import { TutorialDossierTab } from '@/components/tutorial/TutorialDossierTab';
import { TutorialInterrogationTab } from '@/components/tutorial/TutorialInterrogationTab';
import { TutorialSolveTab } from '@/components/tutorial/TutorialSolveTab';
import { DetectiveNotes } from '@/components/common/DetectiveNotes';
import { QueryHistoryPanel, type QueryHistoryItem } from '@/components/common/QueryHistoryPanel';
import { useLanguageStore } from '@/store/languageStore';
import { cn } from '@/utils/cn';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  Database as DatabaseIcon,
  ArrowRight,
  ArrowUp,
  Zap,
  Table as TableIcon,
  History,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Scale,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  QueryResult,
  ExplainPlanRow,
  ValidationResult,
} from '@/types/tutorial.types';

export const TutorialWorkspacePage: React.FC = () => {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, refreshProfile } = useAuth();

  // Find module and lesson
  const currentModule = useMemo(
    () => TUTORIAL_MODULES.find((m) => m.id === moduleId),
    [moduleId]
  );
  const currentLesson = useMemo(
    () => currentModule?.lessons.find((l) => l.id === lessonId),
    [currentModule, lessonId]
  );

  // Seamless navigation across lessons and modules
  const { prevNav, nextNav, nextModule } = useMemo(() => {
    if (!currentModule || !currentLesson) {
      return { prevNav: null, nextNav: null, nextModule: null };
    }
    const modIdx = TUTORIAL_MODULES.findIndex((m) => m.id === currentModule.id);
    const lesIdx = currentModule.lessons.findIndex((l) => l.id === currentLesson.id);

    let prevNav: string | null = null;
    if (lesIdx > 0) {
      prevNav = `/tutorials/${currentModule.id}/${currentModule.lessons[lesIdx - 1].id}`;
    } else if (modIdx > 0) {
      const prevMod = TUTORIAL_MODULES[modIdx - 1];
      prevNav = `/tutorials/${prevMod.id}/${prevMod.lessons[prevMod.lessons.length - 1].id}`;
    }

    let nextNav: string | null = null;
    let nextModObj = null;
    if (lesIdx < currentModule.lessons.length - 1) {
      nextNav = `/tutorials/${currentModule.id}/${currentModule.lessons[lesIdx + 1].id}`;
    } else if (modIdx < TUTORIAL_MODULES.length - 1) {
      nextModObj = TUTORIAL_MODULES[modIdx + 1];
      nextNav = `/tutorials/${nextModObj.id}/${nextModObj.lessons[0].id}`;
    }

    return { prevNav, nextNav, nextModule: nextModObj };
  }, [currentModule, currentLesson]);

  // States
  const { lang } = useLanguageStore();
  const [userCode, setUserCode] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [explainRows, setExplainRows] = useState<ExplainPlanRow[]>([]);
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(1);
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<'result' | 'schema' | 'history' | 'notes' | 'explain'>('result');
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [dbLoadError, setDbLoadError] = useState<string | null>(null);

  // 3-Tab Pedagogical States (Hồ Sơ Vụ Án • Thẩm Vấn • Phá Án)
  const [activePedagogicalTab, setActivePedagogicalTab] = useState<'dossier' | 'interrogation' | 'solve'>('dossier');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);

  // New states for uncluttered theory viewing & detective analogy modal
  const [theoryViewMode, setTheoryViewMode] = useState<'quick' | 'full' | 'diagram'>('quick');
  const [isTheoryCollapsed, setIsTheoryCollapsed] = useState(false);
  const [showAnalogyModal, setShowAnalogyModal] = useState(false);

  // Semantic color helper for SQL keywords
  const getKeywordBadgeClass = (kw: string) => {
    const upper = kw.toUpperCase();
    if (upper.includes('SELECT') || upper.includes('FROM')) {
      return 'bg-noir-blood/10 border-noir-blood/40 text-noir-blood';
    }
    if (upper.includes('WHERE') || upper.includes('HAVING') || upper.includes('LIKE') || upper.includes('BETWEEN')) {
      return 'bg-amber-500/15 border-amber-700/40 text-amber-900';
    }
    if (upper.includes('JOIN') || upper.includes('ON') || upper.includes('UNION')) {
      return 'bg-[#EDE3C9] border-[#9A8870]/60 text-[#3D2F24]';
    }
    return 'bg-emerald-950/10 border-emerald-700/30 text-emerald-800';
  };

  // In-memory Database ref
  const dbRef = useRef<Database | null>(null);
  const practiceRef = useRef<HTMLDivElement>(null);
  const theoryRef = useRef<HTMLDivElement>(null);

  const handleScrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToTheory = () => {
    theoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectChallenge = (index: number) => {
    setCurrentChallengeIndex(index);
    setValidationResult(null);
    const challenge = currentLesson?.tab3SolveCase?.challenges?.[index];
    if (challenge?.starterCode) {
      setUserCode(challenge.starterCode);
    }
  };

  // Initialize DB session on lesson change
  useEffect(() => {
    if (!currentLesson) return;

    setActivePedagogicalTab('dossier');
    setCurrentChallengeIndex(0);
    setCompletedChallengeIds([]);
    if (currentLesson.tab3SolveCase?.challenges?.[0]?.starterCode) {
      setUserCode(currentLesson.tab3SolveCase.challenges[0].starterCode);
    } else {
      setUserCode(currentLesson.starterQuery);
    }

    setQueryResult(null);
    setQueryError(null);
    setExplainRows([]);
    setRevealedHints([]);
    setValidationResult(null);
    setAttempts(1);
    setDbLoadError(null);

    // If it's an optimization lesson, default to result tab or terminal
    setActiveWorkbenchTab('result');

    // Clean up old db instance
    if (dbRef.current) {
      try {
        dbRef.current.close();
      } catch {
        // ignore
      }
      dbRef.current = null;
    }

    createSessionDb(currentLesson.schemaSql, currentLesson.seedSql)
      .then((db) => {
        dbRef.current = db;
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        setDbLoadError(msg);
        toast.error(`Failed to initialize SQLite WASM: ${msg}`);
      });

    return () => {
      if (dbRef.current) {
        try {
          dbRef.current.close();
        } catch {
          // ignore
        }
        dbRef.current = null;
      }
    };
  }, [currentLesson]);

  // Execute user query
  const handleRunQuery = useCallback(() => {
    if (!dbRef.current) {
      toast.error('Database is initializing, please wait...');
      return;
    }
    setIsQueryRunning(true);
    setQueryError(null);

    try {
      const res = executeQuery(dbRef.current, userCode);
      setQueryResult(res);

      // Also compute explain query plan
      const plan = explainQueryPlan(dbRef.current, userCode);
      setExplainRows(plan);
      setActiveWorkbenchTab('result');

      // Record to query history
      setQueryHistory((prev) => [
        {
          id: `tut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          query: userCode.trim(),
          status: 'SUCCESS',
          rowCount: res.rowCount,
          executionTimeMs: res.executionTimeMs,
          resultData: res,
        },
        ...prev.slice(0, 29),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setQueryError(msg);
      setQueryResult(null);
      setExplainRows([]);
      setActiveWorkbenchTab('result');

      // Record error to query history
      setQueryHistory((prev) => [
        {
          id: `tut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          query: userCode.trim(),
          status: 'ERROR',
          errorMessage: msg,
        },
        ...prev.slice(0, 29),
      ]);
    } finally {
      setIsQueryRunning(false);
    }
  }, [userCode]);

  // Reset to starter query
  const handleResetQuery = useCallback(() => {
    if (currentLesson) {
      setUserCode(currentLesson.starterQuery);
      setQueryResult(null);
      setQueryError(null);
      setValidationResult(null);
      toast.success(lang === 'VI' ? 'Đã khôi phục câu lệnh gốc' : 'Starter query restored');
    }
  }, [currentLesson, lang]);

  // Run interactive example
  const handleRunExample = useCallback(
    (exampleSql: string) => {
      setUserCode(exampleSql);
      if (!dbRef.current) return;
      setIsQueryRunning(true);
      try {
        const res = executeQuery(dbRef.current, exampleSql);
        setQueryResult(res);
        const plan = explainQueryPlan(dbRef.current, exampleSql);
        setExplainRows(plan);
        setActiveWorkbenchTab('result');

        // Record to query history
        setQueryHistory((prev) => [
          {
            id: `tut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            query: exampleSql.trim(),
            status: 'SUCCESS',
            rowCount: res.rowCount,
            executionTimeMs: res.executionTimeMs,
            resultData: res,
          },
          ...prev.slice(0, 29),
        ]);

        toast.success(lang === 'VI' ? 'Đã nạp và thực thi câu lệnh mẫu' : 'Loaded and ran example query');
        practiceRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setQueryError(msg);
      } finally {
        setIsQueryRunning(false);
      }
    },
    [lang]
  );

  // Submit and validate
  const handleSubmitEvidence = async () => {
    if (!dbRef.current || !currentLesson || !currentModule) return;

    setIsSubmitting(true);
    setAttempts((prev) => prev + 1);

    const currentChallenge = currentLesson.tab3SolveCase?.challenges?.[currentChallengeIndex];
    let check: ValidationResult;

    if (currentChallenge) {
      check = validateExercise(
        dbRef.current,
        userCode,
        currentChallenge.expectedQuery
      );
    } else {
      check = validateExercise(
        dbRef.current,
        userCode,
        currentLesson.expectedSolutionQuery,
        currentLesson.requiredKeywords,
        currentLesson.forbiddenKeywords
      );
    }

    setValidationResult(check);

    if (check.passed) {
      let updatedDoneList = completedChallengeIds;
      if (currentChallenge) {
        if (!completedChallengeIds.includes(currentChallenge.id)) {
          updatedDoneList = [...completedChallengeIds, currentChallenge.id];
          setCompletedChallengeIds(updatedDoneList);
        }
        toast.success(
          lang === 'VI'
            ? `Phá án thành công thử thách ${currentChallengeIndex + 1}! 🎉`
            : `Challenge ${currentChallengeIndex + 1} solved! 🎉`
        );
      }

      // Check if all challenges in tab 3 are done (or regular lesson)
      const totalChallenges = currentLesson.tab3SolveCase?.challenges?.length || 1;
      const isFinishedAll = currentLesson.tab3SolveCase
        ? updatedDoneList.length >= totalChallenges
        : true;

      if (isFinishedAll) {
        // Save locally
        try {
          const localCompleted = JSON.parse(
            localStorage.getItem('tutorial_completed_lessons') || '[]'
          );
          if (!localCompleted.includes(currentLesson.id)) {
            localCompleted.push(currentLesson.id);
            localStorage.setItem(
              'tutorial_completed_lessons',
              JSON.stringify(localCompleted)
            );
          }
        } catch {
          // ignore
        }

        // Save to BE if authenticated
        if (isAuthenticated) {
          const res = await tutorialApi.saveProgress({
            moduleId: currentModule.id,
            lessonId: currentLesson.id,
            scoreEarned: currentLesson.xpReward,
            attempts,
          });

          if (res) {
            await refreshProfile();
            if (res.newBadgeAwarded) {
              toast.success(
                `🏆 ${lang === 'VI' ? 'Mở khóa huy hiệu mới' : 'Unlocked New Badge'}: ${res.newBadgeAwarded}!`,
                { duration: 5000 }
              );
            } else if (res.isFirstCompletion) {
              toast.success(
                `+${res.scoreEarned} ⭐! ${lang === 'VI' ? 'Đã ghi nhận vào hồ sơ thám tử' : 'Saved to detective records'}`
              );
            }
          }
        } else {
          toast.success(
            `+${currentLesson.xpReward} ⭐! (${lang === 'VI' ? 'Đăng nhập để lưu vĩnh viễn' : 'Log in to save permanently'})`
          );
        }
      }
    } else {
      toast.error(lang === 'VI' ? check.messageVi : check.messageEn);
    }

    setIsSubmitting(false);
  };

  const handleInsertSnippet = (snippet: string) => {
    setUserCode(snippet);
    setActivePedagogicalTab('solve');
    toast.success(
      lang === 'VI'
        ? 'Đã nạp mẫu câu lệnh vào tab Phá Án!'
        : 'Query snippet loaded into Solve tab!'
    );
  };

  const handleSaveToNotes = (summary: string) => {
    try {
      const storageKey = `tutorial_detective_notes_${currentLesson?.id || 'common'}`;
      const existing = localStorage.getItem(storageKey) || '';
      const updated = existing ? `${existing}\n\n${summary}` : summary;
      localStorage.setItem(storageKey, updated);
      toast.success(
        lang === 'VI'
          ? 'Đã lưu thẻ chốt bài vào Sổ Tay Thám Tử!'
          : 'Flashcard saved to Detective Notes!'
      );
    } catch {
      // ignore
    }
  };

  // Inspect table shortcut
  const handleInsertTableQuery = (tableName: string) => {
    const q = `SELECT * FROM ${tableName} LIMIT 10;`;
    setUserCode(q);
    handleRunExample(q);
  };

  // Reveal next hint
  const handleRevealHint = (level: number) => {
    if (!revealedHints.includes(level)) {
      setRevealedHints([...revealedHints, level]);
    }
  };

  if (!currentModule || !currentLesson) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-noir-blood mx-auto mb-3" />
          <h2 className="text-2xl font-display font-black text-noir-ink uppercase">
            {lang === 'VI' ? 'Không tìm thấy bài học' : 'Lesson Not Found'}
          </h2>
          <Button
            type="button"
            variant="gold"
            className="mt-4"
            onClick={() => navigate('/tutorials')}
          >
            {lang === 'VI' ? 'Quay lại Học Viện' : 'Back to Academy'}
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <AnimatedPage>
        {/* Workspace Top Toolbar */}
        <TutorialNavHeader
          currentModuleId={currentModule.id}
          lessonTitle={lang === 'VI' ? currentLesson.titleVi : currentLesson.titleEn}
          lang={lang}
        />

        {/* Database load error banner if any */}
        {dbLoadError && (
          <div className="mb-4 p-3 bg-red-950/20 border border-noir-blood text-noir-blood rounded text-xs font-mono">
            Error initializing in-browser database: {dbLoadError}
          </div>
        )}

        {/* ========================================================= */}
        {/* PEDAGOGICAL 3-TAB SYSTEM (Hồ Sơ Vụ Án • Thẩm Vấn • Phá Án)*/}
        {/* ========================================================= */}
        {currentLesson.tab1Dossier ? (
          <div className="space-y-6">
            {/* Top 3 Tabs Navigation Bar (Học Viện • Vụ Án • Cẩm Nang style) */}
            <div className="flex items-center gap-1.5 sm:gap-2 border-b-2 border-noir-borderDark pb-2 mb-6 bg-noir-paper/50 px-2 py-1.5 rounded-[3px] overflow-x-auto">
              <button
                type="button"
                onClick={() => setActivePedagogicalTab('dossier')}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-[2px] text-xs sm:text-sm font-typewriter uppercase tracking-wider transition-all select-none cursor-pointer whitespace-nowrap',
                  activePedagogicalTab === 'dossier'
                    ? 'text-noir-blood bg-noir-card/90 border-b-2 border-noir-blood font-bold shadow-noir-sm'
                    : 'text-noir-ink hover:text-noir-blood hover:bg-noir-card/50 font-bold'
                )}
              >
                <FileText className="w-4 h-4 text-noir-candleDark" />
                <span>{lang === 'VI' ? '1. Hồ Sơ Vụ Án' : '1. Case Dossier'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePedagogicalTab('interrogation')}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-[2px] text-xs sm:text-sm font-typewriter uppercase tracking-wider transition-all select-none cursor-pointer whitespace-nowrap',
                  activePedagogicalTab === 'interrogation'
                    ? 'text-noir-blood bg-noir-card/90 border-b-2 border-noir-blood font-bold shadow-noir-sm'
                    : 'text-noir-ink hover:text-noir-blood hover:bg-noir-card/50 font-bold'
                )}
              >
                <Search className="w-4 h-4 text-noir-blood" />
                <span>{lang === 'VI' ? '2. Thẩm Vấn' : '2. Interrogation'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePedagogicalTab('solve')}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-[2px] text-xs sm:text-sm font-typewriter uppercase tracking-wider transition-all select-none cursor-pointer whitespace-nowrap',
                  activePedagogicalTab === 'solve'
                    ? 'text-noir-blood bg-noir-card/90 border-b-2 border-noir-blood font-bold shadow-noir-sm'
                    : 'text-noir-ink hover:text-noir-blood hover:bg-noir-card/50 font-bold'
                )}
              >
                <Scale className="w-4 h-4 text-noir-blood" />
                <span>{lang === 'VI' ? '3. Phá Án' : '3. Solve Case'}</span>
                {completedChallengeIds.length > 0 && (
                  <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-700 text-white font-bold">
                    {completedChallengeIds.length}/4
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: ONLY TAB 1 IS VISIBLE (Tắt 2 tab kia) */}
            {activePedagogicalTab === 'dossier' && (
              <TutorialDossierTab
                dossier={currentLesson.tab1Dossier}
                db={dbRef.current}
                lang={lang}
                onProceedToInterrogation={() => setActivePedagogicalTab('interrogation')}
              />
            )}

            {/* TAB 2: ONLY TAB 2 IS VISIBLE (Tắt 2 tab kia) */}
            {activePedagogicalTab === 'interrogation' && currentLesson.tab2Interrogation && (
              <TutorialInterrogationTab
                interrogation={currentLesson.tab2Interrogation}
                db={dbRef.current}
                lang={lang}
                onInsertSnippet={handleInsertSnippet}
                onProceedToSolve={() => setActivePedagogicalTab('solve')}
              />
            )}

            {/* TAB 3: ONLY TAB 3 IS VISIBLE (Tắt 2 tab kia) */}
            {activePedagogicalTab === 'solve' && currentLesson.tab3SolveCase && (
              <TutorialSolveTab
                solveCase={currentLesson.tab3SolveCase}
                userCode={userCode}
                setUserCode={setUserCode}
                onRunQuery={handleRunQuery}
                onSubmit={handleSubmitEvidence}
                onReset={handleResetQuery}
                isQueryRunning={isQueryRunning}
                isSubmitting={isSubmitting}
                validationResult={validationResult}
                tables={currentLesson.tables}
                lang={lang}
                currentChallengeIndex={currentChallengeIndex}
                onSelectChallenge={handleSelectChallenge}
                completedChallengeIds={completedChallengeIds}
                onSaveToNotes={handleSaveToNotes}
                onNextLesson={nextNav ? () => navigate(nextNav) : undefined}
              >
                {/* Workbench Results & Schema Tabs inside Tab 3 */}
                <div className="pt-4 border-t-2 border-noir-borderDark space-y-4">
                  <div className="flex items-center gap-1.5 border-b-2 border-noir-borderDark pb-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveWorkbenchTab('result')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        activeWorkbenchTab === 'result'
                          ? 'bg-noir-blood text-noir-parchment shadow-sm'
                          : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'VI' ? 'Kết quả' : 'Results'}</span>
                      {queryResult && (
                        <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                          {queryResult.rowCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveWorkbenchTab('schema')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        activeWorkbenchTab === 'schema'
                          ? 'bg-noir-blood text-noir-parchment shadow-sm'
                          : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                      }`}
                    >
                      <DatabaseIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'VI' ? 'Cấu trúc bảng' : 'Schema'}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                        {currentLesson.tables.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveWorkbenchTab('history')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        activeWorkbenchTab === 'history'
                          ? 'bg-noir-blood text-noir-parchment shadow-sm'
                          : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{lang === 'VI' ? 'Lịch sử' : 'History'}</span>
                      {queryHistory.length > 0 && (
                        <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-blood font-bold">
                          {queryHistory.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveWorkbenchTab('notes')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        activeWorkbenchTab === 'notes'
                          ? 'bg-noir-blood text-noir-parchment shadow-sm'
                          : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                      }`}
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>{lang === 'VI' ? 'Ghi chú' : 'Notes'}</span>
                    </button>

                    {currentLesson.isOptimizationLesson && (
                      <button
                        type="button"
                        onClick={() => setActiveWorkbenchTab('explain')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                          activeWorkbenchTab === 'explain'
                            ? 'bg-noir-blood text-noir-parchment shadow-sm'
                            : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lang === 'VI' ? 'Kế hoạch EXPLAIN' : 'EXPLAIN'}</span>
                        {explainRows.length > 0 && (
                          <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                            {explainRows.length}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Workbench Content */}
                  <div>
                    <div className={activeWorkbenchTab === 'result' ? 'block' : 'hidden'}>
                      <TutorialResultTable
                        result={queryResult}
                        error={queryError}
                        lang={lang}
                      />
                    </div>

                    {activeWorkbenchTab === 'schema' && (
                      <TutorialSchemaViewer
                        tables={currentLesson.tables}
                        lang={lang}
                        onInsertTableQuery={handleInsertTableQuery}
                      />
                    )}

                    {activeWorkbenchTab === 'history' && (
                      <QueryHistoryPanel
                        history={queryHistory}
                        onSelectQuery={setUserCode}
                        onClearHistory={() => setQueryHistory([])}
                        lang={lang}
                      />
                    )}

                    {activeWorkbenchTab === 'notes' && (
                      <DetectiveNotes
                        storageKey={`tutorial_detective_notes_${currentLesson.id}`}
                        lang={lang}
                        title={lang === 'VI' ? 'SỔ TAY GHI CHÉP THÁM TỬ' : 'DETECTIVE FIELD NOTES'}
                      />
                    )}

                    {activeWorkbenchTab === 'explain' && (
                      <TutorialExplainPlan planRows={explainRows} lang={lang} />
                    )}
                  </div>
                </div>
              </TutorialSolveTab>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* LEGACY FALLBACK (cho các bài chưa áp dụng 3-tab layout)    */
          /* ========================================================= */
          <>
            <TutorialTheorySection
              currentLesson={currentLesson}
              lang={lang}
              theoryViewMode={theoryViewMode}
              setTheoryViewMode={setTheoryViewMode}
              isTheoryCollapsed={isTheoryCollapsed}
              setIsTheoryCollapsed={setIsTheoryCollapsed}
              onRunExample={handleRunExample}
              onScrollToPractice={handleScrollToPractice}
              theoryRef={theoryRef}
            />

            <div
              id="practice-workstation"
              ref={practiceRef}
              className="pt-8 border-t-4 border-noir-borderDark mt-6 space-y-6"
            >
              {/* Workstation Header Anchor Bar */}
              <div className="bg-noir-card border-2 border-noir-borderDark rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-noir-card">
                <div className="flex items-center gap-2.5">
                  <div className="bg-noir-blood text-noir-parchment text-[11px] font-typewriter font-bold uppercase px-2.5 py-1 rounded-[2px] tracking-wider">
                    {lang === 'VI' ? 'KHU VỰC THỰC HÀNH' : 'PRACTICE LAB'}
                  </div>
                  <span className="text-xs font-typewriter text-noir-inkMuted hidden sm:inline">
                    {lang === 'VI' ? 'Viết SQL và kiểm tra kết quả' : 'Write SQL and verify results'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnalogyModal(true)}
                    className="text-xs font-typewriter flex items-center gap-1.5 border-amber-700/50 text-amber-900 hover:bg-amber-500/15 font-bold"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                    <span>{lang === 'VI' ? '💡 Mẹo nhớ' : '💡 Quick Tip'}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleScrollToTheory}
                    className="text-xs font-typewriter flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>{lang === 'VI' ? 'Lý thuyết ⬆' : 'Theory ⬆'}</span>
                  </Button>
                </div>
              </div>

              {/* Main Practice Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Mission Objective & Clues */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Mission Objective */}
                  <div className="bg-noir-card border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card">
                    <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-noir-borderDark/60">
                      <Award className="w-4 h-4 text-noir-blood" />
                      <h3 className="text-xs font-typewriter uppercase tracking-wider text-noir-blood font-bold">
                        {lang === 'VI' ? 'NHIỆM VỤ CỦA BẠN' : 'YOUR TASK'}
                      </h3>
                    </div>
                    <div className="font-serif text-xs sm:text-sm font-semibold text-noir-ink leading-relaxed bg-noir-paper p-3.5 rounded border border-noir-border shadow-inner shadow-noir-ink/5">
                      {lang === 'VI' ? currentLesson.objectiveVi : currentLesson.objectiveEn}
                    </div>

                    {/* Required keywords */}
                    {currentLesson.requiredKeywords && currentLesson.requiredKeywords.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10.5px] font-typewriter text-noir-inkMuted uppercase font-bold">
                          {lang === 'VI' ? 'Từ khóa cần dùng:' : 'Required:'}
                        </span>
                        {currentLesson.requiredKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border shadow-sm ${getKeywordBadgeClass(kw)}`}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progressive Hints */}
                  <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-card space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-noir-borderDark/40">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <h3 className="text-xs font-typewriter uppercase tracking-wider text-noir-ink font-bold">
                        {lang === 'VI' ? 'GỢI Ý' : 'HINTS'}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {currentLesson.hints.map((hint) => {
                        const isRevealed = revealedHints.includes(hint.level);

                        return (
                          <div
                            key={hint.level}
                            className="border border-noir-border rounded-[3px] overflow-hidden bg-noir-card/30"
                          >
                            <div className="p-2.5 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-noir-card border border-noir-borderDark flex items-center justify-center text-[10px] font-mono font-bold text-noir-ink">
                                  {hint.level}
                                </span>
                                <span className="font-typewriter text-xs font-semibold text-noir-ink">
                                  {lang === 'VI' ? hint.titleVi : hint.titleEn}
                                </span>
                              </div>

                              {!isRevealed ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRevealHint(hint.level)}
                                  className="h-6 text-[10px] px-2 py-0 border-noir-borderDark"
                                >
                                  {lang === 'VI' ? 'Xem gợi ý' : 'Show hint'}
                                </Button>
                              ) : null}
                            </div>

                            {isRevealed && (
                              <div className="px-3 pb-2.5 pt-1 text-xs font-serif text-noir-blood bg-noir-card/50 border-t border-noir-border font-medium">
                                {lang === 'VI' ? hint.textVi : hint.textEn}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: SQL Editor, Validation, Workbench Tabs */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Validation Feedback Banner */}
                  {validationResult && (
                    <div
                      className={`p-4 rounded-[4px] border-2 shadow-noir-card ${
                        validationResult.passed
                          ? 'bg-emerald-950/20 border-emerald-700 text-emerald-950'
                          : 'bg-red-950/20 border-noir-blood text-red-950'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <div className="flex items-start gap-3">
                          {validationResult.passed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-noir-blood flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-typewriter text-xs font-bold uppercase tracking-wider mb-1">
                              {validationResult.passed
                                ? lang === 'VI'
                                  ? 'CHÍNH XÁC! HOÀN THÀNH BÀI NÀY 🎉'
                                  : 'CORRECT! LESSON COMPLETED 🎉'
                                : lang === 'VI'
                                ? 'CHƯA ĐÚNG, HÃY THỬ LẠI'
                                : 'INCORRECT, TRY AGAIN'}
                            </div>
                            <p className="font-serif text-xs leading-relaxed">
                              {lang === 'VI'
                                ? validationResult.messageVi
                                : validationResult.messageEn}
                            </p>
                          </div>
                        </div>

                        {validationResult.passed && (
                          nextNav ? (
                            <Button
                              type="button"
                              variant="gold"
                              size="sm"
                              onClick={() => navigate(nextNav)}
                              className="flex-shrink-0 flex items-center gap-1.5 font-bold shadow-noir-card self-end sm:self-auto"
                            >
                              <span>
                                {nextModule
                                  ? lang === 'VI'
                                    ? 'Học phần kế tiếp'
                                    : 'Next Module'
                                  : lang === 'VI'
                                  ? 'Bài tiếp theo'
                                  : 'Next Lesson'}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="gold"
                              size="sm"
                              onClick={() => navigate('/tutorials')}
                              className="flex-shrink-0 flex items-center gap-1.5 font-bold shadow-noir-card self-end sm:self-auto"
                            >
                              <span>{lang === 'VI' ? 'Về danh sách bài' : 'Back to Lessons'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* CodeMirror SQL Editor */}
                  <TutorialSQLEditor
                    value={userCode}
                    onChange={setUserCode}
                    onRunQuery={handleRunQuery}
                    onSubmit={handleSubmitEvidence}
                    onReset={handleResetQuery}
                    isQueryRunning={isQueryRunning}
                    isSubmitting={isSubmitting}
                    tables={currentLesson.tables}
                    lang={lang}
                  />

                  {/* Workbench Navigation Tabs */}
                  <div className="flex items-center gap-1.5 border-b-2 border-noir-borderDark pb-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveWorkbenchTab('result')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        activeWorkbenchTab === 'result'
                          ? 'bg-noir-blood text-noir-parchment shadow-sm'
                          : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'VI' ? 'Kết quả' : 'Results'}</span>
                      {queryResult && (
                        <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                          {queryResult.rowCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveWorkbenchTab('schema')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        activeWorkbenchTab === 'schema'
                          ? 'bg-noir-blood text-noir-parchment shadow-sm'
                          : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                      }`}
                    >
                      <DatabaseIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'VI' ? 'Cấu trúc bảng' : 'Schema'}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                        {currentLesson.tables.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveWorkbenchTab('history')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        activeWorkbenchTab === 'history'
                          ? 'bg-noir-blood text-noir-parchment shadow-sm'
                          : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{lang === 'VI' ? 'Lịch sử' : 'History'}</span>
                      {queryHistory.length > 0 && (
                        <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-blood font-bold">
                          {queryHistory.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveWorkbenchTab('notes')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        activeWorkbenchTab === 'notes'
                          ? 'bg-noir-blood text-noir-parchment shadow-sm'
                          : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                      }`}
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>{lang === 'VI' ? 'Ghi chú' : 'Notes'}</span>
                    </button>

                    {currentLesson.isOptimizationLesson && (
                      <button
                        type="button"
                        onClick={() => setActiveWorkbenchTab('explain')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                          activeWorkbenchTab === 'explain'
                            ? 'bg-noir-blood text-noir-parchment shadow-sm'
                            : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lang === 'VI' ? 'Kế hoạch EXPLAIN' : 'EXPLAIN'}</span>
                        {explainRows.length > 0 && (
                          <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                            {explainRows.length}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Workbench Tab Panes */}
                  <div>
                    {/* Tab 1: Result Table */}
                    <div className={activeWorkbenchTab === 'result' ? 'block' : 'hidden'}>
                      <TutorialResultTable
                        result={queryResult}
                        error={queryError}
                        lang={lang}
                      />
                    </div>

                    {/* Tab 2: Schema Viewer & Descriptions */}
                    {activeWorkbenchTab === 'schema' && (
                      <TutorialSchemaViewer
                        tables={currentLesson.tables}
                        lang={lang}
                        onInsertTableQuery={handleInsertTableQuery}
                      />
                    )}

                    {/* Tab 3: Query History */}
                    {activeWorkbenchTab === 'history' && (
                      <QueryHistoryPanel
                        history={queryHistory}
                        onSelectQuery={setUserCode}
                        onClearHistory={() => setQueryHistory([])}
                        lang={lang}
                      />
                    )}

                    {/* Tab 4: Detective Field Notes */}
                    {activeWorkbenchTab === 'notes' && (
                      <DetectiveNotes
                        storageKey={`tutorial_detective_notes_${currentLesson.id}`}
                        lang={lang}
                        title={lang === 'VI' ? 'SỔ TAY GHI CHÉP THÁM TỬ' : 'DETECTIVE FIELD NOTES'}
                      />
                    )}

                    {/* Tab 5: Execution Plan */}
                    {activeWorkbenchTab === 'explain' && (
                      <TutorialExplainPlan planRows={explainRows} lang={lang} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bottom Lesson Navigation (Chuyển bài) */}
        <div className="mt-8 pt-4 border-t-2 border-noir-borderDark flex items-center justify-between gap-4">
          {prevNav ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(prevNav)}
              className="flex items-center gap-1.5 font-typewriter text-xs font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{lang === 'VI' ? 'Bài trước' : 'Previous Lesson'}</span>
            </Button>
          ) : (
            <div />
          )}

          {nextNav ? (
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={() => navigate(nextNav)}
              className="flex items-center gap-1.5 font-typewriter text-xs font-bold"
            >
              <span>{lang === 'VI' ? 'Bài tiếp theo' : 'Next Lesson'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="gold"
              size="sm"
              onClick={() => navigate('/tutorials')}
              className="flex items-center gap-1.5 font-typewriter text-xs font-bold"
            >
              <span>{lang === 'VI' ? 'Hoàn thành Học Viện' : 'Complete Academy'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Quick Detective Clue & Analogy Modal */}
        <Modal
          isOpen={showAnalogyModal}
          onClose={() => setShowAnalogyModal(false)}
          title={lang === 'VI' ? 'MANH MỐI ĐIỀU TRA • GÓC NHÌN THÁM TỬ' : 'FIELD DOSSIER • DETECTIVE ANALOGY'}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <DetectiveAnalogyCard analogy={currentLesson.detectiveAnalogy} lang={lang} />
            {currentLesson.interactiveExample && (
              <div className="p-3 bg-noir-card/60 border border-noir-borderDark rounded-[3px]">
                <span className="text-[10px] font-typewriter uppercase tracking-wider text-noir-inkMuted font-bold block mb-1">
                  {lang === 'VI' ? 'CÂU LỆNH MẪU THAM KHẢO' : 'REFERENCE QUERY'}
                </span>
                <pre className="font-mono text-xs bg-noir-paper p-2.5 rounded border border-noir-border text-noir-ink font-bold overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                  {currentLesson.interactiveExample.query}
                </pre>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAnalogyModal(false)}>
                {lang === 'VI' ? 'Đóng manh mối' : 'Close Clue'}
              </Button>
            </div>
          </div>
        </Modal>
      </AnimatedPage>
    </PageWrapper>
  );
};
