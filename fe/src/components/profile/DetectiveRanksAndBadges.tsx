import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Award,
  Star,
  Lock,
  CheckCircle2,
  GitMerge,
  EyeOff,
  Zap,
  Moon,
  ShieldCheck,
  Trophy,
  FileCheck,
} from 'lucide-react';

export interface RankDefinition {
  id: string;
  level: number;
  titleEn: string;
  titleVi: string;
  minScore: number;
  icon: typeof Shield;
  color: string;
  borderColor: string;
  descEn: string;
  descVi: string;
}

export const POLICE_RANKS: RankDefinition[] = [
  {
    id: 'cadet',
    level: 1,
    titleEn: 'Police Cadet',
    titleVi: 'Học Viên Trinh Sát',
    minScore: 0,
    icon: Shield,
    color: 'from-amber-700 to-amber-900',
    borderColor: 'border-amber-800',
    descEn: 'Fresh recruit mastering fundamental SQL queries (SELECT, WHERE).',
    descVi: 'Tân binh học viện, đang rèn luyện truy vấn căn bản (SELECT, WHERE).',
  },
  {
    id: 'officer',
    level: 2,
    titleEn: 'Patrol Officer',
    titleVi: 'Sĩ Quan Tuần Tra',
    minScore: 500,
    icon: ShieldCheck,
    color: 'from-slate-600 to-slate-800',
    borderColor: 'border-slate-700',
    descEn: 'Patrol investigator proficient with multi-condition filtering & sorting.',
    descVi: 'Sĩ quan thực địa, thành thạo lọc nhiều điều kiện và sắp xếp hồ sơ.',
  },
  {
    id: 'detective',
    level: 3,
    titleEn: 'Junior Detective',
    titleVi: 'Thám Tử Hình Sự',
    minScore: 1500,
    icon: Star,
    color: 'from-amber-500 to-amber-700',
    borderColor: 'border-amber-600',
    descEn: 'Licensed detective connecting clues across tables using complex JOINs.',
    descVi: 'Thám tử chính thức, tinh thông kết nối các bảng bằng câu lệnh JOIN.',
  },
  {
    id: 'inspector',
    level: 4,
    titleEn: 'Senior Inspector',
    titleVi: 'Thanh Tra Trọng Án',
    minScore: 3500,
    icon: Award,
    color: 'from-red-700 to-red-950',
    borderColor: 'border-red-800',
    descEn: 'Master criminologist analyzing deep evidence patterns with Aggregates & Subqueries.',
    descVi: 'Chuyên gia trọng án, phân tích manh mối đa tầng với GROUP BY và Subquery.',
  },
  {
    id: 'chief',
    level: 5,
    titleEn: 'Chief of Police',
    titleVi: 'Cảnh Sát Trưởng Học Viện',
    minScore: 7000,
    icon: Trophy,
    color: 'from-amber-400 via-amber-600 to-amber-900',
    borderColor: 'border-amber-500',
    descEn: 'Supreme Bureau Commander solving cold cases with surgical precision and zero hints.',
    descVi: 'Chỉ huy tối cao học viện, giải mã mọi đại án với độ chính xác tuyệt đối.',
  },
];

export interface BadgeDefinition {
  code: string;
  titleEn: string;
  titleVi: string;
  descEn: string;
  descVi: string;
  category: 'core' | 'skill' | 'special';
  icon: typeof Award;
  iconColor: string;
  accentBg: string;
  requirementEn: string;
  requirementVi: string;
}

