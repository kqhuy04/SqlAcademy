import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tutorialApi } from '@/api/tutorial.api';
import { useAuth } from '@/hooks/useAuth';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Button } from '@/components/ui/Button';
import { TUTORIAL_MODULES } from '@/data/tutorialData';
import { useLanguageStore } from '@/store/languageStore';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Layers,
} from 'lucide-react';

const cleanModuleTitle = (title: string) => title.replace(/^(Học phần|Module)\s*\d+:\s*/i, '');

export const TutorialListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguageStore();

  // Fetch user progress from BE if authenticated
  const { data: progressData } = useQuery({
    queryKey: ['tutorial_progress'],
    queryFn: tutorialApi.getProgress,
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  // Calculate completed lessons set
  const completedLessonIds = useMemo(() => {
    const set = new Set<string>();
    if (progressData && Array.isArray(progressData)) {
      progressData.forEach((p) => set.add(p.lessonId));
    } else {
      // Fallback to local storage for guests
      try {
        const local = JSON.parse(localStorage.getItem('tutorial_completed_lessons') || '[]');
        local.forEach((id: string) => set.add(id));
      } catch {
        // ignore
      }
    }
    return set;
  }, [progressData]);

  // Track collapsed status of each module
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const toggleModuleCollapse = (moduleId: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const allCollapsed = useMemo(() => {
    return TUTORIAL_MODULES.every((m) => collapsedModules[m.id]);
  }, [collapsedModules]);

  const toggleAllModules = () => {
    const nextState = !allCollapsed;
    const updated: Record<string, boolean> = {};
    TUTORIAL_MODULES.forEach((m) => {
      updated[m.id] = nextState;
    });
    setCollapsedModules(updated);
  };

  const handleStartLesson = (moduleId: string, lessonId?: string) => {
    if (lessonId) {
      navigate(`/tutorials/${moduleId}/${lessonId}`);
      return;
    }
    // Find first uncompleted lesson in module
    const targetModule = TUTORIAL_MODULES.find((m) => m.id === moduleId);
    if (!targetModule) return;
    const nextUncompleted = targetModule.lessons.find((l) => !completedLessonIds.has(l.id));
    const targetLessonId = nextUncompleted ? nextUncompleted.id : targetModule.lessons[0].id;
    navigate(`/tutorials/${moduleId}/${targetLessonId}`);
  };

  return (
    <PageWrapper>
      <AnimatedPage>
        {/* Header Section */}
        <div className="mb-8 border-b-2 border-noir-borderDark pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-noir-ink tracking-tight uppercase">
              {lang === 'VI' ? 'Học Viện Thám Tử' : 'Detective Academy'}
            </h1>
            <p className="text-xs sm:text-sm font-serif text-noir-inkMuted mt-1 max-w-xl italic">
              {lang === 'VI'
                ? '“Lộ trình huấn luyện SQL từ căn bản đến tối ưu hóa truy vấn chuyên sâu.”'
                : '“From SQL fundamentals to advanced query optimization with zero setup.”'}
            </p>
          </div>
        </div>

        {/* Module Directory Controls */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-typewriter uppercase tracking-wider text-noir-inkMuted font-bold">
            {lang === 'VI' ? 'DANH SÁCH HỌC PHẦN' : 'MODULE DIRECTORY'}
          </span>
          <button
            type="button"
            onClick={toggleAllModules}
            className="text-xs font-typewriter text-noir-blood hover:text-noir-bloodDark font-bold flex items-center gap-1.5 px-3 py-1 rounded border border-noir-borderDark/60 bg-noir-card hover:bg-noir-paper transition-colors shadow-noir-xs"
          >
            {allCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>{lang === 'VI' ? 'Mở tất cả' : 'Expand All'}</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>{lang === 'VI' ? 'Thu gọn' : 'Collapse All'}</span>
              </>
            )}
          </button>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {TUTORIAL_MODULES.map((module) => {
            const completedInModule = module.lessons.filter((l) =>
              completedLessonIds.has(l.id)
            ).length;
            const isModuleComplete = completedInModule === module.lessons.length;
            const progressRatio = Math.round(
              (completedInModule / module.lessons.length) * 100
            );
            const isCollapsed = Boolean(collapsedModules[module.id]);

            return (
              <div
                key={module.id}
                className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] shadow-noir-card overflow-hidden transition-all hover:border-noir-blood"
              >
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleModuleCollapse(module.id)}
                  className={`bg-noir-card px-5 py-4 cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-noir-card/80 ${
                    !isCollapsed ? 'border-b-2 border-noir-borderDark' : ''
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-[3px] border-2 flex items-center justify-center flex-shrink-0 ${
                        isModuleComplete
                          ? 'bg-emerald-900/20 border-emerald-700 text-emerald-800'
                          : 'bg-noir-paper border-noir-borderDark text-noir-blood'
                      }`}
                    >
                      {isModuleComplete ? (
                        <ShieldCheck className="w-6 h-6 text-emerald-700" />
                      ) : (
                        <Layers className="w-5 h-5 text-noir-blood" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-typewriter font-bold tracking-wider text-noir-blood bg-noir-blood/10 px-2 py-0.5 rounded border border-noir-blood/30 uppercase">
                          {lang === 'VI' ? 'HỌC PHẦN' : 'MODULE'} 0{module.orderIndex}
                        </span>
                        {isModuleComplete && (
                          <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-700/30">
                            {lang === 'VI' ? 'ĐÃ HOÀN THÀNH' : 'COMPLETED'}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-lg font-display font-black text-noir-ink">
                        {cleanModuleTitle(lang === 'VI' ? module.titleVi : module.titleEn)}
                      </h2>
                    </div>
                  </div>

                  {/* Module Action & Progress */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[200px]">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-noir-ink">
                        {completedInModule} / {module.lessons.length}{' '}
                        {lang === 'VI' ? 'bài' : 'lessons'}
                      </div>
                      <div className="w-28 h-2 bg-noir-card border border-noir-border rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-noir-blood transition-all duration-300"
                          style={{ width: `${progressRatio}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={isModuleComplete ? 'outline' : 'gold'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartLesson(module.id);
                      }}
                      className="flex items-center gap-1.5 font-bold"
                    >
                      <span>
                        {isModuleComplete
                          ? lang === 'VI'
                            ? 'Ôn tập'
                            : 'Review'
                          : lang === 'VI'
                          ? 'Tiếp tục học'
                          : 'Continue'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModuleCollapse(module.id);
                      }}
                      className="p-1.5 rounded border border-noir-borderDark/80 hover:border-noir-blood text-noir-inkMuted hover:text-noir-blood bg-noir-paper hover:bg-noir-card transition-all"
                      title={
                        isCollapsed
                          ? lang === 'VI'
                            ? 'Mở rộng học phần'
                            : 'Expand module'
                          : lang === 'VI'
                          ? 'Thu gọn học phần'
                          : 'Collapse module'
                      }
                      aria-label={
                        isCollapsed
                          ? 'Expand module'
                          : 'Collapse module'
                      }
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-noir-ink" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-noir-ink" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Lessons Checklist Grid */}
                {!isCollapsed && (
                  <div className="p-4 divide-y divide-noir-border">
                    {module.lessons.map((lesson) => {
                      const isDone = completedLessonIds.has(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleStartLesson(module.id, lesson.id)}
                          className="py-2.5 px-3 flex items-center justify-between gap-3 hover:bg-noir-card/40 cursor-pointer rounded-[2px] transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isDone && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                            )}
                            <div className="text-xs sm:text-sm font-semibold text-noir-ink group-hover:text-noir-blood transition-colors flex items-center gap-2 truncate">
                              <span className="truncate">
                                {lang === 'VI' ? lesson.titleVi : lesson.titleEn}
                              </span>
                              {lesson.isOptimizationLesson && (
                                <span className="text-[9px] font-mono text-amber-800 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-700/30 flex-shrink-0">
                                  {lang === 'VI' ? 'Tối ưu hóa' : 'Optimization'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-950/10 px-2 py-0.5 rounded border border-amber-700/20">
                              +{lesson.xpReward} ⭐
                            </span>
                            <ChevronRight className="w-4 h-4 text-noir-inkMuted group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AnimatedPage>
    </PageWrapper>
  );
};
