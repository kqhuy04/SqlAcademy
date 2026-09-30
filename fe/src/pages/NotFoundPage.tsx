import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { StampBadge } from '@/components/ui/StampBadge';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { useLanguageStore } from '@/store/languageStore';
import { FolderArchive, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen bg-noir-parchment flex flex-col items-center justify-center p-6 text-center paper-texture relative selection:bg-noir-blood selection:text-noir-paper">
      {/* Caution tape strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-noir-candle via-noir-blood to-noir-candle opacity-80" />

      <AnimatedPage className="max-w-lg w-full">
        <div className="bg-noir-paper border-2 border-noir-borderDark rounded-lg p-8 sm:p-10 shadow-noir-lg relative overflow-hidden">
          {/* Top docket tag */}
          <div className="border-b-2 border-noir-borderDark pb-4 mb-6 flex items-center justify-between text-xs font-typewriter text-noir-inkMuted uppercase tracking-wider">
            <span>{lang === 'VI' ? 'HỒ SƠ SỰ CỐ SỐ 404' : 'INCIDENT DOSSIER NO. 404'}</span>
            <span className="text-noir-blood font-bold">{lang === 'VI' ? 'CÔNG VĂN ĐẶC BIỆT' : 'SPECIAL DISPATCH'}</span>
          </div>

          <div className="flex justify-center mb-5">
            <StampBadge
              label={lang === 'VI' ? 'HIỆN TRƯỜNG ĐÃ PHONG TỎA • 404' : 'CRIME SCENE SEALED • 404'}
              variant="crime"
              rotation={0}
              size="lg"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-serif text-noir-ink tracking-tight mb-3">
            {lang === 'VI' ? 'Không Tìm Thấy Hồ Sơ' : 'Dossier Not Found'}
          </h1>

          <p className="text-sm font-serif text-noir-inkMuted leading-relaxed mb-8">
            {lang === 'VI'
              ? 'Hồ sơ vụ án hoặc dấu vết điều tra bạn đang tìm kiếm không tồn tại trong kho lưu trữ của học viện, hoặc đã bị niêm phong bảo mật bởi Bộ Chỉ Huy.'
              : 'The designated case file or registry trail you are pursuing does not exist in bureau archives, or has been classified and sealed by High Command.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-noir-border/60">
            <Link to="/cases" className="w-full sm:w-auto">
              <Button variant="gold" leftIcon={<FolderArchive className="w-4 h-4" />} className="w-full">
                {lang === 'VI' ? 'Quay Lại Hồ Sơ Vụ Án' : 'Return to Case Files'}
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" leftIcon={<Home className="w-4 h-4" />} className="w-full">
                {lang === 'VI' ? 'Trụ Sở Học Viện' : 'Bureau Headquarters'}
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedPage>
    </div>
  );
};

