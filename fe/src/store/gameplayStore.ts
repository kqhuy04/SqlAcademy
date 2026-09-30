import { create } from 'zustand';

interface GameplayState {
  hintsUsed: number;
  revealedHints: number[];
  attempts: number;
  sqlQuery: string;
  queryResult: Record<string, unknown>[] | null;
  queryError: string | null;
  isQueryRunning: boolean;
  isSubmitting: boolean;

  revealHint: (hintNumber: number) => void;
  incrementAttempts: () => void;
  setSqlQuery: (query: string) => void;
  setQueryResult: (result: Record<string, unknown>[] | null, error?: string | null) => void;
  setQueryRunning: (isRunning: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  resetSession: (defaultQuery?: string) => void;
}

export const useGameplayStore = create<GameplayState>((set) => ({
  hintsUsed: 0,
  revealedHints: [],
  attempts: 0,
  sqlQuery: '',
  queryResult: null,
  queryError: null,
  isQueryRunning: false,
  isSubmitting: false,

  revealHint: (hintNumber: number) =>
    set((state) => {
      if (state.revealedHints.includes(hintNumber)) return state;
      const updated = [...state.revealedHints, hintNumber];
      return {
        revealedHints: updated,
        hintsUsed: updated.length,
      };
    }),

  incrementAttempts: () =>
    set((state) => ({ attempts: state.attempts + 1 })),

  setSqlQuery: (sqlQuery: string) => set({ sqlQuery }),

  setQueryResult: (result, error = null) =>
    set({ queryResult: result, queryError: error }),

  setQueryRunning: (isQueryRunning) => set({ isQueryRunning }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  resetSession: (defaultQuery = '') =>
    set({
      hintsUsed: 0,
      revealedHints: [],
      attempts: 0,
      sqlQuery: defaultQuery,
      queryResult: null,
      queryError: null,
      isQueryRunning: false,
      isSubmitting: false,
    }),
}));
