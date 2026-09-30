import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageStore } from '@/store/languageStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Award,
  Trophy,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  X,
  FileText,
  GraduationCap,
  BookOpen,
  Newspaper,
} from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { cn } from '@/utils/cn';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isPremium, logout } = useAuth();
  const { lang } = useLanguageStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-[2px] text-xs font-typewriter uppercase tracking-wider transition-all select-none whitespace-nowrap',
      isActive
        ? 'text-noir-blood bg-noir-card/90 border-b-2 border-noir-blood font-bold shadow-noir-sm'
        : 'text-noir-ink hover:text-noir-blood hover:bg-noir-card/50 font-bold'
    );

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-noir-paper/95 backdrop-blur-md border-b-2 border-noir-borderDark shadow-noir-sm">
        {/* Top classified document edge */}
        <div className="h-[3px] w-full bg-noir-blood" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4.25rem] py-2.5 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <AppLogo className="w-9 h-9 group-hover:scale-105 transition-transform" />
            <div>
              <div className="text-sm sm:text-base font-display font-black tracking-wider uppercase text-noir-ink group-hover:text-noir-blood transition-colors">
                SQL DETECTIVE NOIR
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-1.5">
            <NavLink to="/tutorials" className={navLinkClasses}>
              <GraduationCap className="w-4 h-4 text-noir-candleDark" />
              <span>{lang === 'VI' ? 'Học Viện' : 'Academy'}</span>
            </NavLink>
            <NavLink to="/cases" className={navLinkClasses}>
              <FileText className="w-4 h-4 text-noir-blood" />
              <span>{lang === 'VI' ? 'Vụ Án' : 'Cases'}</span>
            </NavLink>
            <NavLink to="/posts" className={navLinkClasses}>
              <Newspaper className="w-4 h-4 text-noir-candleDark" />
              <span>{lang === 'VI' ? 'Bản Tin' : 'Dispatches'}</span>
            </NavLink>
            <NavLink to="/wiki" className={navLinkClasses}>
              <BookOpen className="w-4 h-4 text-noir-blood" />
              <span>{lang === 'VI' ? 'Cẩm Nang' : 'Handbook'}</span>
            </NavLink>
            <NavLink to="/leaderboard" className={navLinkClasses}>
              <Trophy className="w-4 h-4 text-noir-candleDark" />
              <span>{lang === 'VI' ? 'Bảng Xếp Hạng' : 'Leaderboard'}</span>
            </NavLink>
          </nav>

          {/* Right Action Section */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Stats Pill */}
                <div className="flex items-center gap-1 bg-amber-950/10 border border-amber-700/20 px-2.5 py-1 rounded-[3px] text-xs font-mono font-bold text-amber-800 shadow-sm select-none">
                  <span className="leading-none">{user.totalScore ?? 0}</span>
                  <span className="leading-none text-xs">⭐</span>
                </div>

                {/* Premium Status Badge (only for active special agents) */}
                {isPremium && (
                  <Badge variant="gold" size="sm" className="hidden lg:inline-flex gap-1 py-1">
                    <Sparkles className="w-3 h-3 text-noir-candleDark" />
                    <span>{lang === 'VI' ? 'ĐẶC VỤ CAO CẤP' : 'SPECIAL AGENT'}</span>
                  </Badge>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-noir-borderDark/60">
                  <Link
                    to="/profile"
                    className="text-xs font-typewriter font-bold text-noir-ink hover:text-noir-blood transition-colors flex items-center gap-1.5"
                  >
                    <div className="w-6 h-6 rounded-[2px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-[11px] font-bold text-noir-blood overflow-hidden shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span>{user.username}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title={lang === 'VI' ? 'Đăng xuất' : 'Sign Out'}
                    className="p-1.5 rounded text-noir-inkMuted hover:text-noir-blood hover:bg-noir-card/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link to="/login">
                  <Button variant="secondary" size="sm" className="whitespace-nowrap">
                    {lang === 'VI' ? 'Đăng Nhập' : 'Sign In'}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="gold" size="sm" className="whitespace-nowrap" leftIcon={<Award className="w-4 h-4" />}>
                    {lang === 'VI' ? 'Đăng Ký' : 'Register'}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="sm:hidden flex items-center gap-2">

            <NavLink
              to="/tutorials"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded text-xs font-typewriter font-bold uppercase transition-colors border',
                  isActive
                    ? 'bg-noir-blood text-noir-parchment border-noir-bloodDark'
                    : 'bg-noir-card border-noir-borderDark text-noir-ink hover:bg-noir-cardHover'
                )
              }
            >
              <GraduationCap className="w-3.5 h-3.5 text-noir-candleDark" />
              <span>{lang === 'VI' ? 'Học Viện' : 'Academy'}</span>
            </NavLink>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-noir-inkMuted hover:text-noir-ink rounded hover:bg-noir-card/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t-2 border-noir-borderDark bg-noir-paper px-4 pt-3 pb-5 space-y-3 shadow-noir-card">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-noir-borderDark">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-[2px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-xs font-bold text-noir-blood font-typewriter">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-noir-ink">{user.username}</div>
                      <div className="text-xs text-noir-inkMuted font-mono">{user.email}</div>
                    </div>
                  </div>
                  {isPremium && (
                    <Badge variant="gold" size="sm">{lang === 'VI' ? 'ĐẶC VỤ' : 'PREMIUM'}</Badge>
                  )}
                </div>

                <div className="flex items-center justify-center py-1.5 bg-amber-950/10 rounded-[2px] font-mono font-bold text-xs border border-amber-700/20 shadow-sm">
                  <div className="text-amber-800 flex items-center gap-1 leading-none">
                    <span className="leading-none">{user.totalScore ?? 0}</span>
                    <span className="leading-none text-xs">⭐</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    to="/tutorials"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card font-bold"
                  >
                    <GraduationCap className="w-4 h-4 text-noir-candleDark" />
                    <span>{lang === 'VI' ? 'Học Viện Thám Tử' : 'Detective Academy'}</span>
                  </Link>
                  <Link
                    to="/cases"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card"
                  >
                    <FileText className="w-4 h-4 text-noir-blood" />
                    <span>{lang === 'VI' ? 'Hồ Sơ Vụ Án' : 'Case Files'}</span>
                  </Link>
                  <Link
                    to="/posts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card"
                  >
                    <Newspaper className="w-4 h-4 text-noir-candleDark" />
                    <span>{lang === 'VI' ? 'Bản Tin Điều Tra' : 'Detective Dispatches'}</span>
                  </Link>
                  <Link
                    to="/wiki"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card"
                  >
                    <BookOpen className="w-4 h-4 text-noir-blood" />
                    <span>{lang === 'VI' ? 'Cẩm Nang' : 'Handbook'}</span>
                  </Link>
                  <Link
                    to="/leaderboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card"
                  >
                    <Trophy className="w-4 h-4 text-noir-candleDark" />
                    <span>{lang === 'VI' ? 'Bảng Xếp Hạng' : 'Leaderboard'}</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card"
                  >
                    <UserIcon className="w-4 h-4 text-noir-inkMuted" />
                    <span>{lang === 'VI' ? 'Hồ Sơ & Cài Đặt' : 'Detective Badge'}</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-noir-borderDark">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    {lang === 'VI' ? 'Đăng Xuất' : 'Sign Out'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/tutorials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card font-bold"
                >
                  <GraduationCap className="w-4 h-4 text-noir-candleDark" />
                  <span>{lang === 'VI' ? 'Học Viện Thám Tử (Miễn Phí)' : 'Detective Academy (Free)'}</span>
                </Link>
                <Link
                  to="/cases"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card"
                >
                  <FileText className="w-4 h-4 text-noir-blood" />
                  <span>{lang === 'VI' ? 'Hồ Sơ Vụ Án' : 'Case Files'}</span>
                </Link>
                <Link
                  to="/wiki"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card"
                >
                  <BookOpen className="w-4 h-4 text-noir-blood" />
                  <span>{lang === 'VI' ? 'Cẩm Nang' : 'Handbook'}</span>
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded text-xs font-typewriter text-noir-ink hover:bg-noir-card"
                >
                  <Trophy className="w-4 h-4 text-noir-candleDark" />
                  <span>{lang === 'VI' ? 'Bảng Xếp Hạng' : 'Leaderboard'}</span>
                </Link>
                <div className="pt-2 border-t border-noir-borderDark flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      {lang === 'VI' ? 'Đăng Nhập' : 'Sign In'}
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gold" className="w-full">
                      {lang === 'VI' ? 'Đăng Ký' : 'Register'}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

