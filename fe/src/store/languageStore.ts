import { create } from 'zustand';

export type AppLanguage = 'VI' | 'EN';

const LANGUAGE_STORAGE_KEY = 'app_language';

interface LanguageState {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  toggleLang: () => void;
}

const getInitialLanguage = (): AppLanguage => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'EN' || saved === 'VI') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'VI';
};

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: getInitialLanguage(),
  setLang: (lang: AppLanguage) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    set({ lang });
  },
  toggleLang: () => {
    set((state) => {
      const nextLang = state.lang === 'VI' ? 'EN' : 'VI';
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
      } catch {
        // ignore
      }
      return { lang: nextLang };
    });
  },
}));
