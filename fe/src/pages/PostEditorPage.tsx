import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postApi } from '@/api/post.api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { Button } from '@/components/ui/Button';
import { MarkdownViewer } from '@/components/blog/MarkdownViewer';
import { useLanguageStore } from '@/store/languageStore';
import {
  FileEdit,
  Save,
  Send,
  Eye,
  ArrowLeft,
  Tag as TagIcon,
  Image as ImageIcon,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PostEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { lang } = useLanguageStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If editing, fetch existing post details by id
  // Note: we can list my posts or fetch post.
  const { data: myPostsData, isLoading: isLoadingPost } = useQuery({
    queryKey: ['my_posts_for_edit'],
    queryFn: () => postApi.getMyPosts(0, 100),
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && myPostsData) {
      const found = myPostsData.items.find((p) => p.id === Number(id));
      if (found) {
        setTitle(found.title);
        setThumbnailUrl(found.thumbnailUrl || '');
        setTags(found.tags || []);
        // Fetch full content by slug
        postApi.getPostBySlug(found.slug).then((detail) => {
          setContent(detail.content);
        }).catch(() => {
          toast.error('Không thể tải nội dung bài viết');
        });
      }
    }
  }, [isEditing, myPostsData, id]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagInput('');
      return;
    }
    if (tags.length >= 5) {
      toast.error('Mỗi bài viết tối đa 5 chủ đề');
      return;
    }
    setTags([...tags, trimmed]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error(lang === 'VI' ? 'Vui lòng nhập tiêu đề và nội dung' : 'Please provide title and content');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await postApi.updatePost(Number(id), {
          title: title.trim(),
          content,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          tags,
        });
        toast.success(lang === 'VI' ? 'Đã lưu bản nháp thành công!' : 'Draft updated successfully!');
      } else {
        const created = await postApi.createPost({
          title: title.trim(),
          content,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          tags,
        });
        toast.success(lang === 'VI' ? 'Đã khởi tạo bản nháp thành công!' : 'Draft created successfully!');
        navigate(`/posts/edit/${created.id}`);
      }
    } catch {
      toast.error('Không thể lưu bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit for Clearance
  const handleSubmitClearance = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error(lang === 'VI' ? 'Vui lòng nhập tiêu đề và nội dung' : 'Please provide title and content');
      return;
    }

    try {
      setIsSubmitting(true);
      let targetId = Number(id);

      if (isEditing) {
        await postApi.updatePost(targetId, {
          title: title.trim(),
          content,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          tags,
        });
      } else {
        const created = await postApi.createPost({
          title: title.trim(),
          content,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          tags,
        });
        targetId = created.id;
      }

      // Submit for review
      await postApi.submitPost(targetId);
      toast.success(
        lang === 'VI'
          ? 'Đã gửi báo cáo lên ban thanh tra kiểm duyệt!'
          : 'Dispatch submitted for inspector clearance!'
      );
      navigate('/posts?tab=my');
    } catch {
      toast.error('Không thể gửi bài viết để duyệt');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && isLoadingPost) {
    return (
      <PageWrapper>
        <div className="py-24 flex items-center justify-center text-noir-inkMuted">
          <Loader2 className="w-8 h-8 animate-spin text-noir-blood" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <AnimatedPage>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-noir-borderDark/60">
            <Link
              to="/posts"
              className="inline-flex items-center gap-1.5 text-xs font-typewriter font-bold text-noir-inkMuted hover:text-noir-blood transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'VI' ? 'HỦY & QUAY LẠI' : 'CANCEL & EXIT'}</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                leftIcon={<Eye className="w-4 h-4" />}
                className="text-xs font-typewriter"
              >
                {previewMode
                  ? (lang === 'VI' ? 'Chế độ soạn thảo' : 'Editor View')
                  : (lang === 'VI' ? 'Xem trước (Preview)' : 'Preview')}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                leftIcon={<Save className="w-4 h-4" />}
                className="text-xs font-typewriter"
              >
                {lang === 'VI' ? 'Lưu Bản Nháp' : 'Save Draft'}
              </Button>

              <Button
                variant="gold"
                size="sm"
                onClick={handleSubmitClearance}
                disabled={isSubmitting}
                leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                className="text-xs font-typewriter shadow-md"
              >
                {lang === 'VI' ? 'Gửi Duyệt Bài' : 'Submit for Clearance'}
              </Button>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-noir-card border-2 border-noir-borderDark rounded-md p-6 sm:p-8 shadow-noir-md space-y-6 relative overflow-hidden">
            {/* Top Red Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-noir-blood" />

            <div className="flex items-center gap-2 text-xs font-typewriter font-bold text-noir-wax tracking-widest uppercase">
              <FileEdit className="w-4 h-4" />
              <span>
                {isEditing
                  ? (lang === 'VI' ? 'HIỆU ĐÍNH HỒ SƠ ĐIỀU TRA' : 'EDITING INVESTIGATION DISPATCH')
                  : (lang === 'VI' ? 'SOẠN THẢO BẢN TIN MỚI' : 'COMPOSE NEW CLASSIFIED INTEL')}
              </span>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-typewriter font-bold text-noir-ink uppercase mb-1.5">
                {lang === 'VI' ? 'Tiêu đề bản tin *' : 'Dispatch Title *'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'VI' ? 'VD: Phương pháp tối ưu truy vấn JOIN lớn không gây nghẽn RAM...' : 'E.g., Indexing strategies for high-frequency writes...'}
                className="w-full p-3.5 rounded-md bg-noir-paper border-2 border-noir-borderDark text-noir-ink font-serif text-lg font-bold focus:outline-none focus:border-noir-blood transition-colors"
                maxLength={255}
              />
            </div>

            {/* Thumbnail URL Input */}
            <div>
              <label className="block text-xs font-typewriter font-bold text-noir-ink uppercase mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-noir-wax" />
                <span>{lang === 'VI' ? 'Đường dẫn ảnh bìa (Tùy chọn)' : 'Cover Image URL (Optional)'}</span>
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... hoặc link ảnh bất kỳ"
                className="w-full p-2.5 rounded-md bg-noir-paper border-2 border-noir-borderDark text-noir-ink font-mono text-xs focus:outline-none focus:border-noir-blood transition-colors"
              />
              {thumbnailUrl && (
                <div className="mt-2 w-40 h-24 rounded border border-noir-borderDark overflow-hidden bg-noir-paperDark">
                  <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-typewriter font-bold text-noir-ink uppercase mb-1.5 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-noir-wax" />
                <span>{lang === 'VI' ? 'Chủ đề / Tags (Tối đa 5)' : 'Tags (Max 5)'}</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap p-2.5 rounded-md bg-noir-paper border-2 border-noir-borderDark">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-typewriter text-noir-ink bg-noir-card px-2.5 py-1 rounded border border-noir-borderDark"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-noir-inkFaint hover:text-noir-blood transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDownTag}
                      placeholder={tags.length === 0 ? (lang === 'VI' ? 'Nhập tag và bấm Enter...' : 'Type tag and press Enter...') : ''}
                      className="bg-transparent font-typewriter text-xs text-noir-ink focus:outline-none min-w-[120px]"
                    />
                    {tagInput && (
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="text-xs font-typewriter px-2 py-0.5 rounded bg-noir-card hover:bg-noir-cardHover border border-noir-borderDark text-noir-ink font-bold"
                      >
                        <Plus className="w-3 h-3 inline" /> Thêm
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Editor vs Preview Mode */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-typewriter font-bold text-noir-ink uppercase">
                  {lang === 'VI' ? 'Nội dung bài viết (Định dạng Markdown) *' : 'Dossier Content (Markdown) *'}
                </label>
                <span className="text-[11px] font-typewriter text-noir-inkMuted">
                  {lang === 'VI' ? 'Hỗ trợ code block ```sql ... ```, tiêu đề ##, trích dẫn >' : 'Supports ```sql ... ```, ## headings, > blockquotes'}
                </span>
              </div>

              {previewMode ? (
                <div className="min-h-[400px] p-6 rounded-md bg-noir-paper border-2 border-noir-borderDark">
                  <MarkdownViewer content={content || '*Chưa có nội dung để xem trước*'} />
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    lang === 'VI'
                      ? '## Giới thiệu vấn đề\n\nPhân tích câu lệnh SQL:\n\n```sql\nEXPLAIN ANALYZE\nSELECT * FROM suspects WHERE alibi IS NULL;\n```\n\n> Lưu ý: Hãy tạo index trên cột alibi để tăng tốc độ quét...'
                      : '## Investigation Notes\n\n```sql\nSELECT * FROM cases;\n```'
                  }
                  rows={16}
                  className="w-full p-4 rounded-md bg-noir-paper border-2 border-noir-borderDark text-noir-ink font-mono text-sm focus:outline-none focus:border-noir-blood transition-colors leading-relaxed"
                />
              )}
            </div>
          </div>
        </div>
      </AnimatedPage>
    </PageWrapper>
  );
};
