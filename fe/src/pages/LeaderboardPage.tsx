import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageStore } from '@/store/languageStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Spinner } from '@/components/ui/Spinner';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { cn } from '@/utils/cn';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguageStore();

  const {
    data: leaderboard,
    isLoading,
  } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: userApi.getLeaderboard,
  });

  const top3 = leaderboard ? leaderboard.slice(0, 3) : [];
  const remainingLeaderboard = leaderboard ? leaderboard.slice(3, 10) : [];

  return (
    <PageWrapper>
      <AnimatedPage>
        {/* Header */}
        <div className="mb-8 border-b-2 border-noir-borderDark pb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-noir-ink tracking-tight uppercase">
            {lang === 'VI' ? 'Bảng Xếp Hạng' : 'Detective Leaderboard'}
          </h1>
          <p className="text-xs sm:text-sm font-serif text-noir-inkMuted mt-1 max-w-xl italic">
            {lang === 'VI'
              ? '“Vinh danh các điều tra viên xuất sắc theo tổng điểm pháp y và số vụ án đã phá.”'
              : '“Commending outstanding detectives ranked by forensic score and closed cases.”'}
          </p>
        </div>

        {/* Top 3 Podium Cards */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
            {/* Rank 2 - Silver (Left on Desktop) */}
            {top3[1] && (
              <div className="order-2 md:order-1 bg-gradient-to-b from-[#FCFBF9] to-[#EFECE6] border-2 border-slate-400/80 rounded-xl p-5 shadow-noir-md relative flex flex-col justify-between pt-7">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-700 text-slate-100 px-3.5 py-0.5 border border-slate-500 text-[10.5px] font-typewriter font-bold tracking-wider uppercase rounded-full shadow-sm whitespace-nowrap flex items-center gap-1.5">
                  <Medal className="w-3 h-3 text-slate-300" />
                  <span>{lang === 'VI' ? 'ĐẶC VỤ CAO CẤP • HẠNG 2' : 'SENIOR DETECTIVE • RANK 2'}</span>
                </div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-lg font-black text-slate-800 font-sans shadow-sm">
                      {top3[1].username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-sans font-bold text-base text-noir-ink">
                        {top3[1].username}
                      </h3>
                      {user && user.username === top3[1].username && (
                        <span className="text-[9px] font-typewriter uppercase tracking-wider bg-noir-blood text-noir-parchment px-1.5 py-0.5 rounded font-bold">
                          {lang === 'VI' ? 'BẠN' : 'YOU'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-typewriter text-slate-600 font-medium">
                      {lang === 'VI' ? 'Đặc vụ ưu tú • SQL Detective Noir' : 'Special Agent • SQL Detective Noir'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-300/80 text-xs font-typewriter">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-bold">{lang === 'VI' ? 'TỔNG ĐIỂM' : 'TOTAL SCORE'}</span>
                    <span className="font-bold text-noir-candleDark text-sm">{top3[1].totalScore.toLocaleString()} ⭐</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] block font-bold">{lang === 'VI' ? 'ÁN ĐÃ PHÁ' : 'CASES SOLVED'}</span>
                    <span className="font-bold text-noir-stamp text-sm">
                      {top3[1].casesCompleted} {lang === 'VI' ? 'vụ án' : 'solved'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold (Center & Prominent) */}
            {top3[0] && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-[#FFFDF7] to-[#F7EED2] border-2 border-amber-600/80 rounded-xl p-6 shadow-noir-lg relative flex flex-col justify-between pt-8 ring-1 ring-amber-500/30 md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-50 px-4 py-0.5 border border-amber-500/80 text-[11px] font-typewriter font-black tracking-wider uppercase rounded-full shadow whitespace-nowrap flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-300 fill-current" />
                  <span>{lang === 'VI' ? 'TỔNG CHỈ HUY • HẠNG 1' : 'CHIEF DETECTIVE • RANK 1'}</span>
                </div>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-amber-200/90 border-2 border-amber-600 flex items-center justify-center text-2xl font-black text-amber-950 font-sans shadow-sm">
                      {top3[0].username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans font-extrabold text-lg text-noir-ink tracking-tight">
                        {top3[0].username}
                      </h3>
                      <Crown className="w-4 h-4 text-amber-600 fill-current" />
                      {user && user.username === top3[0].username && (
                        <span className="text-[10px] font-typewriter uppercase tracking-wider bg-noir-blood text-noir-parchment px-2 py-0.5 rounded font-bold">
                          {lang === 'VI' ? 'BẠN' : 'YOU'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-typewriter text-amber-900 font-semibold mt-0.5">
                      {lang === 'VI' ? 'Điều tra viên xuất sắc nhất • SQL Detective Noir' : 'Top Investigator • SQL Detective Noir'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t-2 border-amber-600/30 text-xs font-typewriter">
                  <div>
                    <span className="text-amber-800 text-[10px] block font-bold">{lang === 'VI' ? 'TỔNG ĐIỂM' : 'TOTAL SCORE'}</span>
                    <span className="font-black text-noir-candleDark text-base">{top3[0].totalScore.toLocaleString()} ⭐</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-800 text-[10px] block font-bold">{lang === 'VI' ? 'ÁN ĐÃ PHÁ' : 'CASES SOLVED'}</span>
                    <span className="font-black text-noir-stamp text-base">
                      {top3[0].casesCompleted} {lang === 'VI' ? 'vụ án' : 'files'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze (Right on Desktop) */}
            {top3[2] && (
              <div className="order-3 bg-gradient-to-b from-[#FCFBF8] to-[#EFE8DD] border-2 border-amber-800/50 rounded-xl p-5 shadow-noir-md relative flex flex-col justify-between pt-7">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#78350F] text-amber-100 px-3.5 py-0.5 border border-amber-700 text-[10.5px] font-typewriter font-bold tracking-wider uppercase rounded-full shadow-sm whitespace-nowrap flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-amber-300" />
                  <span>{lang === 'VI' ? 'ĐIỀU TRA VIÊN • HẠNG 3' : 'DETECTIVE • RANK 3'}</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-800/60 flex items-center justify-center text-lg font-black text-amber-900 font-sans shadow-sm">
                      {top3[2].username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-sans font-bold text-base text-noir-ink">
                        {top3[2].username}
                      </h3>
                      {user && user.username === top3[2].username && (
                        <span className="text-[9px] font-typewriter uppercase tracking-wider bg-noir-blood text-noir-parchment px-1.5 py-0.5 rounded font-bold">
                          {lang === 'VI' ? 'BẠN' : 'YOU'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-typewriter text-amber-900/80 font-medium">
                      {lang === 'VI' ? 'Điều tra viên • SQL Detective Noir' : 'Investigator • SQL Detective Noir'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-amber-800/20 text-xs font-typewriter">
                  <div>
                    <span className="text-amber-900/70 text-[10px] block font-bold">{lang === 'VI' ? 'TỔNG ĐIỂM' : 'TOTAL SCORE'}</span>
                    <span className="font-bold text-noir-candleDark text-sm">{top3[2].totalScore.toLocaleString()} ⭐</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-900/70 text-[10px] block font-bold">{lang === 'VI' ? 'ÁN ĐÃ PHÁ' : 'CASES SOLVED'}</span>
                    <span className="font-bold text-noir-stamp text-sm">
                      {top3[2].casesCompleted} {lang === 'VI' ? 'vụ án' : 'solved'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Dossier Table - Starting from Rank 4 */}
        <div className="bg-noir-paper border-2 border-noir-borderDark rounded-lg overflow-hidden shadow-noir-md">
          <div className="bg-noir-card/70 px-5 py-3 border-b-2 border-noir-borderDark flex items-center justify-between text-xs font-typewriter text-noir-inkMuted uppercase tracking-wider">
            <span>{lang === 'VI' ? 'SỔ TAY QUÂN SỐ HIỆN TRƯỜNG • TỪ HẠNG 4 ĐẾN HẠNG 10' : 'FIELD PERSONNEL LEDGER • RANKS 4 TO 10'}</span>
            <span>{lang === 'VI' ? 'LƯU TRỮ CHÍNH THỨC' : 'OFFICIAL ARCHIVES'}</span>
          </div>

          {isLoading ? (
            <div className="py-20">
              <Spinner size="lg" label={lang === 'VI' ? 'ĐANG TỔNG HỢP BẢNG XẾP HẠNG ĐẶC VỤ...' : 'COMPILING FORENSIC PERSONNEL RATINGS...'} />
            </div>
          ) : remainingLeaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse font-typewriter">
                <thead>
                  <tr className="bg-noir-card/40 border-b border-noir-borderDark text-noir-inkMuted text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-24">{lang === 'VI' ? 'Thứ Hạng' : 'Rank'}</th>
                    <th className="py-3 px-6">{lang === 'VI' ? 'Điều Tra Viên Hiện Trường' : 'Field Investigator'}</th>
                    <th className="py-3 px-6 text-right">{lang === 'VI' ? 'Tổng Điểm ⭐' : 'Total Score ⭐'}</th>
                    <th className="py-3 px-6 text-center">{lang === 'VI' ? 'Số Án Đã Phá' : 'Cases Solved'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-noir-border/50">
                  {remainingLeaderboard.map((entry) => {
                    const isCurrentUser = user && entry.username === user.username;

                    return (
                      <tr
                        key={entry.username}
                        className={cn(
                          'transition-colors',
                          isCurrentUser
                            ? 'bg-noir-candle/15 border-l-4 border-l-noir-blood font-bold text-noir-ink'
                            : 'hover:bg-noir-card/40 text-noir-ink'
                        )}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-7 rounded bg-noir-card/70 border border-noir-border text-noir-inkMuted font-mono font-bold text-xs">
                            #{entry.rank}
                          </span>
                        </td>

                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-sans border bg-noir-card text-noir-ink border-noir-borderDark">
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-sans text-noir-ink text-sm">
                                  {entry.username}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[10px] font-typewriter uppercase tracking-wider bg-noir-blood text-noir-paper px-2 py-0.5 rounded font-bold">
                                    {lang === 'VI' ? 'BẠN' : 'YOU'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-typewriter text-noir-inkMuted">
                                {lang === 'VI' ? `Đặc vụ #${entry.rank}` : `Agent #${entry.rank}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 text-right text-base font-bold font-typewriter text-noir-candleDark">
                          {entry.totalScore.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-6 text-center text-noir-stamp font-typewriter font-bold">
                          {entry.casesCompleted} {lang === 'VI' ? 'vụ án' : 'solved'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 px-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-noir-card border border-noir-borderDark text-noir-inkMuted mb-3">
                <Trophy className="w-5 h-5 text-noir-candleDark" />
              </div>
              <p className="text-sm font-sans font-semibold text-noir-ink">
                {lang === 'VI'
                  ? 'Các điều tra viên xuất sắc nhất đang được vinh danh trên Bục Vinh Danh phía trên.'
                  : 'Top investigators are recognized on the Honor Podium above.'}
              </p>
              <p className="text-xs font-typewriter text-noir-inkMuted mt-1">
                {lang === 'VI'
                  ? 'Từ hạng 4 đến hạng 10 sẽ được ghi nhận tại đây khi có thêm điều tra viên tham gia.'
                  : 'Ranks #4 to #10 will be registered here as additional investigators join the roster.'}
              </p>
            </div>
          )}
        </div>
      </AnimatedPage>
    </PageWrapper>
  );
};

