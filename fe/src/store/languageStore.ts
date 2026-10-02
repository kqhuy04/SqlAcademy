import { create } from 'zustand';

export type AppLanguage = 'VI' | 'EN';

const LANGUAGE_STORAGE_KEY = 'app_language';

interface LanguageState {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  toggleLang: () => void;
}

const syncHtmlLang = (lang: AppLanguage) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang.toLowerCase();
  }
};

const getInitialLanguage = (): AppLanguage => {
  let initial: AppLanguage = 'VI';
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'EN' || saved === 'VI') {
      initial = saved;
    }
  } catch {
    // ignore
  }
  syncHtmlLang(initial);
  return initial;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: getInitialLanguage(),
  setLang: (lang: AppLanguage) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    syncHtmlLang(lang);
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
      syncHtmlLang(nextLang);
      return { lang: nextLang };
    });
  },
}));
