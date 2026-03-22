import { create } from "zustand";
import type { ProcessingSession, ProcessingStatus } from "@/types";

interface ProcessingStore {
  session: ProcessingSession | null;
  // ── Actions ──────────────────────────────────────────────────────────────
  setSession: (session: ProcessingSession) => void;
  setStatus: (status: ProcessingStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState: Pick<ProcessingStore, "session"> = {
  session: null,
};

/**
 * Stores the active DUA processing session state.
 * Implements the Observer Pattern: UI components subscribe to slices
 * of this store and re-render automatically on updates.
 */
export const useProcessingStore = create<ProcessingStore>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),

  setStatus: (status) =>
    set((state) =>
      state.session ? { session: { ...state.session, status } } : state
    ),

  setProgress: (progress) =>
    set((state) =>
      state.session ? { session: { ...state.session, progress } } : state
    ),

  setError: (error) =>
    set((state) =>
      state.session
        ? { session: { ...state.session, status: "error", error } }
        : state
    ),

  reset: () => set(initialState),
}));
