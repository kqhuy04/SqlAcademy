import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { useLanguageStore } from '@/store/languageStore';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Button } from '@/components/ui/Button';
import {
  POLICE_RANKS,
  COMMENDATION_BADGES,
} from '@/components/profile/DetectiveRanksAndBadges';
import {
  Shield,
  Award,
  Download,
  Printer,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CertificatePage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguageStore();
  const certificateRef = useRef<HTMLDivElement>(null);

  // Fetch solved cases count
  const { data: progressList } = useQuery({
    queryKey: ['user_progress'],
    queryFn: userApi.getProgress,
  });

  const casesCompletedCount = useMemo(() => {
    if (!progressList) return 0;
    const uniqueCases = new Set(
      progressList
        .filter((p) => p.status === 'COMPLETED' || Boolean(p.completedAt))
        .map((p) => p.caseId)
    );
    return uniqueCases.size;
  }, [progressList]);

  // Determine current rank
  const currentRank = useMemo(() => {
    const score = user?.totalScore || 0;
    let rank = POLICE_RANKS[0];
    for (let i = POLICE_RANKS.length - 1; i >= 0; i--) {
      if (score >= POLICE_RANKS[i].minScore) {
        rank = POLICE_RANKS[i];
        break;
      }
    }
    return rank;
  }, [user?.totalScore]);

  // Earned badges count
  const earnedBadgesCount = useMemo(() => {
    if (!user?.badgesEarned) return 0;
    return user.badgesEarned.split(',').filter(Boolean).length;
  }, [user?.badgesEarned]);

  const certificateId = useMemo(() => {
    const id = user?.id ? String(user.id).padStart(5, '0') : '00001';
    return `SQL-DET-${id}-${(user?.totalScore || 0).toString(16).toUpperCase()}`;
  }, [user?.id, user?.totalScore]);

  const formattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [lang]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    toast.success(
      lang === 'VI'
        ? 'Mở hộp thoại in: Chọn "Save as PDF" (Lưu dưới dạng PDF) để tải xuống'
        : 'Print dialog opened: Select "Save as PDF" to download file'
    );
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const CurrentIcon = currentRank.icon;

  return (
    <PageWrapper>
      <AnimatedPage>
        {/* Navigation & Controls Bar (Hidden when printing) */}
        <div className="no-print max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/profile">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-xs font-typewriter uppercase tracking-wider"
            >
              {lang === 'VI' ? 'Quay Lại Hồ Sơ' : 'Back to Profile'}
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4 text-noir-muted" />}
              className="text-xs font-typewriter uppercase tracking-wider"
            >
              {lang === 'VI' ? 'In Giấy Chứng Nhận' : 'Print Certificate'}
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleDownloadPdf}
              leftIcon={<Download className="w-4 h-4" />}
              className="text-xs font-typewriter uppercase tracking-wider shadow-sm font-bold"
            >
              {lang === 'VI' ? 'Tải Xuống PDF' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* Outer Frame Wrapper for Screen & Print */}
        <div className="max-w-4xl mx-auto">
          {/* Certificate Container */}
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="certificate-print-area relative bg-[#F7EFE0] text-[#1A1612] p-8 sm:p-14 rounded-lg shadow-noir-lg border-4 border-[#3D2B1F] overflow-hidden select-none"
            style={{
              boxShadow: '0 10px 30px -5px rgba(26, 22, 18, 0.35)',
            }}
          >
            {/* Vintage Double Guilloché Border Decor */}
            <div className="absolute inset-2 border-2 border-[#8B1A1A]/40 pointer-events-none rounded-[4px]" />
            <div className="absolute inset-3 border border-[#3D2B1F]/30 pointer-events-none rounded-[3px]" />

            {/* Corner Filigree Accents */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-[#8B1A1A] pointer-events-none" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-[#8B1A1A] pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-[#8B1A1A] pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-[#8B1A1A] pointer-events-none" />

            {/* Watermark Logo in Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
              <Shield className="w-96 h-96 text-[#1A1612]" />
            </div>

            {/* Header Docket Strip */}
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8DCBF] border border-[#3D2B1F]/40 rounded text-[11px] font-typewriter tracking-widest uppercase text-[#5A4535] mb-3">
                <Shield className="w-3.5 h-3.5 text-[#8B1A1A]" />
                <span>
                  {lang === 'VI'
                    ? 'HỌC VIỆN ĐIỀU TRA HÌNH SỰ SQL • CỤC LƯU TRỮ TRỌNG ÁN'
                    : 'SQL DETECTIVE ACADEMY • BUREAU OF FORENSIC ARCHIVES'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-wider uppercase text-[#1A1612] my-2">
                {lang === 'VI' ? 'CHỨNG THƯ ĐIỀU TRA VIÊN' : 'CERTIFICATE OF MERIT'}
              </h1>

              <p className="text-xs sm:text-sm font-typewriter uppercase tracking-widest text-[#8B1A1A] font-bold">
                {lang === 'VI'
                  ? 'BẢNG DANH DỰ CÔNG NHẬN NĂNG LỰC TRUY VẤN DỮ LIỆU TỘI PHẠM'
                  : 'OFFICIAL COMMENDATION OF CRIMINAL DATABASE FORENSIC MASTERY'}
              </p>
            </div>

            {/* Decorative separator */}
            <div className="flex items-center justify-center gap-3 my-6 relative z-10">
              <div className="h-[1px] w-24 bg-[#3D2B1F]/30" />
              <Award className="w-5 h-5 text-[#8B1A1A]" />
              <div className="h-[1px] w-24 bg-[#3D2B1F]/30" />
            </div>

            {/* Certificate Body Presentation */}
            <div className="text-center max-w-2xl mx-auto my-6 relative z-10 space-y-4">
              <p className="text-xs sm:text-sm font-typewriter uppercase tracking-wider text-[#5A4535]">
                {lang === 'VI'
                  ? 'Hội đồng Giám đốc Học viện Trinh sát Trọng án long trọng chứng nhận:'
                  : 'The Forensic Board of Directors hereby confers this honor upon:'}
              </p>

              {/* Investigator's Full Title / Name */}
              <div className="py-2 border-b-2 border-dashed border-[#3D2B1F]/40 inline-block px-8 sm:px-14">
                <span className="text-2xl sm:text-4xl font-serif font-black text-[#8B1A1A] tracking-wider uppercase">
                  {user?.username || 'Detective'}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-typewriter text-[#3A2F22] leading-relaxed pt-2">
                {lang === 'VI'
                  ? 'Đã xuất sắc hoàn thành chương trình huấn luyện trinh sát, giải mã thành công chuỗi kỳ án hồ sơ tội phạm, chứng minh năng lực truy vấn SQL thượng thừa và đạt quân hàm:'
                  : 'Has successfully deciphered intricate criminal database registries, executed high-precision SQL search warrants, and earned the official bureau rank of:'}
              </p>

              {/* Rank Highlight Banner */}
              <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-[#EDE3C9] border-2 border-[#8B1A1A] rounded shadow-sm my-3">
                <CurrentIcon className="w-6 h-6 text-[#8B1A1A]" />
                <span className="text-base sm:text-xl font-serif font-black tracking-wider uppercase text-[#1A1612]">
                  {lang === 'VI' ? currentRank.titleVi : currentRank.titleEn}
                </span>
                <span className="text-xs font-typewriter font-bold bg-[#8B1A1A] text-[#F7EFE0] px-2 py-0.5 rounded">
                  Level {currentRank.level}
                </span>
              </div>
            </div>

            {/* Achievement Statistics Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto my-8 relative z-10 text-center">
              <div className="bg-[#EBE0C7] border border-[#3D2B1F]/30 p-3 rounded">
                <div className="text-[10px] font-typewriter uppercase tracking-wider text-[#5A4535] font-bold">
                  {lang === 'VI' ? 'Tổng Điểm XP' : 'Total Score'}
                </div>
                <div className="text-lg sm:text-2xl font-black font-typewriter text-[#C9972C] mt-0.5">
                  ⭐ {user?.totalScore || 0}
                </div>
              </div>

              <div className="bg-[#EBE0C7] border border-[#3D2B1F]/30 p-3 rounded">
                <div className="text-[10px] font-typewriter uppercase tracking-wider text-[#5A4535] font-bold">
                  {lang === 'VI' ? 'Hồ Sơ Đã Phá' : 'Cases Solved'}
                </div>
                <div className="text-lg sm:text-2xl font-black font-typewriter text-[#2A4B2A] mt-0.5 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#2A4B2A]" />
                  <span>{casesCompletedCount}</span>
                </div>
              </div>

              <div className="bg-[#EBE0C7] border border-[#3D2B1F]/30 p-3 rounded">
                <div className="text-[10px] font-typewriter uppercase tracking-wider text-[#5A4535] font-bold">
                  {lang === 'VI' ? 'Huân Chương' : 'Badges Earned'}
                </div>
                <div className="text-lg sm:text-2xl font-black font-typewriter text-[#8B1A1A] mt-0.5 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4 text-[#8B1A1A]" />
                  <span>{earnedBadgesCount}/{COMMENDATION_BADGES.length}</span>
                </div>
              </div>
            </div>

            {/* Footer Signatures, Wax Stamp & Verification Code */}
            <div className="mt-12 pt-6 border-t border-[#3D2B1F]/30 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              {/* Left: Bureau Official Wax Seal Stamp */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-dashed border-[#8B1A1A] flex flex-col items-center justify-center text-[#8B1A1A] font-bold p-1 select-none transform -rotate-12 shadow-sm">
                  <div className="w-full h-full rounded-full border border-[#8B1A1A] flex flex-col items-center justify-center text-center p-1">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B1A1A] mb-0.5" />
                    <span className="text-[7px] sm:text-[8px] font-typewriter tracking-tighter uppercase leading-none font-black">
                      OFFICIAL SEAL
                    </span>
                    <span className="text-[6px] sm:text-[7px] font-typewriter uppercase text-[#8B1A1A] mt-0.5">
                      VERIFIED
                    </span>
                  </div>
                </div>

                <div className="text-left font-typewriter">
                  <div className="text-[10px] text-[#5A4535] uppercase font-bold tracking-widest">
                    {lang === 'VI' ? 'MÃ XÁC THỰC BẢN ÁN' : 'SECURITY CERTIFICATE NO.'}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#1A1612]">
                    {certificateId}
                  </div>
                  <div className="text-[10px] text-[#8C7E6D]">
                    {lang === 'VI' ? 'Ngày Cấp:' : 'Issued Date:'} {formattedDate}
                  </div>
                </div>
              </div>

              {/* Right: Signature Bureau Stamp */}
              <div className="text-center sm:text-right font-typewriter">
                <div className="font-serif italic text-base sm:text-lg text-[#8B1A1A] font-black tracking-wide">
                  Chief Inspector V. Vance
                </div>
                <div className="h-[1px] w-48 bg-[#3D2B1F]/40 my-1 mx-auto sm:ml-auto" />
                <div className="text-[10px] text-[#5A4535] uppercase tracking-widest font-bold">
                  {lang === 'VI' ? 'TỔNG CHỈ HUY HỌC VIỆN' : 'ACADEMY SUPERINTENDENT'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedPage>
    </PageWrapper>
  );
};