export const COMMENDATION_BADGES: BadgeDefinition[] = [
  {
    code: 'badge_join_master',
    titleEn: 'Master of JOINs',
    titleVi: 'Chiến Thần Móc Xích',
    descEn: 'Connected clues across 3+ tables seamlessly.',
    descVi: 'Kết nối chứng cứ qua 3 bảng dữ liệu trở lên một cách chính xác.',
    category: 'skill',
    icon: GitMerge,
    iconColor: 'text-amber-500',
    accentBg: 'bg-amber-500/10 border-amber-500/30',
    requirementEn: 'Execute 15 successful queries utilizing INNER/LEFT JOIN.',
    requirementVi: 'Thực hiện thành công 15 câu lệnh kết hợp INNER/LEFT JOIN.',
  },
  {
    code: 'badge_zero_hints',
    titleEn: 'Clean Slate Sleuth',
    titleVi: 'Bàn Tay Sạch',
    descEn: 'Solved cold cases relying solely on sharp intellect.',
    descVi: 'Phá án hoàn toàn dựa vào suy luận, không sử dụng gợi ý hỗ trợ.',
    category: 'skill',
    icon: EyeOff,
    iconColor: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10 border-emerald-500/30',
    requirementEn: 'Close 3 investigation cases with 0 hints unlocked.',
    requirementVi: 'Kết thúc 3 vụ án mà không mở bất kỳ gợi ý nào.',
  },
  {
    code: 'badge_speed_sleuth',
    titleEn: 'Speedy Interrogator',
    titleVi: 'Kính Lúp Thần Tốc',
    descEn: 'Identified the perpetrator in record time.',
    descVi: 'Xác định chính xác thủ phạm trong thời gian kỷ lục.',
    category: 'special',
    icon: Zap,
    iconColor: 'text-yellow-500',
    accentBg: 'bg-yellow-500/10 border-yellow-500/30',
    requirementEn: 'Solve a case in under 2 minutes from scene opening.',
    requirementVi: 'Phá án thành công dưới 2 phút kể từ khi mở hiện trường.',
  },
  {
    code: 'badge_night_owl',
    titleEn: 'Midnight Stalker',
    titleVi: 'Cú Đêm Phá Án',
    descEn: 'Investigated confidential evidence under the moonlight.',
    descVi: 'Tiến hành giám định hồ sơ bí mật dưới ánh trăng.',
    category: 'special',
    icon: Moon,
    iconColor: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10 border-indigo-500/30',
    requirementEn: 'Close any case during midnight hours (22:00 - 04:00).',
    requirementVi: 'Hoàn thành vụ án trong khung giờ đêm từ 22:00 đến 04:00.',
  },
  {
    code: 'badge_museum_sleuth',
    titleEn: 'Museum Sleuth',
    titleVi: 'Thám Tử Bảo Tàng',
    descEn: 'Cracked the antique artifact robbery cold case.',
    descVi: 'Phá giải kỳ án trộm cổ vật tại viện bảo tàng.',
    category: 'core',
    icon: Award,
    iconColor: 'text-amber-600',
    accentBg: 'bg-amber-600/10 border-amber-600/30',
    requirementEn: 'Successfully solve Case #01: Museum Heist.',
    requirementVi: 'Hoàn thành xuất sắc Vụ án #01: Vụ trộm bảo tàng.',
  },
  {
    code: 'badge_digital_detective',
    titleEn: 'Digital Forensic Expert',
    titleVi: 'Chuyên Gia Điện Tử',
    descEn: 'Tracked digital transactions and illegal wire transfers.',
    descVi: 'Truy vết các giao dịch điện tử và chuyển tiền phi pháp.',
    category: 'core',
    icon: Shield,
    iconColor: 'text-blue-500',
    accentBg: 'bg-blue-500/10 border-blue-500/30',
    requirementEn: 'Successfully solve Case #02: Financial Fraud.',
    requirementVi: 'Hoàn thành xuất sắc Vụ án #02: Gian lận tài chính.',
  },
];

interface DetectiveRanksAndBadgesProps {
  score: number;
  earnedBadgeCodes?: string[];
  casesSolvedCount?: number;
  lang?: 'VI' | 'EN';
}

