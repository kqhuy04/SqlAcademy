import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { postApi } from '@/api/post.api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Button } from '@/components/ui/Button';
import { MarkdownViewer } from '@/components/blog/MarkdownViewer';
import { useLanguageStore } from '@/store/languageStore';
import {
  Heart,
  Bookmark,
  Share2,
  Eye,
  MessageSquare,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  Loader2,
  Tag as TagIcon,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const { lang } = useLanguageStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch post details
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post_detail', slug],
    queryFn: () => postApi.getPostBySlug(slug!),
    enabled: Boolean(slug),
  });

  // Fetch comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['post_comments', post?.id],
    queryFn: () => postApi.getComments(post!.id),
    enabled: Boolean(post?.id),
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => postApi.toggleLike(post!.id),
    onSuccess: (data) => {
      queryClient.setQueryData(['post_detail', slug], (old: typeof post) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: data.liked,
          likeCount: data.likeCount,
        };
      });
    },
    onError: () => {
      toast.error('Không thể cập nhật lượt thích');
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: () => postApi.toggleBookmark(post!.id),
    onSuccess: (data) => {
      queryClient.setQueryData(['post_detail', slug], (old: typeof post) => {
        if (!old) return old;
        return {
          ...old,
          isBookmarked: data.bookmarked,
          bookmarkCount: data.bookmarkCount,
        };
      });
      toast.success(
        data.bookmarked
          ? (lang === 'VI' ? 'Đã lưu hồ sơ vào sổ tay điều tra' : 'Saved to dossier notes')
          : (lang === 'VI' ? 'Đã gỡ khỏi sổ tay' : 'Removed from saved dispatches')
      );
    },
    onError: () => {
      toast.error('Không thể cập nhật sổ tay');
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => postApi.addComment({ postId: post!.id, content }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['post_comments', post?.id] });
      queryClient.setQueryData(['post_detail', slug], (old: typeof post) => {
        if (!old) return old;
        return { ...old, commentCount: old.commentCount + 1 };
      });
      toast.success(lang === 'VI' ? 'Đã gửi ghi chú bình luận!' : 'Comment posted successfully!');
    },
    onError: () => {
      toast.error('Không thể đăng bình luận');
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => postApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post_comments', post?.id] });
      queryClient.setQueryData(['post_detail', slug], (old: typeof post) => {
        if (!old) return old;
        return { ...old, commentCount: Math.max(0, old.commentCount - 1) };
      });
      toast.success(lang === 'VI' ? 'Đã xóa bình luận' : 'Comment deleted');
    },
  });

  // Delete post
  const handleDeletePost = async () => {
    if (!window.confirm(lang === 'VI' ? 'Bạn có chắc chắn muốn tiêu hủy hồ sơ này?' : 'Destroy this classified file permanently?')) {
      return;
    }
    try {
      await postApi.deletePost(post!.id);
      toast.success(lang === 'VI' ? 'Đã xóa hồ sơ thành công' : 'Dispatch destroyed');
      navigate('/posts');
    } catch {
      toast.error('Không thể xóa bài viết');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success(lang === 'VI' ? 'Đã sao chép liên kết hồ sơ' : 'Dossier link copied');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="py-24 flex flex-col items-center justify-center text-noir-inkMuted">
          <div className="w-10 h-10 rounded-full border-[3px] border-noir-borderDark border-t-noir-blood animate-spin mb-3" />
          <span className="font-typewriter text-xs uppercase tracking-widest font-bold">
            {lang === 'VI' ? 'ĐANG GIẢI MÃ TẬP HỒ SƠ...' : 'DECRYPTING CLASSIFIED INTEL...'}
          </span>
        </div>
      </PageWrapper>
    );
  }

  if (error || !post) {
    return (
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-noir-card border-2 border-noir-borderDark rounded-md p-8 shadow-noir-md">
            <h2 className="text-2xl font-serif font-black text-noir-blood mb-2">
              {lang === 'VI' ? 'HỒ SƠ KHÔNG TỒN TẠI HOẶC BỊ HẠN CHẾ' : 'DISPATCH NOT FOUND OR RESTRICTED'}
            </h2>
            <p className="text-sm font-serif text-noir-inkMuted mb-6">
              {lang === 'VI'
                ? 'Hồ sơ này có thể chưa được ban thanh tra duyệt hoặc đã bị hủy.'
                : 'This dispatch might be unapproved, restricted, or archived.'}
            </p>
            <Link to="/posts">
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                {lang === 'VI' ? 'Quay lại danh sách' : 'Back to dispatches'}
              </Button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isAuthor = user?.id === post.authorId;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <PageWrapper>
      <AnimatedPage>
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Back Link & Action Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-noir-borderDark/60">
            <Link
              to="/posts"
              className="inline-flex items-center gap-1.5 text-xs font-typewriter font-bold text-noir-inkMuted hover:text-noir-blood transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'VI' ? 'TẤT CẢ BẢN TIN' : 'BACK TO DISPATCHES'}</span>
            </Link>

            {/* Author / Admin quick actions */}
            {(isAuthor || isAdmin) && (
              <div className="flex items-center gap-2">
                {isAuthor && (post.status === 'DRAFT' || post.status === 'REJECTED') && (
                  <Link to={`/posts/edit/${post.id}`}>
                    <Button variant="outline" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />} className="text-xs font-typewriter">
                      {lang === 'VI' ? 'Chỉnh sửa' : 'Edit'}
                    </Button>
                  </Link>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeletePost}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  className="text-xs font-typewriter"
                >
                  {lang === 'VI' ? 'Xóa bài' : 'Delete'}
                </Button>
              </div>
            )}
          </div>

          {/* Header Dossier Box */}
          <header className="bg-noir-card border-2 border-noir-borderDark rounded-md p-6 sm:p-8 shadow-noir-md relative overflow-hidden space-y-4">
            {/* Top Red Classified Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-noir-blood" />

            {/* Status indicator if not approved */}
            {post.status !== 'APPROVED' && (
              <div className="inline-block px-2.5 py-1 bg-amber-950/20 border border-amber-700/40 rounded text-xs font-typewriter font-bold text-amber-800">
                ⚠️ TRẠNG THÁI: {post.status} {post.rejectReason && `(Lý do: ${post.rejectReason})`}
              </div>
            )}

            {/* Post Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-noir-ink tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Metadata bar: Author, Date, Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-noir-borderDark/60 text-xs font-typewriter text-noir-inkMuted">
              {/* Author badge */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-noir-card border-2 border-noir-borderDark flex items-center justify-center text-sm font-bold text-noir-blood overflow-hidden shrink-0 shadow-sm">
                  {post.authorAvatarUrl ? (
                    <img src={post.authorAvatarUrl} alt={post.authorUsername} className="w-full h-full object-cover" />
                  ) : (
                    post.authorUsername?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-bold text-noir-ink text-sm">{post.authorUsername}</div>
                  <div className="text-[11px] text-noir-inkFaint flex items-center gap-2">
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString(lang === 'VI' ? 'vi-VN' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : lang === 'VI' ? 'Bản thảo chưa công bố' : 'Unpublished draft'}
                    </span>
                  </div>
                </div>
              </div>

              {/* View & Comment stats */}
              <div className="flex items-center gap-4 text-xs font-typewriter text-noir-inkMuted">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-noir-inkFaint" />
                  <span>{post.viewCount} lượt xem</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-noir-candleDark" />
                  <span>{post.commentCount} bình luận</span>
                </span>
              </div>
            </div>

            {/* Tags list */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <TagIcon className="w-3.5 h-3.5 text-noir-blood" />
                {post.tags.map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/posts?tag=${encodeURIComponent(tag)}`}
                    className="text-xs font-typewriter text-noir-blood hover:text-noir-bloodDark bg-noir-card/70 hover:bg-noir-cardHover px-2.5 py-0.5 rounded border border-noir-borderDark/50 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Social Floating Action Bar */}
          <div className="sticky top-20 z-30 bg-noir-paper/95 backdrop-blur-md border-2 border-noir-borderDark rounded-md p-3 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <button
                onClick={() => (isAuthenticated ? likeMutation.mutate() : toast.error('Vui lòng đăng nhập để thích bài viết'))}
                disabled={likeMutation.isPending}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-typewriter font-bold transition-all ${
                  post.isLiked
                    ? 'bg-noir-blood text-white border-noir-bloodDark shadow-sm'
                    : 'bg-noir-card text-noir-ink border-noir-borderDark hover:bg-noir-cardHover'
                }`}
                title="Thích bài viết"
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-white' : ''}`} />
                <span>{post.likeCount}</span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={() => (isAuthenticated ? bookmarkMutation.mutate() : toast.error('Vui lòng đăng nhập để lưu bài viết'))}
                disabled={bookmarkMutation.isPending}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-typewriter font-bold transition-all ${
                  post.isBookmarked
                    ? 'bg-noir-blood text-white border-noir-bloodDark shadow-sm'
                    : 'bg-noir-card text-noir-ink border-noir-borderDark hover:bg-noir-cardHover'
                }`}
                title="Lưu vào sổ tay điều tra"
              >
                <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-white' : ''}`} />
                <span>{post.bookmarkCount}</span>
              </button>
            </div>

            {/* Share link button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-noir-borderDark bg-noir-card hover:bg-noir-cardHover text-xs font-typewriter text-noir-ink font-bold transition-all"
              title="Sao chép liên kết"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-700" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Đã chép link' : 'Chia sẻ'}</span>
            </button>
          </div>

          {/* Main Article Content */}
          <div className="bg-noir-card/40 border-2 border-noir-borderDark rounded-md p-6 sm:p-10 shadow-noir-sm bg-[radial-gradient(#C4B6A0_1px,transparent_1px)] [background-size:16px_16px]">
            {post.thumbnailUrl && (
              <div className="mb-8 rounded-md overflow-hidden border-2 border-noir-borderDark shadow-md">
                <img src={post.thumbnailUrl} alt={post.title} className="w-full max-h-[450px] object-cover" />
              </div>
            )}

            <MarkdownViewer content={post.content} />
          </div>

          {/* Comments Section */}
          <section className="bg-noir-card border-2 border-noir-borderDark rounded-md p-6 sm:p-8 shadow-noir-md space-y-6">
            <div className="flex items-center gap-2 border-b border-noir-borderDark pb-3">
              <MessageSquare className="w-5 h-5 text-noir-blood" />
              <h2 className="text-xl font-bold font-serif text-noir-ink">
                {lang === 'VI' ? 'Ghi Chú & Bình Luận Điều Tra' : 'Case Notes & Comments'} ({comments.length})
              </h2>
            </div>

            {/* Add Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-[2px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-xs font-bold text-noir-blood shrink-0 overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={lang === 'VI' ? 'Ghi lại ý kiến hoặc phân tích chứng cứ của bạn...' : 'Enter your investigative note or analysis...'}
                      rows={3}
                      className="w-full p-3 rounded-md bg-noir-paper border-2 border-noir-borderDark text-noir-ink font-typewriter text-xs focus:outline-none focus:border-noir-blood transition-colors resize-y"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="gold"
                    size="sm"
                    disabled={addCommentMutation.isPending || !commentText.trim()}
                    leftIcon={addCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    className="text-xs font-typewriter"
                  >
                    {lang === 'VI' ? 'Đăng ghi chú' : 'Post Note'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-noir-card/50 border border-noir-borderDark rounded text-center text-xs font-typewriter text-noir-inkMuted">
                <Link to="/login" className="text-noir-blood font-bold underline">
                  {lang === 'VI' ? 'Đăng nhập' : 'Sign in'}
                </Link>{' '}
                {lang === 'VI' ? 'để để lại bình luận trên báo cáo này.' : 'to join the investigation discussion.'}
              </div>
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="py-6 text-center text-noir-inkMuted font-typewriter text-xs">
                {lang === 'VI' ? 'Đang tải bình luận...' : 'Loading case notes...'}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs font-typewriter text-noir-inkMuted italic text-center py-4">
                {lang === 'VI' ? 'Chưa có ghi chú nào. Hãy là người đầu tiên để lại phân tích!' : 'No investigative notes yet. Be the first to analyze!'}
              </p>
            ) : (
              <div className="space-y-4 pt-2">
                {comments.map((comment) => {
                  const isCommentAuthor = user?.id === comment.userId;
                  return (
                    <div
                      key={comment.id}
                      className="bg-noir-paper border border-noir-borderDark rounded-md p-4 space-y-2 text-xs font-typewriter"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-[2px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-[10px] font-bold text-noir-blood overflow-hidden shrink-0">
                            {comment.userAvatarUrl ? (
                              <img src={comment.userAvatarUrl} alt={comment.username} className="w-full h-full object-cover" />
                            ) : (
                              comment.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="font-bold text-noir-ink">{comment.username}</span>
                          <span className="text-[10px] text-noir-inkFaint">
                            {new Date(comment.createdAt).toLocaleString(lang === 'VI' ? 'vi-VN' : 'en-US')}
                          </span>
                        </div>

                        {(isCommentAuthor || isAdmin) && (
                          <button
                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                            className="text-noir-inkFaint hover:text-noir-blood transition-colors p-1"
                            title="Xóa bình luận"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-noir-ink font-serif text-sm leading-relaxed pl-8">
                        {comment.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </article>
      </AnimatedPage>
    </PageWrapper>
  );
};
