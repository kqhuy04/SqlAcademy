import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { caseApi } from '@/api/case.api';
import { userApi } from '@/api/user.api';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageStore } from '@/store/languageStore';
import { useGameplayStore } from '@/store/gameplayStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { SQLEditor } from '@/components/case/SQLEditor';
import { ResultTable } from '@/components/case/ResultTable';
import { HintPanel } from '@/components/case/HintPanel';
import { TableSchemaViewer } from '@/components/case/TableSchemaViewer';
import { EvidenceBoard } from '@/components/case/EvidenceBoard';
import { CaseSuccessModal } from '@/components/case/CaseSuccessModal';
import { SubscribeModal } from '@/components/case/SubscribeModal';
import { DetectiveNotes } from '@/components/common/DetectiveNotes';
import { QueryHistoryPanel, type QueryHistoryItem } from '@/components/common/QueryHistoryPanel';
import { DifficultyBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { calculateScorePreview } from '@/utils/scoreUtils';
import {
  FileText,
  HelpCircle,
  Send,
  Languages,
  CheckCircle2,
  ChevronLeft,
  Calculator,
  AlertCircle,
  Tag,
  BookOpen,
  Award,
  Table as TableIcon,
  Database,
  History,
  FileEdit,
  Pin,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const caseId = Number(id);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { lang, setLang } = useLanguageStore();
  const [answerInput, setAnswerInput] = useState('');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<'result' | 'board' | 'schema' | 'history' | 'notes'>('result');
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [unlockedHintTexts, setUnlockedHintTexts] = useState<Record<string, string>>({});
  const [isUnlockingHint, setIsUnlockingHint] = useState(false);

  // Success modal state
  const [successModalState, setSuccessModalState] = useState<{
    isOpen: boolean;
    scoreEarned: number;
  }>({
    isOpen: false,
    scoreEarned: 0,
  });

  // Gameplay store
  const {
    hintsUsed,
    revealedHints,
    attempts,
    sqlQuery,
    queryResult,
    queryError,
    isQueryRunning,
    isSubmitting,
    revealHint,
    incrementAttempts,
    setSqlQuery,
    setQueryResult,
    setQueryRunning,
    setSubmitting,
    resetSession,
  } = useGameplayStore();

  // Fetch case detail
  const {
    data: caseData,
    isLoading: isCaseLoading,
    error: caseError,
    refetch: refetchCase,
  } = useQuery({
    queryKey: ['case_detail', caseId],
    queryFn: () => caseApi.getCaseDetail(caseId),
    enabled: !isNaN(caseId),
    retry: false,
  });

  // Fetch user progress
  const {
    data: userProgress,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ['user_progress'],
    queryFn: userApi.getProgress,
  });

  // Fetch case tables & columns metadata
  const {
    data: tablesData,
    isLoading: isTablesLoading,
  } = useQuery({
    queryKey: ['case_tables', caseId],
    queryFn: () => caseApi.getCaseTables(caseId),
    enabled: !isNaN(caseId),
    retry: false,
  });

  const caseTables = useMemo(() => tablesData?.tables || [], [tablesData]);

  const schemaRef = useRef<HTMLDivElement>(null);

  const handleScrollToSchema = useCallback(() => {
    setActiveWorkbenchTab('schema');
    toast.success(lang === 'VI' ? 'Đã mở hồ sơ cấu trúc bảng' : 'Switched to Evidence Schema');
  }, [lang]);

  const handleInsertTableQuery = useCallback(
    (tableName: string) => {
      setSqlQuery(`SELECT * FROM ${tableName} LIMIT 10;\n`);
      setActiveWorkbenchTab('result');
      toast.success(`Generated query template for "${tableName}"`);
    },
    [setSqlQuery]
  );

  const handleInsertColumnName = useCallback(
    (columnName: string) => {
      setSqlQuery(sqlQuery ? `${sqlQuery} ${columnName}` : columnName);
      toast.success(`Inserted "${columnName}" into query`);
    },
    [sqlQuery, setSqlQuery]
  );

  // Catch subscription errors from API (403 or 404 SubscriptionNotPurchased)
  useEffect(() => {
    if (caseError) {
      const status = (caseError as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg = (caseError as { response?: { data?: { message?: string } } })?.response?.data?.message || '';
      if (status === 403 || (status === 404 && msg.toLowerCase().includes('subcription'))) {
        setShowSubscribeModal(true);
      }
    }
  }, [caseError]);

  const questions = useMemo(() => caseData?.caseQuestionDTOList || [], [caseData]);
  const currentQuestion = questions[currentQuestionIndex];

  // Set initial template query when question changes
  useEffect(() => {
    resetSession('SELECT * FROM ');
    setAnswerInput('');
  }, [caseId, currentQuestionIndex, caseData?.title, resetSession]);

  // Check if current question has already been solved by this user
  const isQuestionAlreadyDone = useMemo(() => {
    if (!userProgress || !currentQuestion) return false;
    return userProgress.some(
      (p) => p.questionId === currentQuestion.id && (p.status === 'COMPLETED' || Boolean(p.completedAt))
    );
  }, [userProgress, currentQuestion]);

  // Real-time score preview
  const baseScore = caseData?.baseScore || 100;
  const scorePreview = calculateScorePreview(baseScore, hintsUsed, attempts);

  // Run SQL query
  const handleRunQuery = useCallback(async () => {
    if (!sqlQuery.trim()) {
      toast.error('Please enter an SQL query before executing');
      return;
    }

    try {
      setQueryRunning(true);
      incrementAttempts();

      const response = await caseApi.runQuery({
        caseId,
        questionId: currentQuestion?.id,
        query: sqlQuery.trim(),
      });

      const rows = response.result || response.rows || [];
      setQueryResult(rows, null);
      setActiveWorkbenchTab('result');

      // Record to query history with snapshot
      setQueryHistory((prev) => [
        {
          id: `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          query: sqlQuery.trim(),
          status: 'SUCCESS',
          rowCount: rows.length,
          resultData: rows,
        },
        ...prev.slice(0, 29),
      ]);

      if (rows.length === 0) {
        toast('No records matched your search criteria.', { icon: '🔍' });
      } else {
        toast.success(`Successfully retrieved ${rows.length} forensic rows!`);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'SQL query execution error';
      setQueryResult(null, errorMsg);
      setActiveWorkbenchTab('result');

      // Record error to query history
      setQueryHistory((prev) => [
        {
          id: `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          query: sqlQuery.trim(),
          status: 'ERROR',
          errorMessage: errorMsg,
        },
        ...prev.slice(0, 29),
      ]);

      toast.error('Query failed. View error log in the transcript below.');
    } finally {
      setQueryRunning(false);
    }
  }, [sqlQuery, caseId, setQueryRunning, incrementAttempts, setQueryResult, currentQuestion]);

  // Reveal Hint via backend API for anti-cheat tracking
  const handleRevealHint = useCallback(
    async (hintNumber: number) => {
      if (revealedHints.includes(hintNumber) || !currentQuestion || isUnlockingHint) return;
      try {
        setIsUnlockingHint(true);
        const res = await caseApi.unlockHint({
          caseId,
          questionId: currentQuestion.id,
          hintNumber,
        });
        setUnlockedHintTexts((prev) => ({
          ...prev,
          [`${currentQuestion.id}-${hintNumber}`]: res.hintText,
        }));
        revealHint(hintNumber);
        toast.success(`Unlocked Envelope ${hintNumber}! (-20% score penalty applied)`);
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to unlock clue. Please check network connection.';
        toast.error(errorMsg);
      } finally {
        setIsUnlockingHint(false);
      }
    },
    [revealedHints, currentQuestion, caseId, isUnlockingHint, revealHint]
  );

  // Submit Answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim()) {
      toast.error('Please enter the forensic evidence value before submitting');
      return;
    }

    if (!currentQuestion) {
      toast.error('Question details not found');
      return;
    }

    try {
      setSubmitting(true);
      const res = await caseApi.submitAnswer({
        caseId,
        questionId: currentQuestion.id,
        answer: answerInput.trim(),
      });

      if (res.correct) {
        setSuccessModalState({
          isOpen: true,
          scoreEarned: res.scoreEarned,
        });
        await refetchProgress();
        await refreshProfile();
      } else if (res.message === 'Already completed') {
        toast.success('You have already solved this lead previously!');
      } else {
        toast.error('Submitted evidence is incorrect! Inspect your query results again.', {
          icon: '❌',
        });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error submitting evidence verification';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const hasNextQuestion = currentQuestionIndex < questions.length - 1;

  const handleNextQuestion = () => {
    setSuccessModalState({ isOpen: false, scoreEarned: 0 });
    if (hasNextQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToCases = () => {
    setSuccessModalState({ isOpen: false, scoreEarned: 0 });
    navigate('/cases');
  };

  if (isCaseLoading) {
    return (
      <PageWrapper fullWidth>
        <div className="h-[70vh] flex items-center justify-center">
          <Spinner size="lg" label="DECIPHERING CRIME CASE DOSSIER..." />
        </div>
      </PageWrapper>
    );
  }

  if (caseError || !caseData) {
    return (
      <PageWrapper>
        <div className="max-w-lg mx-auto bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-8 text-center my-12 shadow-noir-lift">
          <AlertCircle className="w-12 h-12 text-noir-blood mx-auto mb-3" />
          <h2 className="text-xl font-display font-bold text-noir-ink mb-2 uppercase">Access Restricted • Classified Dossier</h2>
          <p className="text-xs font-serif italic text-noir-inkMuted mb-6">
            This investigation file is strictly classified or requires Special Investigator clearance (Premium).
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/cases')}>
              Return to Case Files
            </Button>
            <Button variant="gold" onClick={() => setShowSubscribeModal(true)}>
              Issue Clearance Now
            </Button>
          </div>
        </div>

        <SubscribeModal
          isOpen={showSubscribeModal}
          onClose={() => setShowSubscribeModal(false)}
          onSuccess={() => refetchCase()}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper fullWidth className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Top Breadcrumb & Case Identity Bar */}
      <div className="mb-6 bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-noir-card">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/cases')}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            {lang === 'VI' ? 'Danh Sách Án' : 'Case Files'}
          </Button>

          <div className="h-6 w-px bg-noir-borderDark" />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-typewriter text-xs font-bold text-noir-blood uppercase tracking-wider">
                {lang === 'VI' ? 'VỤ ÁN' : 'CASE'} #{String(caseData.orderIndex || caseData.id).padStart(2, '0')}
              </span>
              <DifficultyBadge difficulty={caseData.difficulty} />
              {caseData.badgeName && (
                <Badge variant="gold" size="sm" className="gap-1.5 font-typewriter">
                  <Award className="w-3.5 h-3.5 text-noir-candle" />
                  <span>{caseData.badgeName.toUpperCase()}</span>
                </Badge>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-display font-black text-noir-ink tracking-tight mt-0.5">
              {caseData.title}
            </h1>
          </div>
        </div>

        {/* Question Switcher & Score Preview Pill */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Question pagination if multiple */}
          {questions.length > 1 && (
            <div className="flex items-center gap-1 bg-noir-card border border-noir-borderDark px-2 py-1 rounded-[2px] text-xs font-typewriter">
              <span className="text-noir-inkMuted mr-1 font-bold">{lang === 'VI' ? 'ĐẦU MỐI:' : 'LEAD:'}</span>
              {questions.map((q, idx) => (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-6 h-6 rounded-[2px] flex items-center justify-center font-bold transition-colors ${
                    currentQuestionIndex === idx
                      ? 'bg-noir-blood text-noir-parchment font-bold'
                      : 'text-noir-ink hover:bg-noir-cardHover'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Real-time score preview */}
          <div
            className="flex items-center gap-2 bg-noir-card border border-noir-borderDark px-3 py-1.5 rounded-[3px] text-xs font-typewriter shadow-inner shadow-noir-ink/5"
            title={
              lang === 'VI'
                ? 'Điểm dự kiến sau khi trừ gợi ý (-20%/lần) và số lần chạy truy vấn'
                : 'Projected score after hint deductions (-20% each) and query attempts (-10% each additional attempt)'
            }
          >
            <Calculator className="w-3.5 h-3.5 text-noir-candleDark" />
            <span className="text-noir-inkMuted font-bold">{lang === 'VI' ? 'DỰ KIẾN:' : 'PROJECTED:'}</span>
            <span className="font-bold text-noir-candleDark text-sm">{scorePreview}</span>
            <span className="text-noir-inkMuted font-bold">/ {baseScore}</span>
          </div>

          {/* Bilingual Language Toggle */}
          <button
            onClick={() => setLang(lang === 'EN' ? 'VI' : 'EN')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] text-xs font-typewriter bg-noir-card border border-noir-borderDark text-noir-ink hover:border-noir-blood transition-colors font-bold uppercase cursor-pointer"
            title={lang === 'VI' ? 'Chuyển sang English' : 'Chuyển sang Tiếng Việt'}
          >
            <Languages className="w-3.5 h-3.5 text-noir-blood" />
            <span>{lang === 'EN' ? 'ENGLISH' : 'TIẾNG VIỆT'}</span>
          </button>
        </div>
      </div>

      {/* Main Gameplay Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT PANEL: 40% (Narrative, Question, Hints) ================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Narrative / Crime Scene Context */}
          <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-5 space-y-3 shadow-noir-card">
            <div className="flex items-center gap-2 text-xs font-typewriter uppercase tracking-wider text-noir-blood font-bold pb-2 border-b-2 border-noir-borderDark">
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'VI' ? 'HỒ SƠ VỤ ÁN' : 'CASE BRIEFING'}</span>
            </div>
            <p className="text-sm font-serif text-noir-ink leading-relaxed whitespace-pre-line italic">
              {caseData.description}
            </p>
          </div>

          {/* Active Question Box */}
          {currentQuestion && (
            <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-5 space-y-4 relative overflow-hidden shadow-noir-card">
              <div className="absolute top-0 right-0 left-0 h-1 bg-noir-blood" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-typewriter font-bold text-noir-blood uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>
                    {lang === 'VI'
                      ? `CÂU HỎI #${currentQuestionIndex + 1} / ${questions.length}`
                      : `QUESTION #${currentQuestionIndex + 1} / ${questions.length}`}
                  </span>
                </div>

                {isQuestionAlreadyDone && (
                  <span className="flex items-center gap-1 text-[10.5px] font-typewriter text-noir-stamp bg-noir-stamp/10 px-2 py-0.5 rounded-[2px] border border-dashed border-noir-stamp font-bold uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {lang === 'VI' ? 'ĐÃ PHÁ GIẢI' : 'CRACKED'}
                  </span>
                )}
              </div>

              {/* Question Text */}
              <div className="p-4 bg-[#FAF6EC] border-2 border-noir-borderDark/60 rounded-[3px] text-sm text-noir-ink font-serif leading-relaxed shadow-inner shadow-noir-ink/5">
                {lang === 'EN'
                  ? currentQuestion.questionEn || currentQuestion.questionVi
                  : currentQuestion.questionVi || currentQuestion.questionEn}
              </div>

              {/* Skill Tags */}
              {currentQuestion.skillTags && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 font-typewriter">
                  <Tag className="w-3.5 h-3.5 text-noir-inkMuted" />
                  <span className="text-[11px] text-noir-inkMuted mr-1 font-bold">
                    {lang === 'VI' ? 'Kỹ năng:' : 'Skills:'}
                  </span>
                  {currentQuestion.skillTags.split(',').map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-typewriter bg-noir-card text-noir-blood px-2 py-0.5 rounded-[2px] border border-noir-borderDark font-bold uppercase"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hint Panel */}
          {currentQuestion && (
            <HintPanel
              hasHint1={currentQuestion.hasHint1}
              hasHint2={currentQuestion.hasHint2}
              hasHint3={currentQuestion.hasHint3}
              hint1={unlockedHintTexts[`${currentQuestion.id}-1`] || currentQuestion.hint1}
              hint2={unlockedHintTexts[`${currentQuestion.id}-2`] || currentQuestion.hint2}
              hint3={unlockedHintTexts[`${currentQuestion.id}-3`] || currentQuestion.hint3}
              revealedHints={revealedHints}
              onRevealHint={handleRevealHint}
              isUnlocking={isUnlockingHint}
            />
          )}
        </div>

        {/* ================= RIGHT PANEL: 60% (SQL Editor, Workbench Tabs, Submit) ================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* SQL Editor */}
          <SQLEditor
            value={sqlQuery}
            onChange={setSqlQuery}
            onRunQuery={handleRunQuery}
            isLoading={isQueryRunning}
            caseId={caseId}
            tables={caseTables}
            onScrollToSchema={handleScrollToSchema}
          />

          {/* Workbench Tabs Navigation */}
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
              <span>{lang === 'EN' ? 'Results' : 'Kết quả'}</span>
              {queryResult && (
                <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                  {queryResult.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkbenchTab('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider font-bold transition-all cursor-pointer ${
                activeWorkbenchTab === 'board'
                  ? 'bg-noir-blood text-noir-parchment shadow-sm'
                  : 'bg-noir-card text-noir-inkMuted hover:text-noir-ink'
              }`}
            >
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'EN' ? 'Evidence' : 'Bằng chứng'}</span>
              {caseTables.length > 0 && (
                <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                  {caseTables.length}
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
              <Database className="w-3.5 h-3.5" />
              <span>{lang === 'EN' ? 'Schema' : 'Cấu trúc bảng'}</span>
              {caseTables.length > 0 && (
                <span className="text-[10px] font-mono px-1 rounded bg-noir-paper text-noir-ink font-bold">
                  {caseTables.length}
                </span>
              )}
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
              <span>{lang === 'EN' ? 'History' : 'Lịch sử'}</span>
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
              <span>{lang === 'EN' ? 'Notes' : 'Ghi chú'}</span>
            </button>
          </div>

          {/* Workbench Tab Content */}
          <div>
            {/* Tab 1: Result Table */}
            <div className={activeWorkbenchTab === 'result' ? 'block' : 'hidden'}>
              <ResultTable
                data={queryResult}
                error={queryError}
                isLoading={isQueryRunning}
                attempts={attempts}
              />
            </div>

            {/* Tab 2: Evidence Board (Corkboard with Red Yarn Links) */}
            {activeWorkbenchTab === 'board' && (
              <div>
                <EvidenceBoard
                  tables={caseTables}
                  isLoading={isTablesLoading}
                  lang={lang}
                  onInsertTableQuery={handleInsertTableQuery}
                  onInsertColumnName={handleInsertColumnName}
                />
              </div>
            )}

            {/* Tab 3: Table Schema & Descriptions */}
            {activeWorkbenchTab === 'schema' && (
              <div ref={schemaRef}>
                <TableSchemaViewer
                  tables={caseTables}
                  isLoading={isTablesLoading}
                  lang={lang}
                  onInsertTableQuery={handleInsertTableQuery}
                  onInsertColumnName={handleInsertColumnName}
                />
              </div>
            )}

            {/* Tab 3: Query History */}
            {activeWorkbenchTab === 'history' && (
              <QueryHistoryPanel
                history={queryHistory}
                onSelectQuery={setSqlQuery}
                onClearHistory={() => setQueryHistory([])}
                lang={lang}
              />
            )}

            {/* Tab 4: Detective Notes */}
            {activeWorkbenchTab === 'notes' && (
              <DetectiveNotes
                storageKey={`case_investigation_notes_${caseId}`}
                lang={lang}
              />
            )}
          </div>

          {/* Submit Answer Bar */}
          <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-5 space-y-3 shadow-noir-card">
            <div className="flex items-center justify-between pb-2 border-b-2 border-noir-borderDark">
              <div className="flex items-center gap-2 text-xs font-typewriter font-bold uppercase tracking-wider text-noir-blood">
                <FileText className="w-4 h-4" />
                <span>{lang === 'VI' ? 'NỘP CÂU TRẢ LỜI' : 'SUBMIT ANSWER'}</span>
              </div>
              <span className="text-[11px] font-typewriter text-noir-inkMuted">
                {lang === 'VI' ? 'Điểm thưởng:' : 'Reward:'}{' '}
                <strong className="text-noir-blood">+{caseData.baseScore} ⭐</strong>
              </span>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1">
                  <Input
                    placeholder={
                      lang === 'VI'
                        ? 'Nhập kết quả tìm được (tên, IP, số tài khoản, mã số...)'
                        : 'Enter answer (name, IP, account, ID...)'
                    }
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    className="font-mono text-sm"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  isLoading={isSubmitting}
                  className="sm:w-44 shrink-0 shadow-noir-card"
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {lang === 'VI' ? 'Nộp bài' : 'Submit'}
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-typewriter text-noir-inkMuted">
                <span>
                  {lang === 'VI'
                    ? '* Không phân biệt chữ hoa hay chữ thường.'
                    : '* Case-insensitive.'}
                </span>
                {isQuestionAlreadyDone && (
                  <span className="text-noir-stamp font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                    {lang === 'VI' ? 'Đầu mối này đã được phá giải thành công' : 'This lead has already been cracked'}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Celebration Modal */}
      <CaseSuccessModal
        isOpen={successModalState.isOpen}
        scoreEarned={successModalState.scoreEarned}
        hasNextQuestion={hasNextQuestion}
        badgeName={caseData.badgeName}
        badgeIcon={caseData.badgeIcon}
        onNextQuestion={handleNextQuestion}
        onBackToCases={handleBackToCases}
      />

      {/* Subscribe Modal fallback */}
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        onSuccess={() => refetchCase()}
      />
    </PageWrapper>
  );
};
