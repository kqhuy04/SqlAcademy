import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '@/api/post.api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MarkdownViewer } from '@/components/blog/MarkdownViewer';
import { useLanguageStore } from '@/store/languageStore';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { PostSummaryResponse, PostDetailResponse } from '@/types/post.types';

export const AdminPostModerationPage: React.FC = () => {
  const { lang } = useLanguageStore();
  const queryClient = useQueryClient();

  const [inspectPost, setInspectPost] = useState<PostDetailResponse | null>(null);
  const [rejectingPostId, setRejectingPostId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch pending posts
  const { data: pendingData, isLoading } = useQuery({
    queryKey: ['admin_pending_posts'],
    queryFn: () => postApi.getPendingPosts(0, 50),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (postId: number) => postApi.approvePost({ postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_pending_posts'] });
      setInspectPost(null);
      toast.success(lang === 'VI' ? 'Đã phê duyệt hồ sơ thành công!' : 'Dispatch approved for public release!');
    },
    onError: () => {
      toast.error('Không thể phê duyệt bài viết');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ postId, reason }: { postId: number; reason: string }) =>
      postApi.rejectPost({ postId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_pending_posts'] });
      setRejectingPostId(null);
      setRejectReason('');
      setInspectPost(null);
      toast.success(lang === 'VI' ? 'Đã từ chối duyệt bài viết' : 'Dispatch rejected');
    },
    onError: () => {
      toast.error('Không thể từ chối bài viết');
    },
  });

  const handleInspect = async (post: PostSummaryResponse) => {
    try {
      const detail = await postApi.getPostBySlug(post.slug);
      setInspectPost(detail);
    } catch {
      toast.error('Không thể tải chi tiết bài viết');
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPostId || !rejectReason.trim()) {
      toast.error('Vui lòng nêu rõ lý do từ chối');
      return;
    }
    rejectMutation.mutate({ postId: rejectingPostId, reason: rejectReason.trim() });
  };

  return (
    <PageWrapper>
      <AnimatedPage>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="bg-noir-card border-2 border-noir-borderDark rounded-md p-6 shadow-noir-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-noir-blood" />
            <div className="flex items-center gap-2 text-xs font-typewriter font-bold text-noir-blood tracking-widest uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>BAN THANH TRA HỌC VIỆN / CLEARANCE BUREAU</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-noir-ink">
              Kiểm Duyệt Báo Cáo Điều Tra Chờ Phê Duyệt
            </h1>
            <p className="text-xs font-typewriter text-noir-inkMuted mt-1">
              Xem xét các bài viết do học viên nộp trước khi cấp phép hiển thị công khai trên Bản Tin Học Viện.
            </p>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="py-20 flex justify-center text-noir-inkMuted">
              <Loader2 className="w-8 h-8 animate-spin text-noir-blood" />
            </div>
          ) : !pendingData || pendingData.items.length === 0 ? (
            <div className="bg-noir-card/50 border-2 border-dashed border-noir-borderDark rounded-md p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-700 mx-auto mb-3" />
              <h3 className="text-lg font-serif font-bold text-noir-ink">
                Hàng chờ kiểm duyệt đang trống!
              </h3>
              <p className="text-xs font-typewriter text-noir-inkMuted mt-1">
                Tất cả hồ sơ gửi lên đều đã được giải quyết hoặc chưa có bài viết mới.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingData.items.map((post) => (
                <div
                  key={post.id}
                  className="bg-noir-card border-2 border-noir-borderDark rounded-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-noir-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-typewriter font-bold bg-amber-950/20 text-amber-800 px-2 py-0.5 rounded border border-amber-700/30">
                        CHỜ PHÊ DUYỆT
                      </span>
                      <span className="text-xs font-typewriter text-noir-inkMuted">
                        Nộp lúc: {new Date(post.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold font-serif text-noir-ink">
                      {post.title}
                    </h2>

                    <div className="flex items-center gap-3 text-xs font-typewriter text-noir-inkMuted">
                      <span>Tác giả: <strong className="text-noir-ink">{post.authorUsername}</strong></span>
                      {post.tags && post.tags.length > 0 && (
                        <span>Tags: {post.tags.map((t) => `#${t}`).join(', ')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInspect(post)}
                      leftIcon={<Eye className="w-4 h-4" />}
                      className="text-xs font-typewriter"
                    >
                      Đọc Toàn Văn
                    </Button>

                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => approveMutation.mutate(post.id)}
                      disabled={approveMutation.isPending}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      className="text-xs font-typewriter"
                    >
                      Phê Duyệt
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectingPostId(post.id)}
                      leftIcon={<XCircle className="w-4 h-4" />}
                      className="text-xs font-typewriter"
                    >
                      Từ Chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inspect Full Post Modal */}
          {inspectPost && (
            <Modal isOpen={Boolean(inspectPost)} onClose={() => setInspectPost(null)} title={inspectPost.title}>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                <div className="text-xs font-typewriter text-noir-inkMuted pb-2 border-b border-noir-borderDark">
                  Tác giả: <strong>{inspectPost.authorUsername}</strong> | Ngày tạo: {new Date(inspectPost.createdAt).toLocaleString('vi-VN')}
                </div>
                {inspectPost.thumbnailUrl && (
                  <img src={inspectPost.thumbnailUrl} alt="Thumbnail" className="w-full max-h-60 object-cover rounded border" />
                )}
                <MarkdownViewer content={inspectPost.content} />

                <div className="flex justify-end gap-2 pt-4 border-t border-noir-borderDark">
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => approveMutation.mutate(inspectPost.id)}
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Phê Duyệt Ngay
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectingPostId(inspectPost.id);
                    }}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Từ Chối Bài Này
                  </Button>
                </div>
              </div>
            </Modal>
          )}

          {/* Reject Reason Modal */}
          {rejectingPostId && (
            <Modal
              isOpen={Boolean(rejectingPostId)}
              onClose={() => {
                setRejectingPostId(null);
                setRejectReason('');
              }}
              title="Lý Do Từ Chối Báo Cáo"
            >
              <form onSubmit={handleConfirmReject} className="space-y-4">
                <p className="text-xs font-serif text-noir-inkMuted">
                  Vui lòng nêu rõ lý do từ chối để học viên có thể hiệu đính và gửi lại duyệt:
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="VD: Thiếu ví dụ SQL minh họa, nội dung chưa đạt chuẩn hoặc trùng lặp..."
                  rows={4}
                  className="w-full p-3 rounded bg-noir-paper border-2 border-noir-borderDark text-noir-ink font-typewriter text-xs focus:outline-none focus:border-noir-blood"
                  required
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setRejectingPostId(null)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    disabled={rejectMutation.isPending || !rejectReason.trim()}
                  >
                    Xác Nhận Từ Chối
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      </AnimatedPage>
    </PageWrapper>
  );
};
