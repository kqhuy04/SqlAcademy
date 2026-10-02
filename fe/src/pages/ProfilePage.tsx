import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/api/user.api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { DifficultyBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StampBadge } from '@/components/ui/StampBadge';
import { SubscribeModal } from '@/components/case/SubscribeModal';
import { DetectiveRanksAndBadges } from '@/components/profile/DetectiveRanksAndBadges';
import { useLanguageStore } from '@/store/languageStore';
import {
  Award,
  CheckCircle2,
  Lock,
  KeyRound,
  FileText,
  UserCheck,
  Languages,
  Hash,
  FileCheck,
  Star,
  Camera,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, isPremium, refreshProfile } = useAuth();
  const { lang, setLang } = useLanguageStore();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(
        lang === 'VI'
          ? 'Hồ sơ chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WEBP'
          : 'Dossier photo must be JPG, PNG, or WEBP format'
      );
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        lang === 'VI'
          ? 'Kích thước ảnh tối đa là 10MB'
          : 'Photo size cannot exceed 10MB'
      );
      return;
    }

    try {
      setIsUploadingAvatar(true);
      await userApi.uploadAvatar(file);
      await refreshProfile();
      toast.success(
        lang === 'VI'
          ? 'Đã cập nhật ảnh hồ sơ điều tra thành công!'
          : 'Dossier identification photo updated successfully!'
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (lang === 'VI'
          ? 'Không thể tải ảnh lên máy chủ lưu trữ'
          : 'Failed to upload photo to archive');
      toast.error(msg);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Change password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Query progress
  const { data: progressList } = useQuery({
    queryKey: ['user_progress'],
    queryFn: userApi.getProgress,
  });

  // Calculate unique cases completed
  const casesCompletedCount = useMemo(() => {
    if (!progressList) return 0;
    const uniqueCases = new Set(
      progressList
        .filter((p) => p.status === 'COMPLETED' || Boolean(p.completedAt))
        .map((p) => p.caseId)
    );
    return uniqueCases.size;
  }, [progressList]);

  // Parse badges
  const earnedBadges = useMemo(() => {
    if (!user?.badgesEarned) return [];
    return user.badgesEarned
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
  }, [user?.badgesEarned]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error(
        lang === 'VI'
          ? 'Vui lòng nhập cả mật khẩu hiện tại và mật khẩu mới'
          : 'Please enter both your current and new passphrase'
      );
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await userApi.changePassword({ oldPassword, newPassword });
      toast.success(
        res.message ||
          (lang === 'VI'
            ? 'Đã cập nhật mật khẩu điều tra thành công!'
            : 'Investigation passphrase updated successfully!')
      );
      setShowChangePasswordModal(false);
      setOldPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (lang === 'VI'
          ? 'Mật khẩu hiện tại không đúng hoặc mật khẩu mới chưa đủ độ bảo mật'
          : 'Current passphrase incorrect or does not satisfy requirements');
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <PageWrapper>
      <AnimatedPage>
        {/* Investigator ID Card Header */}
        <div className="bg-noir-paper border-2 border-noir-borderDark rounded-lg p-6 sm:p-8 mb-8 relative overflow-hidden shadow-noir-md">
          {/* Top Tape Docket Strip */}
          <div className="absolute top-0 left-0 right-0 bg-noir-card px-4 py-1 border-b border-noir-borderDark flex items-center justify-between text-[10px] font-typewriter uppercase tracking-widest text-noir-inkMuted">
            <span>
              {lang === 'VI'
                ? 'HỒ SƠ ĐẶC VỤ'
                : 'INVESTIGATOR DOSSIER'}
            </span>
            <span>
              {lang === 'VI' ? 'BẢO MẬT CẤP 2' : 'CLEARANCE LEVEL 2'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
            <div className="flex items-center gap-5">
              {/* Photo Frame / Badge Avatar with Upload */}
              <div className="relative group shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div
                  onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-md bg-noir-card border-2 border-noir-borderDark relative overflow-hidden flex items-center justify-center shadow-md cursor-pointer transition-transform group-hover:scale-105"
                  title={lang === 'VI' ? 'Nhấp để thay đổi ảnh hồ sơ' : 'Click to update dossier photo'}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-noir-ink font-serif">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}

                  {/* Hover Camera Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-typewriter font-bold uppercase tracking-tighter text-center leading-tight">
                      {lang === 'VI' ? 'Đổi Ảnh' : 'Update'}
                    </span>
                  </div>

                  {/* Loading Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-noir-paper/90 flex flex-col items-center justify-center text-noir-blood z-10">
                      <Loader2 className="w-6 h-6 animate-spin mb-1 text-noir-blood" />
                      <span className="text-[9px] font-typewriter font-bold text-noir-ink">
                        {lang === 'VI' ? 'ĐANG LƯU...' : 'SAVING...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Badge corner clip effect */}
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-noir-blood/80 rotate-45 rounded-sm pointer-events-none" />
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black font-serif text-noir-ink">
                    {user?.username}
                  </h1>
                  {isPremium ? (
                    <StampBadge
                      label={lang === 'VI' ? 'ĐẶC VỤ CAO CẤP' : 'SPECIAL AGENT'}
                      variant="gold"
                      rotation={0}
                    />
                  ) : (
                    <StampBadge
                      label={lang === 'VI' ? 'THÁM TỬ TẬP SỰ' : 'JUNIOR DETECTIVE'}
                      variant="classified"
                      rotation={0}
                    />
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-typewriter text-noir-stamp font-bold flex items-center gap-1 bg-noir-stamp/10 px-2.5 py-1 rounded border border-noir-stamp/20">
                    <UserCheck className="w-3.5 h-3.5" /> {lang === 'VI' ? 'ĐANG LÀM NHIỆM VỤ' : 'ACTIVE ON DUTY'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-56 shrink-0">
              <Link to="/certificate" className="w-full">
                <Button
                  variant="gold"
                  size="sm"
                  leftIcon={<FileCheck className="w-4 h-4 shrink-0" />}
                  className="w-full justify-start text-xs font-typewriter py-2 px-3 shadow-sm font-bold"
                >
                  <span>{lang === 'VI' ? 'Chứng Thư Tốt Nghiệp' : 'Honorary Certificate'}</span>
                </Button>
              </Link>
              {!isPremium && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubscribeModal(true)}
                  leftIcon={<Award className="w-4 h-4 shrink-0 text-noir-candleDark" />}
                  className="w-full justify-start text-xs font-typewriter py-2 px-3 bg-noir-card/40 hover:bg-noir-cardHover border-noir-borderDark text-noir-ink"
                >
                  <span>{lang === 'VI' ? 'Nâng Cấp Quyền Hạn' : 'Upgrade Clearance'}</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangePasswordModal(true)}
                leftIcon={<KeyRound className="w-4 h-4 shrink-0 text-noir-inkMuted" />}
                className="w-full justify-start text-xs font-typewriter py-2 px-3 bg-noir-card/40 hover:bg-noir-cardHover border-noir-borderDark text-noir-ink"
              >
                <span>{lang === 'VI' ? 'Đổi Mật Khẩu' : 'Change Passphrase'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                leftIcon={<Languages className="w-4 h-4 shrink-0 text-noir-inkMuted" />}
                className="w-full justify-start text-xs font-typewriter py-2 px-3 bg-noir-card/40 hover:bg-noir-cardHover border-noir-borderDark text-noir-ink"
              >
                <span>{lang === 'VI' ? 'Cài Đặt Ngôn Ngữ' : 'Language Settings'}</span>
              </Button>
            </div>
          </div>

          {/* Stats Grid: Badge ID + Score + Cases Solved */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-noir-borderDark/60">
            <div className="bg-noir-card/50 border border-noir-borderDark rounded-md p-4 font-typewriter">
              <div className="text-xs text-noir-inkMuted flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Hash className="w-4 h-4 text-noir-blood" />
                <span>{lang === 'VI' ? 'MÃ THẺ' : 'BADGE ID'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-noir-ink mt-1.5">
                #{String(user?.id || 0).padStart(5, '0')}
              </div>
            </div>

            <div className="bg-noir-card/50 border border-noir-borderDark rounded-md p-4 font-typewriter">
              <div className="text-xs text-noir-inkMuted flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Star className="w-4 h-4 text-noir-candleDark" />
                <span>{lang === 'VI' ? 'ĐIỂM' : 'SCORE'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-noir-candleDark mt-1.5">
                {user?.totalScore || 0}
              </div>
            </div>

            <div className="bg-noir-card/50 border border-noir-borderDark rounded-md p-4 font-typewriter">
              <div className="text-xs text-noir-inkMuted flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-noir-stamp" />
                <span>{lang === 'VI' ? 'PHÁ ÁN' : 'SOLVED'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-noir-stamp mt-1.5">
                {casesCompletedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Police Ranks & Medals of Honor Showcase */}
        <div className="mb-8">
          <DetectiveRanksAndBadges
            score={user?.totalScore || 0}
            earnedBadgeCodes={earnedBadges}
            casesSolvedCount={casesCompletedCount}
            lang={lang}
          />
        </div>

        {/* Case Progress History Table */}
        <div className="bg-noir-paper border-2 border-noir-borderDark rounded-lg overflow-hidden shadow-noir-md">
          <div className="bg-noir-card/70 px-5 py-3 border-b-2 border-noir-borderDark flex items-center justify-between text-xs font-typewriter text-noir-ink font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-noir-blood" />
              <span>
                {lang === 'VI'
                  ? 'NHẬT KÝ ĐIỀU TRA • SỔ TAY KẾT QUẢ PHÁ ÁN'
                  : 'CASE INVESTIGATION LOG • FORENSIC RESOLUTION LEDGER'}
              </span>
            </div>
            <span className="text-noir-inkMuted font-normal text-[11px]">
              {lang === 'VI' ? 'LƯU TRỮ GIÁM ĐỊNH' : 'FORENSIC ARCHIVES'}
            </span>
          </div>

          {progressList && progressList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-typewriter">
                <thead>
                  <tr className="bg-noir-card/30 border-b border-noir-borderDark text-noir-inkMuted uppercase text-[11px]">
                    <th className="py-3 px-4">{lang === 'VI' ? 'Hồ Sơ Vụ Án' : 'Case File'}</th>
                    <th className="py-3 px-4">{lang === 'VI' ? 'Cấp Độ' : 'Class'}</th>
                    <th className="py-3 px-4">{lang === 'VI' ? 'Đầu Mối' : 'Lead'}</th>
                    <th className="py-3 px-4">{lang === 'VI' ? 'Điểm Đạt Được' : 'Score Awarded'}</th>
                    <th className="py-3 px-4">{lang === 'VI' ? 'Gợi Ý Đã Mở' : 'Clues Unsealed'}</th>
                    <th className="py-3 px-4">{lang === 'VI' ? 'Lần Thử' : 'Attempts'}</th>
                    <th className="py-3 px-4">{lang === 'VI' ? 'Thời Gian' : 'Timestamp'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-noir-border/50">
                  {progressList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-noir-card/40 transition-colors text-noir-ink">
                      <td className="py-3 px-4 font-serif font-bold text-sm text-noir-ink">
                        {item.caseTitle}
                      </td>
                      <td className="py-3 px-4">
                        <DifficultyBadge difficulty={item.difficulty} />
                      </td>
                      <td className="py-3 px-4 font-typewriter text-noir-inkMuted">
                        {lang === 'VI' ? `Đầu mối #${item.questionOrderIndex}` : `Lead #${item.questionOrderIndex}`}
                      </td>
                      <td className="py-3 px-4 text-noir-candleDark font-bold text-sm font-typewriter">
                        +{item.scoreEarned} ⭐
                      </td>
                      <td className="py-3 px-4 text-noir-ink font-typewriter">
                        {item.hintsUsed} / 3
                      </td>
                      <td className="py-3 px-4 text-noir-ink font-typewriter">
                        {item.attempts} {lang === 'VI' ? 'lần thử' : 'trials'}
                      </td>
                      <td className="py-3 px-4 text-noir-inkMuted text-[11px] font-typewriter">
                        {item.completedAt ? new Date(item.completedAt).toLocaleString(lang === 'VI' ? 'vi-VN' : 'en-US') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-noir-inkMuted font-typewriter text-xs">
              <span>
                {lang === 'VI'
                  ? 'Chưa có câu hỏi điều tra nào được ghi nhận trong sổ tay quân số.'
                  : 'No case questions recorded in personnel ledger yet.'}
              </span>
            </div>
          )}
        </div>

        {/* Change Password Modal */}
        <Modal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          title={lang === 'VI' ? 'Thay Đổi Mật Khẩu Điều Tra' : 'Change Investigation Passphrase'}
          subtitle={
            lang === 'VI'
              ? 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ số và ký tự đặc biệt'
              : 'New passphrase must be at least 8 characters, containing uppercase, digit, and symbol'
          }
        >
          <form onSubmit={handleChangePassword} className="space-y-4 font-serif">
            <Input
              label={lang === 'VI' ? 'Mật Khẩu Hiện Tại' : 'Current Passphrase'}
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label={lang === 'VI' ? 'Mật Khẩu Mới' : 'New Passphrase'}
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4" />}
              required
            />

            <div className="flex gap-3 justify-end pt-3 border-t border-noir-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangePasswordModal(false)}
                disabled={isChangingPassword}
              >
                {lang === 'VI' ? 'Hủy' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="gold"
                isLoading={isChangingPassword}
              >
                {lang === 'VI' ? 'Cập Nhật Mật Khẩu' : 'Update Passphrase'}
              </Button>
            </div>
          </form>
        </Modal>

        <SubscribeModal
          isOpen={showSubscribeModal}
          onClose={() => setShowSubscribeModal(false)}
          onSuccess={() => refreshProfile()}
        />

        {/* System Settings & Language Modal */}
        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title={lang === 'VI' ? 'CÀI ĐẶT HỆ THỐNG • THIẾT LẬP NGÔN NGỮ' : 'SYSTEM SETTINGS • LANGUAGE CONFIG'}
          subtitle={
            lang === 'VI'
              ? 'Thiết lập ngôn ngữ hiển thị trên toàn bộ ứng dụng SQL Detective Noir'
              : 'Configure display language across SQL Detective Noir application'
          }
          maxWidth="md"
        >
          <div className="space-y-5 font-serif">
            <div className="bg-noir-card/60 border-2 border-noir-borderDark rounded-[3px] p-4 space-y-3">
              <label className="text-xs font-typewriter uppercase tracking-wider text-noir-ink font-bold block">
                {lang === 'VI' ? 'Ngôn Ngữ Ứng Dụng (App Language)' : 'Application Language'}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLang('VI');
                    toast.success('Đã cập nhật ngôn ngữ hệ thống: Tiếng Việt');
                  }}
                  className={`p-3 rounded border-2 transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer ${
                    lang === 'VI'
                      ? 'border-noir-blood bg-noir-paper text-noir-blood font-bold shadow-noir-sm'
                      : 'border-noir-borderDark/60 bg-noir-paper/60 text-noir-ink hover:border-noir-blood/60 font-medium'
                  }`}
                >
                  <span className="text-2xl">🇻🇳</span>
                  <span className="text-xs font-typewriter uppercase tracking-wider">Tiếng Việt (VI)</span>
                  {lang === 'VI' && (
                    <span className="text-[10px] text-noir-stamp font-bold font-mono">● Đang kích hoạt</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLang('EN');
                    toast.success('System language updated: English');
                  }}
                  className={`p-3 rounded border-2 transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer ${
                    lang === 'EN'
                      ? 'border-noir-blood bg-noir-paper text-noir-blood font-bold shadow-noir-sm'
                      : 'border-noir-borderDark/60 bg-noir-paper/60 text-noir-ink hover:border-noir-blood/60 font-medium'
                  }`}
                >
                  <span className="text-2xl">🇬🇧</span>
                  <span className="text-xs font-typewriter uppercase tracking-wider">English (EN)</span>
                  {lang === 'EN' && (
                    <span className="text-[10px] text-noir-stamp font-bold font-mono">● Active</span>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs font-serif text-noir-inkMuted italic">
              {lang === 'VI'
                ? '* Thay đổi ngôn ngữ sẽ được áp dụng ngay lập tức cho toàn bộ học viện, hồ sơ vụ án và các công cụ điều tra.'
                : '* Language preferences apply immediately across all academy courses, dossiers, and investigation tools.'}
            </p>

            <div className="flex justify-end pt-3 border-t border-noir-borderDark/60">
              <Button variant="secondary" size="sm" onClick={() => setShowSettingsModal(false)}>
                {lang === 'VI' ? 'Xác Nhận & Đóng' : 'Confirm & Close'}
              </Button>
            </div>
          </div>
        </Modal>
      </AnimatedPage>
    </PageWrapper>
  );
};