export const DetectiveRanksAndBadges: React.FC<DetectiveRanksAndBadgesProps> = ({
  score = 0,
  earnedBadgeCodes = [],
  casesSolvedCount = 0,
  lang = 'VI',
}) => {
  const [activeTab, setActiveTab] = useState<'ranks' | 'badges'>('ranks');
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  // Determine current rank based on score
  const { currentRank, nextRank, progressPercent } = useMemo(() => {
    let current = POLICE_RANKS[0];
    let next: RankDefinition | null = POLICE_RANKS[1];

    for (let i = POLICE_RANKS.length - 1; i >= 0; i--) {
      if (score >= POLICE_RANKS[i].minScore) {
        current = POLICE_RANKS[i];
        next = POLICE_RANKS[i + 1] || null;
        break;
      }
    }

    let progress = 100;
    if (next) {
      const needed = next.minScore - current.minScore;
      const currentProgress = score - current.minScore;
      progress = Math.min(100, Math.max(0, Math.round((currentProgress / needed) * 100)));
    }

    return {
      currentRank: current,
      nextRank: next,
      progressPercent: progress,
    };
  }, [score]);

  const earnedSet = useMemo(() => new Set(earnedBadgeCodes), [earnedBadgeCodes]);

  const CurrentIcon = currentRank.icon;

  return (
    <div className="flex flex-col gap-5 p-5 bg-[#EDE3C9] rounded-xl border border-[#C4B6A0] shadow-md">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#C4B6A0]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-600 to-amber-900 text-white shadow-md border border-amber-950">
            <CurrentIcon className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-noir-ink">
                {lang === 'VI' ? 'Quân Hàm & Huân Chương' : 'Bureau Ranks & Commendations'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded font-typewriter uppercase bg-[#E2D5B8] border border-[#C4B6A0] text-noir-ink">
                Level {currentRank.level}
              </span>
            </div>
            <p className="text-xs text-noir-inkMuted font-serif italic">
              {lang === 'VI' ? currentRank.titleVi : currentRank.titleEn} • {score} XP • {casesSolvedCount} {lang === 'VI' ? 'vụ án đã phá' : 'cases solved'}
            </p>
          </div>
        </div>

        {/* Tab Buttons & Certificate Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/certificate"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-serif font-bold bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-sm hover:from-amber-700 hover:to-amber-900 transition-all border border-amber-950"
          >
            <FileCheck className="w-3.5 h-3.5 text-amber-200" />
            <span>{lang === 'VI' ? 'Chứng Thư' : 'Certificate'}</span>
          </Link>

          <div className="flex items-center p-1 bg-[#E2D5B8] rounded-lg border border-[#C4B6A0]">
            <button
              onClick={() => setActiveTab('ranks')}
              className={`px-3 py-1 rounded text-xs font-serif font-bold transition-all ${
                activeTab === 'ranks'
                  ? 'bg-[#F5ECD7] text-noir-ink shadow-sm'
                  : 'text-noir-inkMuted hover:text-noir-ink'
              }`}
            >
              {lang === 'VI' ? 'Lộ Trình Cấp Bậc' : 'Rank Progression'}
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-1 rounded text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'badges'
                  ? 'bg-[#F5ECD7] text-noir-ink shadow-sm'
                  : 'text-noir-inkMuted hover:text-noir-ink'
              }`}
            >
              <span>{lang === 'VI' ? 'Huy Hiệu Danh Dự' : 'Medals of Honor'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-noir-blood text-white font-mono">
                {earnedBadgeCodes.length}/{COMMENDATION_BADGES.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: RANKS LADDER */}
      {activeTab === 'ranks' && (
        <div className="flex flex-col gap-5">
          {/* Active Rank Progress Showcase */}
          <div className="p-4 bg-[#F5ECD7] rounded-lg border border-[#C4B6A0] shadow-inner flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-typewriter text-noir-blood tracking-wider uppercase">
                  {lang === 'VI' ? 'Cấp Bậc Hiện Tại' : 'Current Commission'}
                </span>
                <h4 className="font-serif font-bold text-base text-noir-ink flex items-center gap-1.5">
                  <span>{lang === 'VI' ? currentRank.titleVi : currentRank.titleEn}</span>
                </h4>
                <p className="text-xs text-noir-inkMuted font-serif italic mt-0.5">
                  {lang === 'VI' ? currentRank.descVi : currentRank.descEn}
                </p>
              </div>

              {nextRank && (
                <div className="text-right">
                  <span className="text-[10px] font-typewriter text-noir-inkMuted uppercase">
                    {lang === 'VI' ? 'Cấp Kế Tiếp' : 'Next Rank'}
                  </span>
                  <div className="font-serif font-bold text-sm text-noir-ink">
                    {lang === 'VI' ? nextRank.titleVi : nextRank.titleEn}
                  </div>
                  <span className="text-xs font-mono text-noir-blood font-semibold">
                    +{nextRank.minScore - score} XP {lang === 'VI' ? 'cần thêm' : 'remaining'}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono text-noir-inkMuted">
                <span>{score} XP</span>
                <span>{progressPercent}%</span>
                <span>{nextRank ? `${nextRank.minScore} XP` : 'MAX'}</span>
              </div>
              <div className="w-full h-2.5 bg-[#E2D5B8] rounded-full overflow-hidden border border-[#C4B6A0] shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 5 Ranks Milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {POLICE_RANKS.map((r) => {
              const isAchieved = score >= r.minScore;
              const isCurrent = currentRank.id === r.id;
              const Icon = r.icon;

              return (
                <div
                  key={r.id}
                  className={`p-3 rounded-lg border flex flex-col items-center text-center transition-all ${
                    isCurrent
                      ? 'bg-[#F5ECD7] border-amber-600 ring-2 ring-amber-600/30 shadow-md scale-102'
                      : isAchieved
                      ? 'bg-[#F5ECD7]/80 border-[#C4B6A0]'
                      : 'bg-[#E5D9BC]/50 border-dashed border-[#C4B6A0] opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 shadow-sm border ${
                      isAchieved
                        ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 border-amber-900'
                        : 'bg-neutral-300 text-neutral-500 border-neutral-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-bold text-xs text-noir-ink line-clamp-1">
                    {lang === 'VI' ? r.titleVi : r.titleEn}
                  </span>
                  <span className="text-[10px] font-mono text-noir-inkMuted mt-0.5">
                    {r.minScore} XP
                  </span>
                  {isCurrent && (
                    <span className="mt-1.5 px-1.5 py-0.2 rounded bg-amber-600 text-white font-typewriter text-[9px]">
                      {lang === 'VI' ? 'Hiện tại' : 'Active'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMMENDATION BADGES */}
      {activeTab === 'badges' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {COMMENDATION_BADGES.map((badge) => {
              const isUnlocked = earnedSet.has(badge.code);
              const Icon = badge.icon;

              return (
                <div
                  key={badge.code}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                    isUnlocked
                      ? 'bg-[#F5ECD7] border-amber-600/60 shadow hover:shadow-md hover:-translate-y-0.5'
                      : 'bg-[#E5D9BC]/60 border-dashed border-[#C4B6A0] opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Badge Medal / Wax Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${
                      isUnlocked
                        ? `${badge.accentBg} ${badge.iconColor} bg-[#F5ECD7]`
                        : 'bg-[#DCD0B4] border-[#C4B6A0] text-noir-inkFaint'
                    }`}
                  >
                    {isUnlocked ? (
                      <Icon className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4 text-noir-inkFaint" />
                    )}
                  </div>

                  {/* Badge Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-serif font-bold text-xs text-noir-ink truncate">
                        {lang === 'VI' ? badge.titleVi : badge.titleEn}
                      </h5>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[9px] font-typewriter uppercase text-noir-inkFaint">
                          {lang === 'VI' ? 'Chưa mở' : 'Locked'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-noir-inkMuted font-serif italic mt-0.5 line-clamp-2 leading-tight">
                      {lang === 'VI' ? badge.descVi : badge.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Badge Detail Modal / Drawer */}
          {selectedBadge && (
            <div className="p-3.5 bg-[#F5ECD7] rounded-lg border border-[#C4B6A0] shadow-sm flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-lg border ${selectedBadge.accentBg} ${selectedBadge.iconColor} bg-[#F5ECD7] shadow-sm`}
                >
                  <selectedBadge.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-noir-ink flex items-center gap-2">
                    <span>{lang === 'VI' ? selectedBadge.titleVi : selectedBadge.titleEn}</span>
                    <span className="text-[10px] font-typewriter px-1.5 py-0.2 rounded bg-noir-ink/10 text-noir-ink">
                      {selectedBadge.category.toUpperCase()}
                    </span>
                  </h4>
                  <p className="text-xs text-noir-ink font-serif mt-1">
                    <span className="font-semibold text-noir-blood">
                      {lang === 'VI' ? 'Điều kiện mở khóa: ' : 'Requirement: '}
                    </span>
                    {lang === 'VI' ? selectedBadge.requirementVi : selectedBadge.requirementEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-xs font-mono text-noir-inkMuted hover:text-noir-ink px-2 py-1 rounded bg-[#E2D5B8]"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
