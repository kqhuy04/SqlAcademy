import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { StampBadge } from '@/components/ui/StampBadge';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useLanguageStore } from '@/store/languageStore';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  BookOpen,
  Database,
  Brain,
  TrendingUp,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguageStore();

  return (
    <PageWrapper fullWidth className="p-0">
      <AnimatedPage className="text-noir-ink flex flex-col selection:bg-noir-blood selection:text-noir-parchment">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-32 border-b-2 border-noir-borderDark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Stamp Label */}
          <div className="mb-6 inline-block">
            <StampBadge variant="blood" size="md" rotation={0}>
              {lang === 'VI'
                ? 'HỒ SƠ KHẨN CẤP • QUYỀN HẠN TỐI MẬT CẤP 3'
                : 'URGENT DOSSIER • TOP SECRET CLEARANCE LEVEL 3'}
            </StampBadge>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-noir-ink tracking-tight uppercase max-w-4xl mx-auto leading-tight">
            <span className="block whitespace-normal sm:whitespace-nowrap">
              {lang === 'VI' ? 'DỮ LIỆU KHÔNG BAO GIỜ NÓI DỐI.' : 'DATA NEVER LIES.'}
            </span>
            <span className="block text-noir-blood italic underline decoration-noir-blood/40 decoration-wavy underline-offset-6 mt-1 text-xl sm:text-3xl lg:text-4xl">
              {lang === 'VI' ? 'ĐỂ SQL VẠCH MẶT KẺ THỦ ÁC.' : 'LET SQL EXPOSE THE CULPRIT.'}
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg font-serif text-noir-inkMuted max-w-2xl mx-auto leading-relaxed italic">
            {lang === 'VI'
              ? '“Thẩm vấn cơ sở dữ liệu hiện trường, truy vấn hồ sơ tội phạm thực tế, lật tẩy chứng cứ ngoại phạm và phá giải các đại án ly kỳ.”'
              : '“Interrogate crime scene databases, query live criminal records, dissect fabricated alibis, and crack chilling felony cases.”'}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/tutorials">
              <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-noir-card" leftIcon={<GraduationCap className="w-4 h-4" />}>
                {lang === 'VI' ? 'Bắt Đầu Huấn Luyện SQL (Miễn Phí)' : 'Start Detective Training (Free)'}
              </Button>
            </Link>
            <Link to={isAuthenticated ? '/cases' : '/register'}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-noir-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {isAuthenticated
                  ? (lang === 'VI' ? 'Vào Kho Lưu Trữ Vụ Án' : 'Enter Case Archive')
                  : (lang === 'VI' ? 'Mở Hồ Sơ Vụ Án' : 'Unseal Case Dossier')}
              </Button>
            </Link>
          </div>

          {/* Typewriter Desk Case Mockup */}
          <div className="mt-16 max-w-4xl mx-auto bg-noir-paper border-2 border-noir-borderDark rounded-[4px] shadow-noir-lift overflow-hidden text-left font-mono relative">
            {/* Top Docket Rule */}
            <div className="bg-noir-card px-4 py-3 border-b-2 border-noir-borderDark flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-noir-blood" />
                <span className="text-xs font-typewriter font-bold uppercase text-noir-ink tracking-wider">
                  {lang === 'VI'
                    ? 'BIÊN BẢN HIỆN TRƯỜNG • VỤ ÁN #01: VỤ TRỘM TẠI BẢO TÀNG NGHỆ THUẬT'
                    : 'CRIME SCENE TRANSCRIPT • CASE #01: THE ART MUSEUM HEIST'}
                </span>
              </div>
              <StampBadge variant="blood" size="sm" rotation={0} animateIn={false}>
                {lang === 'VI' ? 'CHỨNG CỨ GIÁM ĐỊNH' : 'FORENSIC EVIDENCE'}
              </StampBadge>
            </div>

            {/* Typewriter Sheet Body */}
            <div className="p-6 text-xs sm:text-sm space-y-2.5 bg-[#FAF6EC] font-mono leading-relaxed">
              <div className="text-noir-inkMuted font-serif italic text-xs">
                {lang === 'VI'
                  ? '-- Ghi chú thám tử: Truy vết khách VIP rời khỏi Phòng trưng bày A trước khi còi báo động vang lên:'
                  : '-- Detective note: Trace VIP visitors who exited Gallery A before the alarm sounded:'}
              </div>
              <div className="text-noir-blood font-bold">
                SELECT v.full_name, e.entry_at, v.exit_at
              </div>
              <div className="text-noir-ink">
                FROM visitors v JOIN security_events e ON v.id = e.visitor_id
              </div>
              <div className="text-noir-candleDark font-bold">
                WHERE e.zone = &apos;GALLERY_A&apos; AND v.badge_zone = &apos;VIP&apos; AND v.exit_at &lt; &apos;2024-01-15 22:00:00&apos;;
              </div>
              <div className="pt-3 text-noir-stamp flex items-center gap-2 border-t border-dashed border-noir-borderDark/80 mt-4 font-typewriter text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-noir-stamp shrink-0" />
                <span>
                  {lang === 'VI'
                    ? 'Nghi phạm được xác định: Oliver Hayes (Rời cổng phụ lúc 21:58:30)'
                    : 'Suspect identified: Oliver Hayes (Exited side gate at 21:58:30)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Tại Sao Phải Học SQL? */}
      <section className="py-20 border-b-2 border-noir-borderDark bg-noir-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-noir-ink uppercase tracking-tight">
              {lang === 'VI' ? 'Tại Sao Phải Học SQL?' : 'Why Learn SQL?'}
            </h2>
            <p className="text-xs font-typewriter text-noir-blood mt-2 uppercase tracking-widest font-bold">
              {lang === 'VI'
                ? 'DỮ LIỆU LÀ SỰ THẬT DUY NHẤT • SQL LÀ CHÌA KHÓA ĐỂ GIẢI MÃ'
                : 'DATA NEVER LIES • SQL IS THE UNIVERSAL KEY'}
            </p>
            <p className="text-xs sm:text-sm font-serif text-noir-inkMuted mt-2 max-w-2xl mx-auto italic">
              {lang === 'VI'
                ? '“Trong kỷ nguyên số, mọi thông tin giá trị nhất đều nằm trong cơ sở dữ liệu. Làm chủ SQL là sở hữu khả năng tự mình tìm ra sự thật mà không cần dựa dẫm vào bất kỳ ai.”'
                : '“In the digital age, truth hides inside databases. Mastering SQL grants the autonomy to uncover facts directly from raw data.”'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 relative shadow-noir-card hover:shadow-noir-lift hover:-translate-y-1 transition-all duration-200">
              <div className="h-1 w-full bg-noir-blood absolute top-0 left-0 right-0 rounded-t-[2px]" />
              <div className="w-12 h-12 rounded-[3px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-noir-blood mb-4 shadow-sm">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-noir-ink mb-2">
                {lang === 'VI' ? 'Ngôn Ngữ Chung Của Mọi Dữ Liệu' : 'The Universal Language of Data'}
              </h3>
              <p className="text-xs font-serif text-noir-inkMuted leading-relaxed">
                {lang === 'VI'
                  ? 'Dù là PostgreSQL, MySQL, SQLite, Oracle hay BigQuery — hơn 50 năm qua, SQL vẫn là tiêu chuẩn bất biến để giao tiếp với mọi hệ cơ sở dữ liệu trên thế giới.'
                  : 'PostgreSQL, MySQL, SQLite, Oracle or BigQuery — for over 50 years, SQL has been the immutable universal standard for relational databases.'}
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 relative shadow-noir-card hover:shadow-noir-lift hover:-translate-y-1 transition-all duration-200">
              <div className="h-1 w-full bg-noir-candleDark absolute top-0 left-0 right-0 rounded-t-[2px]" />
              <div className="w-12 h-12 rounded-[3px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-noir-candleDark mb-4 shadow-sm">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-noir-ink mb-2">
                {lang === 'VI' ? 'Tư Duy Phân Tích & Phản Biện' : 'Analytical & Critical Reasoning'}
              </h3>
              <p className="text-xs font-serif text-noir-inkMuted leading-relaxed">
                {lang === 'VI'
                  ? 'Không còn phán đoán cảm tính. Từng câu truy vấn rèn luyện khả năng xâu chuỗi sự kiện, bóc tách mối quan hệ logic giữa các thực thể và đưa ra quyết định dựa trên bằng chứng.'
                  : 'No guesswork. SQL sharpens your deductive reasoning, mapping entity relationships and establishing truth backed by empirical evidence.'}
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 relative shadow-noir-card hover:shadow-noir-lift hover:-translate-y-1 transition-all duration-200">
              <div className="h-1 w-full bg-noir-stamp absolute top-0 left-0 right-0 rounded-t-[2px]" />
              <div className="w-12 h-12 rounded-[3px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-noir-stamp mb-4 shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-noir-ink mb-2">
                {lang === 'VI' ? 'Lợi Thế Nghề Nghiệp Vượt Trội' : 'Irreplaceable Career Advantage'}
              </h3>
              <p className="text-xs font-serif text-noir-inkMuted leading-relaxed">
                {lang === 'VI'
                  ? 'Kỹ năng nền tảng số 1 được mọi nhà tuyển dụng săn đón, từ Software Engineer, Data Analyst, Product Manager đến chuyên viên Kinh doanh và Tài chính số.'
                  : 'The top technical skillset sought by tech leaders, essential for software engineers, data analysts, business intelligence, and digital forensics.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Website Này Dành Cho Ai? */}
      <section className="py-20 border-b-2 border-noir-borderDark bg-noir-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-noir-ink uppercase tracking-tight">
              {lang === 'VI' ? 'Website Này Dành Cho Ai?' : 'Who Is This Platform For?'}
            </h2>
            <p className="text-xs font-typewriter text-noir-blood mt-2 uppercase tracking-widest font-bold">
              {lang === 'VI'
                ? 'TỪ TÂN BINH ĐẾN ĐIỀU TRA VIÊN DỮ LIỆU KỲ CỰU'
                : 'FROM FRESH CADETS TO SEASONED FORENSIC DETECTIVES'}
            </p>
            <p className="text-xs sm:text-sm font-serif text-noir-inkMuted mt-2 max-w-2xl mx-auto italic">
              {lang === 'VI'
                ? '“Thiết kế cho bất kỳ ai muốn biến kỹ năng truy vấn dữ liệu khô khan thành trải nghiệm giải mã sự thật lôi cuốn.”'
                : '“Designed for anyone who wants to turn dry syntax drills into thrilling forensic problem-solving adventures.”'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Audience 1 */}
            <div className="bg-noir-card/60 border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-xs hover:border-noir-blood hover:bg-noir-card transition-all">
              <div className="w-10 h-10 rounded-[3px] bg-noir-paper border border-noir-borderDark flex items-center justify-center text-noir-blood mb-3 font-mono font-bold">
                01
              </div>
              <h3 className="text-base font-display font-bold text-noir-ink mb-2">
                {lang === 'VI' ? 'Người Mới Bắt Đầu' : 'Beginners & Fresh Starters'}
              </h3>
              <p className="text-xs font-serif text-noir-inkMuted leading-relaxed">
                {lang === 'VI'
                  ? 'Chưa từng viết dòng code nào? Cốt truyện thám tử phá án hấp dẫn sẽ dẫn dắt bạn từng bước hiểu bản chất câu lệnh mà không thấy khô khan, nhàm chán.'
                  : 'Never written a line of code? Engaging noir detective scenarios guide you step-by-step through core database principles without boredom.'}
              </p>
            </div>

            {/* Audience 2 */}
            <div className="bg-noir-card/60 border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-xs hover:border-noir-blood hover:bg-noir-card transition-all">
              <div className="w-10 h-10 rounded-[3px] bg-noir-paper border border-noir-borderDark flex items-center justify-center text-noir-candleDark mb-3 font-mono font-bold">
                02
              </div>
              <h3 className="text-base font-display font-bold text-noir-ink mb-2">
                {lang === 'VI' ? 'Sinh Viên CNTT & Kinh Tế' : 'Students & Academics'}
              </h3>
              <p className="text-xs font-serif text-noir-inkMuted leading-relaxed">
                {lang === 'VI'
                  ? 'Cần môi trường thực hành thực tế để chuẩn bị đi làm? Tiếp cận các bảng dữ liệu mô phỏng hiện trường đời thật thay vì các ví dụ lý thuyết xa rời thực tế.'
                  : 'Need hands-on experience for interviews? Work on realistic relational schemas with multi-table correlations instead of abstract textbook tables.'}
              </p>
            </div>

            {/* Audience 3 */}
            <div className="bg-noir-card/60 border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-xs hover:border-noir-blood hover:bg-noir-card transition-all">
              <div className="w-10 h-10 rounded-[3px] bg-noir-paper border border-noir-borderDark flex items-center justify-center text-noir-stamp mb-3 font-mono font-bold">
                03
              </div>
              <h3 className="text-base font-display font-bold text-noir-ink mb-2">
                {lang === 'VI' ? 'Developer & Data Analyst' : 'Developers & Data Analysts'}
              </h3>
              <p className="text-xs font-serif text-noir-inkMuted leading-relaxed">
                {lang === 'VI'
                  ? 'Muốn nâng tầm tay nghề? Thử thách bản thân với Subqueries, CTEs, Window Functions phức tạp và mổ xẻ kế hoạch tối ưu hóa EXPLAIN QUERY PLAN.'
                  : 'Want to advance your edge? Challenge complex CTEs, analytical window functions, and optimize query performance with EXPLAIN execution plans.'}
              </p>
            </div>

            {/* Audience 4 */}
            <div className="bg-noir-card/60 border-2 border-noir-borderDark rounded-[4px] p-5 shadow-noir-xs hover:border-noir-blood hover:bg-noir-card transition-all">
              <div className="w-10 h-10 rounded-[3px] bg-noir-paper border border-noir-borderDark flex items-center justify-center text-noir-blood mb-3 font-mono font-bold">
                04
              </div>
              <h3 className="text-base font-display font-bold text-noir-ink mb-2">
                {lang === 'VI' ? 'Người Đam Mê Phá Án' : 'Puzzle & Mystery Fans'}
              </h3>
              <p className="text-xs font-serif text-noir-inkMuted leading-relaxed">
                {lang === 'VI'
                  ? 'Yêu thích Sherlock Holmes hay tư duy trinh thám? Trải nghiệm cảm giác dùng truy vấn SQL như chiếc kính lúp để vạch trần kẻ phạm tội qua dấu vết kỹ thuật số.'
                  : 'Love Sherlock Holmes and deduction games? Experience using SQL queries as a forensic magnifying glass to expose criminal perpetrators.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Website Này Có Những Gì? */}
      <section className="py-20 border-b-2 border-noir-borderDark bg-noir-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-display font-black text-noir-ink uppercase tracking-tight">
              {lang === 'VI' ? 'Website Này Có Những Gì?' : 'What Does This Platform Offer?'}
            </h2>
            <p className="text-xs font-typewriter text-noir-blood mt-2 uppercase tracking-widest font-bold">
              {lang === 'VI'
                ? 'HỆ SINH THÁI TOÀN DIỆN • TỪ HỌC TẬP ĐẾN THỰC CHIẾN'
                : 'COMPREHENSIVE ECOSYSTEM • FROM ZERO TO MASTERY'}
            </p>
            <p className="text-xs sm:text-sm font-serif text-noir-inkMuted mt-2 max-w-2xl mx-auto italic">
              {lang === 'VI'
                ? '“Bộ ba không gian chuyên biệt để bạn học tập có hệ thống, luyện tập phá án thực tế và tra cứu mọi lúc mọi nơi.”'
                : '“A triad of specialized spaces to learn systematically, battle real cases, and reference forensic SQL syntax.”'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Học Viện -> Dạy SQL */}
            <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 relative shadow-noir-card hover:shadow-noir-lift hover:-translate-y-1 transition-all flex flex-col justify-between group">
              <div>
                <div className="h-1.5 w-full bg-noir-blood absolute top-0 left-0 right-0 rounded-t-[2px]" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[3px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-noir-blood shadow-sm group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-950/15 px-2 py-0.5 rounded border border-emerald-700/30">
                    {lang === 'VI' ? 'Dạy SQL Bài Bản' : 'Structured Course'}
                  </span>
                </div>
                <h3 className="text-xl font-display font-black text-noir-ink mb-2 group-hover:text-noir-blood transition-colors">
                  {lang === 'VI' ? 'Học Viện Thám Tử' : 'Detective Academy'}
                </h3>
                <p className="text-xs font-serif text-noir-inkMuted leading-relaxed mb-4">
                  {lang === 'VI'
                    ? 'Lộ trình huấn luyện chuẩn mực từ DQL căn bản, hàm tổng hợp Aggregation, nối bảng JOINs, đến Subqueries, CTEs và Window Functions. Kèm sơ đồ trực quan hóa dữ liệu và trình soạn thảo SQLite nhúng sẵn trên trình duyệt 100% không cần cài đặt.'
                    : 'Systematic curriculum from basic DQL, aggregations, JOINs, to advanced CTEs and window functions with interactive diagrams and zero-setup in-browser SQLite.'}
                </p>
              </div>
              <Link to="/tutorials" className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-between font-bold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {lang === 'VI' ? 'Vào Học Viện' : 'Enter Academy'}
                </Button>
              </Link>
            </div>

            {/* Feature 2: Vụ Án -> Luyện Tập */}
            <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 relative shadow-noir-card hover:shadow-noir-lift hover:-translate-y-1 transition-all flex flex-col justify-between group">
              <div>
                <div className="h-1.5 w-full bg-noir-candleDark absolute top-0 left-0 right-0 rounded-t-[2px]" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[3px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-noir-candleDark shadow-sm group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-950/15 px-2 py-0.5 rounded border border-amber-700/30">
                    {lang === 'VI' ? 'Luyện Tập Thực Chiến' : 'Hands-on Practice'}
                  </span>
                </div>
                <h3 className="text-xl font-display font-black text-noir-ink mb-2 group-hover:text-noir-blood transition-colors">
                  {lang === 'VI' ? 'Hồ Sơ Vụ Án' : 'Criminal Case Files'}
                </h3>
                <p className="text-xs font-serif text-noir-inkMuted leading-relaxed mb-4">
                  {lang === 'VI'
                    ? 'Hóa thân thành thám tử hình sự tiếp nhận 20 đại án ly kỳ: trộm bảo tàng, kẻ rình rập mạng, rửa tiền buôn lậu. Trực tiếp viết lệnh SQL điều tra cơ sở dữ liệu thật, đối chiếu bằng chứng và phá án để thăng quân hàm.'
                    : 'Step into the shoes of a lead investigator across 20 high-stakes criminal dossiers. Query real incident tables, verify alibis, and submit forensic arrest warrants.'}
                </p>
              </div>
              <Link to="/cases" className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-between font-bold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {lang === 'VI' ? 'Khám Phá Vụ Án' : 'Explore Cases'}
                </Button>
              </Link>
            </div>

            {/* Feature 3: Cẩm Nang -> Wiki */}
            <div className="bg-noir-paper border-2 border-noir-borderDark rounded-[4px] p-6 relative shadow-noir-card hover:shadow-noir-lift hover:-translate-y-1 transition-all flex flex-col justify-between group">
              <div>
                <div className="h-1.5 w-full bg-noir-stamp absolute top-0 left-0 right-0 rounded-t-[2px]" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-[3px] bg-noir-card border border-noir-borderDark flex items-center justify-center text-noir-stamp shadow-sm group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-950/15 px-2 py-0.5 rounded border border-emerald-700/30">
                    {lang === 'VI' ? 'Wiki Tra Cứu' : 'Syntax Wiki'}
                  </span>
                </div>
                <h3 className="text-xl font-display font-black text-noir-ink mb-2 group-hover:text-noir-blood transition-colors">
                  {lang === 'VI' ? 'Cẩm Nang Cú Pháp' : 'SQL Handbook & Wiki'}
                </h3>
                <p className="text-xs font-serif text-noir-inkMuted leading-relaxed mb-4">
                  {lang === 'VI'
                    ? 'Bách khoa toàn thư tra cứu nhanh mọi mệnh đề và cú pháp SQL theo bảng chữ cái. Kèm sơ đồ trực quan hóa thứ tự thực thi chuẩn của SQL Engine (FROM ➔ WHERE ➔ GROUP BY ➔ SELECT ➔ ORDER BY).'
                    : 'Comprehensive alphabetical directory of standard SQL clauses with executable syntax snippets and the interactive execution order flowchart of relational SQL engines.'}
                </p>
              </div>
              <Link to="/wiki" className="mt-2">
                <Button variant="outline" size="sm" className="w-full justify-between font-bold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  {lang === 'VI' ? 'Mở Cẩm Nang' : 'Open Handbook'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 text-center bg-noir-paper">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-4 inline-block">
            <StampBadge variant="candle" size="sm" rotation={0}>
              {lang === 'VI' ? 'LỆNH CẤP QUYỀN ĐẶC BIỆT' : 'SPECIAL CLEARANCE WARRANT'}
            </StampBadge>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-black text-noir-ink uppercase tracking-tight">
            {lang === 'VI'
              ? 'Sẵn Sàng Mở Hồ Sơ Vụ Án Đầu Tiên Của Bạn?'
              : 'Ready to Unseal Your First Case File?'}
          </h2>
          <p className="text-xs sm:text-sm font-serif italic text-noir-inkMuted mt-3 max-w-md mx-auto">
            {lang === 'VI'
              ? 'Đăng ký tài khoản thám tử miễn phí chỉ trong 30 giây để bắt đầu công tác giám định kỹ thuật số.'
              : 'Register your free detective account in 30 seconds to begin digital forensic operations.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/tutorials">
              <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-noir-card" leftIcon={<GraduationCap className="w-4 h-4" />}>
                {lang === 'VI' ? 'Bắt Đầu Với Học Viện' : 'Start With Academy'}
              </Button>
            </Link>
            <Link to={isAuthenticated ? '/cases' : '/register'}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-noir-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {isAuthenticated
                  ? (lang === 'VI' ? 'Vào Kho Lưu Trữ Vụ Án' : 'Enter Case Archive')
                  : (lang === 'VI' ? 'Đăng Ký Tài Khoản Mới' : 'Register New Agent')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AnimatedPage>
  </PageWrapper>
);
};
