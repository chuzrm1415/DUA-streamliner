import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  activeStep: number;
  setActiveStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

/**
 * Stores global UI state (sidebar, stepper, modals).
 */
export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeStep: 0,
  setActiveStep: (step) => set({ activeStep: step }),
  nextStep: () => set((s) => ({ activeStep: s.activeStep + 1 })),
  prevStep: () => set((s) => ({ activeStep: Math.max(0, s.activeStep - 1) })),
}));
