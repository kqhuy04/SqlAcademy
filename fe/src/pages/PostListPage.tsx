import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { postApi } from '@/api/post.api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Button } from '@/components/ui/Button';
import { useLanguageStore } from '@/store/languageStore';
import {
  Newspaper,
  PlusCircle,
  Tag as TagIcon,
  Heart,
  MessageSquare,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import type { PostSummaryResponse } from '@/types/post.types';

export const PostListPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { lang } = useLanguageStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTag = searchParams.get('tag') || '';
  const currentTab = searchParams.get('tab') || 'all'; // 'all' | 'my' | 'bookmarks'
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ['blog_tags'],
    queryFn: postApi.getAllTags,
  });

  // Fetch posts based on current tab
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['blog_posts', currentTab, selectedTag, page],
    queryFn: () => {
      if (currentTab === 'my') {
        return postApi.getMyPosts(page, 9);
      }
      if (currentTab === 'bookmarks') {
        return postApi.getMyBookmarks(page, 9);
      }
      return postApi.getApprovedPosts(selectedTag || undefined, page, 9);
    },
  });

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams();
    if (tab !== 'all') params.set('tab', tab);
    setSearchParams(params);
  };

  const handleTagClick = (tagName: string) => {
    const params = new URLSearchParams(searchParams);
    if (selectedTag === tagName) {
      params.delete('tag');
    } else {
      params.set('tag', tagName);
      params.delete('page');
    }
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  return (
    <PageWrapper>
      <AnimatedPage>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header Dossier Banner */}
          <div className="bg-noir-card border-2 border-noir-borderDark rounded-md p-6 sm:p-8 shadow-noir-md relative overflow-hidden">
            {/* Top classified document stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-noir-blood" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-typewriter font-bold text-noir-wax tracking-widest uppercase mb-1">
                  <Newspaper className="w-4 h-4" />
                  <span>{lang === 'VI' ? 'HỒ SƠ BẢN TIN ĐIỀU TRA' : 'DETECTIVE DISPATCHES & INTEL'}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-serif text-noir-ink tracking-tight">
                  {lang === 'VI' ? 'Nhật Ký & Chia Sẻ Nghiệp Vụ' : 'Case Dispatches & Knowledge'}
                </h1>
                <p className="mt-2 text-sm sm:text-base font-serif text-noir-inkMuted max-w-2xl leading-relaxed">
                  {lang === 'VI'
                    ? 'Nơi các thám tử trao đổi kinh nghiệm giải mã dữ liệu, tối ưu truy vấn SQL và phân tích chứng cứ thực tế.'
                    : 'The public briefing room where cadets and veteran investigators exchange SQL intelligence, performance insights, and forensics techniques.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                {user?.role === 'ROLE_ADMIN' && (
                  <Link to="/admin/posts">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<ShieldCheck className="w-4 h-4 text-noir-wax" />}
                      className="text-xs font-typewriter"
                    >
                      {lang === 'VI' ? 'Duyệt Hồ Sơ' : 'Review Queue'}
                    </Button>
                  </Link>
                )}

                {isAuthenticated ? (
                  <Link to="/posts/new">
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                      className="text-xs font-typewriter shadow-md"
                    >
                      {lang === 'VI' ? 'Viết Báo Cáo Mới' : 'File a Dispatch'}
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="secondary" size="sm" className="text-xs font-typewriter">
                      {lang === 'VI' ? 'Đăng nhập để viết bài' : 'Sign in to write'}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-noir-borderDark/50 overflow-x-auto select-none">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-3 py-1.5 rounded-sm text-xs font-typewriter uppercase tracking-wider transition-colors whitespace-nowrap font-bold ${
                  currentTab === 'all'
                    ? 'bg-noir-blood text-white shadow-sm'
                    : 'text-noir-ink hover:bg-noir-paperDark/70'
                }`}
              >
                {lang === 'VI' ? 'Tất cả bài viết' : 'All Dispatches'}
              </button>

              {isAuthenticated && (
                <>
                  <button
                    onClick={() => handleTabChange('my')}
                    className={`px-3 py-1.5 rounded-sm text-xs font-typewriter uppercase tracking-wider transition-colors whitespace-nowrap font-bold ${
                      currentTab === 'my'
                        ? 'bg-noir-blood text-white shadow-sm'
                        : 'text-noir-ink hover:bg-noir-paperDark/70'
                    }`}
                  >
                    {lang === 'VI' ? 'Bản tin của tôi' : 'My Dispatches'}
                  </button>
                  <button
                    onClick={() => handleTabChange('bookmarks')}
                    className={`px-3 py-1.5 rounded-sm text-xs font-typewriter uppercase tracking-wider transition-colors whitespace-nowrap font-bold ${
                      currentTab === 'bookmarks'
                        ? 'bg-noir-blood text-white shadow-sm'
                        : 'text-noir-ink hover:bg-noir-paperDark/70'
                    }`}
                  >
                    {lang === 'VI' ? 'Đã đánh dấu lưu' : 'Saved Bookmarks'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tags Filter Chips */}
          {tags.length > 0 && currentTab === 'all' && (
            <div className="flex items-center gap-2 flex-wrap bg-noir-card/60 border border-noir-borderDark p-3 rounded-md">
              <div className="flex items-center gap-1 text-xs font-typewriter font-bold text-noir-inkMuted pr-2 border-r border-noir-borderDark/60">
                <TagIcon className="w-3.5 h-3.5" />
                <span>CHỦ ĐỀ:</span>
              </div>
              {tags.map((t) => {
                const isActive = selectedTag.toLowerCase() === t.name.toLowerCase();
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTagClick(t.name)}
                    className={`text-xs font-typewriter px-2.5 py-1 rounded-sm border transition-all ${
                      isActive
                        ? 'bg-noir-wax text-white border-noir-waxDark shadow-sm font-bold'
                        : 'bg-noir-paperDark/50 text-noir-ink border-noir-borderDark hover:bg-noir-paperDark'
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
              {selectedTag && (
                <button
                  onClick={() => handleTagClick(selectedTag)}
                  className="text-xs font-typewriter text-noir-blood underline ml-2 hover:font-bold"
                >
                  {lang === 'VI' ? 'Xóa bộ lọc' : 'Clear filter'}
                </button>
              )}
            </div>
          )}

          {/* Posts Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-noir-inkMuted">
              <div className="w-8 h-8 rounded-full border-2 border-noir-borderDark border-t-noir-blood animate-spin mb-3" />
              <span className="font-typewriter text-xs uppercase tracking-widest font-bold">
                {lang === 'VI' ? 'ĐANG ĐỌC HỒ SƠ ĐIỀU TRA...' : 'LOADING CLASSIFIED INTEL...'}
              </span>
            </div>
          ) : !postsData || postsData.items.length === 0 ? (
            <div className="text-center py-20 bg-noir-card/40 border-2 border-dashed border-noir-borderDark rounded-md p-8">
              <BookOpen className="w-12 h-12 text-noir-borderDark mx-auto mb-3" />
              <h3 className="text-lg font-serif font-bold text-noir-ink">
                {lang === 'VI' ? 'Chưa có hồ sơ bản tin nào' : 'No dispatches found'}
              </h3>
              <p className="text-xs font-typewriter text-noir-inkMuted mt-1">
                {lang === 'VI'
                  ? 'Hãy là người đầu tiên ghi chép báo cáo điều tra và chia sẻ với đồng đội!'
                  : 'Be the first detective to file an intel report for this category.'}
              </p>
              {isAuthenticated && (
                <div className="mt-4">
                  <Link to="/posts/new">
                    <Button variant="gold" size="sm" className="font-typewriter text-xs">
                      {lang === 'VI' ? 'Viết bản tin ngay' : 'File Dispatch Now'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postsData.items.map((post) => (
                <PostCard key={post.id} post={post} lang={lang} isMyTab={currentTab === 'my'} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {postsData && postsData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-noir-borderDark/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
                className="font-typewriter text-xs"
              >
                {lang === 'VI' ? 'Trang trước' : 'Previous'}
              </Button>
              <span className="font-typewriter text-xs text-noir-inkMuted">
                {page + 1} / {postsData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={postsData.isLast || page >= postsData.totalPages - 1}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="font-typewriter text-xs"
              >
                {lang === 'VI' ? 'Trang kế' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </AnimatedPage>
    </PageWrapper>
  );
};

interface PostCardProps {
  post: PostSummaryResponse;
  lang: string;
  isMyTab?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, lang, isMyTab }) => {
  return (
    <article className="bg-noir-card border-2 border-noir-borderDark rounded-md overflow-hidden shadow-noir-sm hover:shadow-noir-md hover:-translate-y-1 transition-all duration-200 flex flex-col group relative">
      {/* Top status banner if My Posts tab */}
      {isMyTab && (
        <div className="px-3 py-1 bg-noir-paperDark border-b border-noir-borderDark flex items-center justify-between text-[11px] font-typewriter font-bold">
          <span>{lang === 'VI' ? 'TRẠNG THÁI:' : 'STATUS:'}</span>
          <span
            className={
              post.status === 'APPROVED'
                ? 'text-green-700'
                : post.status === 'PENDING'
                ? 'text-amber-700'
                : post.status === 'REJECTED'
                ? 'text-red-700'
                : 'text-noir-inkMuted'
            }
          >
            {post.status}
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <Link to={`/posts/${post.slug}`} className="block relative aspect-video overflow-hidden bg-noir-paperDark border-b border-noir-borderDark">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-noir-paper to-noir-card">
            <Newspaper className="w-10 h-10 text-noir-borderDark mb-2" />
            <span className="text-xs font-typewriter text-noir-inkFaint uppercase tracking-wider">
              CONFIDENTIAL DISPATCH
            </span>
          </div>
        )}

        {/* Vintage corner tag */}
        <div className="absolute top-2 right-2">
          {post.tags?.[0] && (
            <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-typewriter px-2 py-0.5 rounded border border-white/20">
              #{post.tags[0]}
            </span>
          )}
        </div>
      </Link>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/posts/${post.slug}`}>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-noir-ink group-hover:text-noir-blood transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h2>
          </Link>

          {/* Tags */}
          {post.tags && post.tags.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              {post.tags.slice(1, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-typewriter text-noir-inkMuted bg-noir-paperDark/70 px-1.5 py-0.5 rounded border border-noir-borderDark/40"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info: Author + Counters */}
        <div className="mt-4 pt-3 border-t border-noir-borderDark/50 flex items-center justify-between text-xs font-typewriter text-noir-inkMuted">
          {/* Author avatar & name */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[2px] bg-noir-paperDark border border-noir-borderDark flex items-center justify-center text-[10px] font-bold text-noir-blood overflow-hidden shrink-0">
              {post.authorAvatarUrl ? (
                <img src={post.authorAvatarUrl} alt={post.authorUsername} className="w-full h-full object-cover" />
              ) : (
                post.authorUsername?.charAt(0).toUpperCase()
              )}
            </div>
            <span className="font-bold text-noir-ink truncate max-w-[100px]">{post.authorUsername}</span>
          </div>

          {/* Stats icons */}
          <div className="flex items-center gap-3 text-noir-inkMuted text-[11px]">
            <span className="flex items-center gap-1" title="Lượt xem">
              <Eye className="w-3.5 h-3.5 text-noir-inkFaint" />
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1" title="Lượt thích">
              <Heart className="w-3.5 h-3.5 text-noir-wax" />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1" title="Bình luận">
              <MessageSquare className="w-3.5 h-3.5 text-noir-candleDark" />
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
