import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { caseApi } from '@/api/case.api';
import { userApi } from '@/api/user.api';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageStore } from '@/store/languageStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { CaseCard } from '@/components/case/CaseCard';
import { SubscribeModal } from '@/components/case/SubscribeModal';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  Filter,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  FolderGit2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PremiumCaseDTO } from '@/types/case.types';

export const CaseListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguageStore();
  const { isAuthenticated } = useAuth();

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNSOLVED' | 'SOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [showSubscribeModal, setShowSubscribeModal] = useState<boolean>(
    Boolean((location.state as { showPremiumModal?: boolean })?.showPremiumModal)
  );

  // Close dropdown popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pagination & Query case list
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: caseListData,
    isLoading: isCasesLoading,
    error: casesError,
    refetch: refetchCases,
  } = useQuery({
    queryKey: ['premium_cases', currentPage],
    queryFn: () => caseApi.getCaseList({ page: currentPage - 1, size: ITEMS_PER_PAGE }),
  });

  // Query user progress (only when authenticated)
  const {
    data: progressData,
    refetch: refetchProgress,
  } = useQuery({
    queryKey: ['user_progress'],
    queryFn: userApi.getProgress,
    enabled: isAuthenticated,
  });

  // Map progress by caseId
  const progressMap = useMemo(() => {
    const map = new Map<number, { completedCount: number; totalScore: number }>();
    if (!progressData) return map;

    for (const item of progressData) {
      const isDone = item.status === 'COMPLETED' || Boolean(item.completedAt);
      if (isDone) {
        const current = map.get(item.caseId) || { completedCount: 0, totalScore: 0 };
        map.set(item.caseId, {
          completedCount: current.completedCount + 1,
          totalScore: current.totalScore + (item.scoreEarned || 0),
        });
      }
    }
    return map;
  }, [progressData]);

  const cases = caseListData?.premiumCaseDTOList || [];

  // Filter & Search (by difficulty, completion status, title and description)
  const filteredCases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return cases.filter((c) => {
      const matchesDifficulty =
        selectedDifficulty === 'ALL' || c.difficulty.toUpperCase() === selectedDifficulty;

      const progress = progressMap.get(c.id) || { completedCount: 0, totalScore: 0 };
      const isCompleted =
        (c.questionCount || 1) > 0 && progress.completedCount >= (c.questionCount || 1);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'SOLVED' && isCompleted) ||
        (statusFilter === 'UNSOLVED' && !isCompleted);

      if (!matchesDifficulty || !matchesStatus) return false;

      if (!query) return true;

      const matchesTitle = c.title.toLowerCase().includes(query);
      const matchesDesc = c.description.toLowerCase().includes(query);

      return matchesTitle || matchesDesc;
    });
  }, [cases, selectedDifficulty, statusFilter, searchQuery, progressMap]);

  // Reset to page 1 on filter or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDifficulty, statusFilter, searchQuery]);

  const hasActiveFilter = selectedDifficulty !== 'ALL' || statusFilter !== 'ALL';

  const totalPages = Math.max(1, caseListData?.totalPages ?? 1);
  const totalElements = caseListData?.totalElements ?? cases.length;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCases = filteredCases;

  const handleCaseSelect = (selectedCase: PremiumCaseDTO) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/cases/${selectedCase.id}` } } });
      return;
    }
    if (!selectedCase.isUnlocked) {
      setShowSubscribeModal(true);
    } else {
      navigate(`/cases/${selectedCase.id}`);
    }
  };

  const difficultyLabels: Record<string, { VI: string; EN: string }> = {
    ALL: { VI: 'TẤT CẢ CẤP ĐỘ', EN: 'ALL LEVELS' },
    EASY: { VI: 'CƠ BẢN (EASY)', EN: 'EASY' },
    MEDIUM: { VI: 'TRUNG BÌNH (MEDIUM)', EN: 'MEDIUM' },
    HARD: { VI: 'NÂNG CAO (HARD)', EN: 'HARD' },
    EXPERT: { VI: 'CHUYÊN GIA (EXPERT)', EN: 'EXPERT' },
  };

  const statusLabels: Record<string, { VI: string; EN: string }> = {
    ALL: { VI: 'TẤT CẢ TRẠNG THÁI', EN: 'ALL STATUS' },
    UNSOLVED: { VI: 'CHƯA PHÁ ÁN', EN: 'UNSOLVED' },
    SOLVED: { VI: 'ĐÃ PHÁ ÁN', EN: 'SOLVED' },
  };

  return (
    <PageWrapper>
      <AnimatedPage>
        {/* Header Banner */}
        <div className="mb-8 border-b-2 border-noir-borderDark pb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-noir-ink tracking-tight uppercase">
            {lang === 'VI' ? 'Hồ Sơ Trọng Án' : 'Major Felony Cases'}
          </h1>
          <p className="text-xs sm:text-sm font-serif text-noir-inkMuted mt-1 max-w-xl italic">
            {lang === 'VI'
              ? '“Truy vấn cơ sở dữ liệu tội phạm và thực thi lệnh khám xét SQL để phá án.”'
              : '“Investigate crime databases and execute SQL warrants to solve cases.”'}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-8 flex items-center gap-3 bg-noir-paper p-3 rounded-[4px] border-2 border-noir-borderDark shadow-noir-sm">
          {/* Search box */}
          <div className="flex-1">
            <Input
              placeholder={
                lang === 'VI'
                  ? 'Tìm kiếm tên vụ án, manh mối điều tra...'
                  : 'Search case titles, clues, keywords...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-noir-inkMuted" />}
              className="h-10 text-xs"
            />
          </div>

          {/* Unified Filter Button (icon only) & Combined Popover */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              title={lang === 'VI' ? 'Bộ lọc hồ sơ' : 'Filter dossiers'}
              aria-label={lang === 'VI' ? 'Bộ lọc hồ sơ' : 'Filter dossiers'}
              className={cn(
                'relative h-10 w-10 rounded-[3px] border-2 flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer',
                hasActiveFilter
                  ? 'bg-noir-blood text-noir-parchment border-noir-blood'
                  : 'bg-noir-card/70 hover:bg-noir-card text-noir-ink border-noir-borderDark'
              )}
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilter && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-noir-candle border-2 border-noir-paper" />
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-noir-paper border-2 border-noir-borderDark rounded-[3px] shadow-noir-modal p-3 z-40 font-typewriter">
                {/* Section 1: Level / Difficulty */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-bold text-noir-inkMuted tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{lang === 'VI' ? 'Cấp độ vụ án' : 'Difficulty'}</span>
                    <span className="text-[9px] text-noir-blood font-bold">
                      {difficultyLabels[selectedDifficulty]?.[lang]}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {['ALL', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'].map((diff) => {
                      const isSelected = selectedDifficulty === diff;
                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setSelectedDifficulty(diff)}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 text-xs rounded-[2px] flex items-center justify-between transition-colors uppercase font-bold',
                            isSelected
                              ? 'bg-noir-blood/10 text-noir-blood font-black'
                              : 'text-noir-ink hover:bg-noir-card/80'
                          )}
                        >
                          <span>{difficultyLabels[diff]?.[lang] || diff}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-noir-blood shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Divider */}
                <div className="border-t border-noir-borderDark/50 my-2" />

                {/* Section 2: Progress Status */}
                <div className="mb-2">
                  <div className="text-[10px] uppercase font-bold text-noir-inkMuted tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{lang === 'VI' ? 'Tiến độ điều tra' : 'Investigation Status'}</span>
                    <span className="text-[9px] text-noir-stamp font-bold">
                      {statusLabels[statusFilter]?.[lang]}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {(['ALL', 'UNSOLVED', 'SOLVED'] as const).map((st) => {
                      const isSelected = statusFilter === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 text-xs rounded-[2px] flex items-center justify-between transition-colors uppercase font-bold',
                            isSelected
                              ? 'bg-noir-stamp/10 text-noir-stamp font-black'
                              : 'text-noir-ink hover:bg-noir-card/80'
                          )}
                        >
                          <span>{statusLabels[st]?.[lang] || st}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-noir-stamp shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reset Action */}
                {hasActiveFilter && (
                  <div className="pt-2 border-t border-noir-borderDark/50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDifficulty('ALL');
                        setStatusFilter('ALL');
                      }}
                      className="text-[11px] text-noir-blood hover:underline font-bold"
                    >
                      {lang === 'VI' ? 'Đặt lại bộ lọc' : 'Reset filters'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Clear Search if search query exists */}
          {searchQuery.trim() !== '' && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-noir-inkMuted hover:text-noir-blood font-typewriter underline decoration-dotted transition-colors shrink-0"
            >
              {lang === 'VI' ? 'Xóa tìm kiếm' : 'Clear search'}
            </button>
          )}
        </div>

        {/* Error State */}
        {casesError && (
          <div className="bg-noir-blood/10 border-2 border-dashed border-noir-blood rounded-[4px] p-6 text-center my-8">
            <AlertTriangle className="w-8 h-8 text-noir-blood mx-auto mb-2" />
            <h3 className="text-base font-display font-bold text-noir-ink uppercase">
              {lang === 'VI' ? 'Không Thể Truy Cập Kho Hồ Sơ' : 'Unable to Access Dossier Archives'}
            </h3>
            <p className="text-xs font-serif text-noir-inkMuted mt-1">
              {lang === 'VI'
                ? 'Vui lòng kiểm tra kết nối mạng và cơ sở dữ liệu rồi tải lại.'
                : 'Please verify your database connection or reload the application.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => refetchCases()}
            >
              {lang === 'VI' ? 'Thử Lại Kết Nối' : 'Retry Connection'}
            </Button>
          </div>
        )}

        {/* Loading Skeletons (12 cards matching 1/2/3/4 grid) */}
        {isCasesLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, idx) => (
              <div
                key={idx}
                className="bg-noir-paper border-2 border-noir-borderDark/60 rounded-[4px] p-5 h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-[3px] bg-noir-card" />
                  <div className="space-y-2 flex-1">
                    <div className="w-20 h-4 bg-noir-card rounded" />
                    <div className="w-3/4 h-5 bg-noir-card rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-noir-card rounded" />
                  <div className="w-2/3 h-3 bg-noir-card rounded" />
                </div>
                <div className="pt-3 border-t border-noir-borderDark/40 flex justify-between">
                  <div className="w-24 h-4 bg-noir-card rounded" />
                  <div className="w-16 h-4 bg-noir-card rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Case Grid (12 items per page) */}
        {!isCasesLoading && paginatedCases.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCases.map((caseItem) => {
                const progress = progressMap.get(caseItem.id) || { completedCount: 0, totalScore: 0 };
                const isCompleted =
                  (caseItem.questionCount || 1) > 0 &&
                  progress.completedCount >= (caseItem.questionCount || 1);

                return (
                  <CaseCard
                    key={caseItem.id}
                    caseData={caseItem}
                    completedQuestionsCount={progress.completedCount}
                    isCompleted={isCompleted}
                    onSelect={handleCaseSelect}
                  />
                );
              })}
            </div>

            {/* Pagination Controls Docket */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t-2 border-noir-borderDark/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-typewriter">
                <div className="text-xs text-noir-inkMuted">
                  {lang === 'VI'
                    ? `Hiển thị ${(validCurrentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                        validCurrentPage * ITEMS_PER_PAGE,
                        totalElements
                      )} trên tổng số ${totalElements} hồ sơ vụ án`
                    : `Showing ${(validCurrentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                        validCurrentPage * ITEMS_PER_PAGE,
                        totalElements
                      )} of ${totalElements} case dossiers`}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={validCurrentPage <= 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    className="disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {lang === 'VI' ? 'Trang Trước' : 'Previous'}
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={cn(
                          'w-8 h-8 rounded-[3px] text-xs font-mono font-bold transition-all border',
                          validCurrentPage === pageNum
                            ? 'bg-noir-blood text-noir-parchment border-noir-bloodDark shadow-noir-xs'
                            : 'bg-noir-card hover:bg-noir-paper border-noir-borderDark text-noir-ink'
                        )}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={validCurrentPage >= totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    className="disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {lang === 'VI' ? 'Trang Sau' : 'Next'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty Search Result */}
        {!isCasesLoading && filteredCases.length === 0 && !casesError && (
          <div className="bg-noir-paper border-2 border-dashed border-noir-borderDark rounded-[4px] p-12 text-center my-6 shadow-sm">
            <FolderGit2 className="w-10 h-10 text-noir-borderDark mx-auto mb-3" />
            <h3 className="text-base font-display font-bold text-noir-ink uppercase">
              {lang === 'VI' ? 'Không Tìm Thấy Hồ Sơ Phù Hợp' : 'No Matching Dossiers Found'}
            </h3>
            <p className="text-xs font-serif italic text-noir-inkMuted mt-1">
              {lang === 'VI'
                ? `Không có hồ sơ nào trùng khớp với từ khóa tìm kiếm “${searchQuery}”.`
                : `No case records match your query keyword “${searchQuery}”.`}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('ALL');
              }}
            >
              {lang === 'VI' ? 'Xóa Bộ Lọc Tìm Kiếm' : 'Clear Search Filters'}
            </Button>
          </div>
        )}

        {/* Subscribe Modal */}
        <SubscribeModal
          isOpen={showSubscribeModal}
          onClose={() => setShowSubscribeModal(false)}
          onSuccess={() => {
            refetchCases();
            refetchProgress();
          }}
        />
      </AnimatedPage>
    </PageWrapper>
  );
};
