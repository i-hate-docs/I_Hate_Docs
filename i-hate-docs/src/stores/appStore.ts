import { create } from 'zustand';
import type { ViewType, Document } from '@/types';

interface AppStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // AI Panel
  aiPanelOpen: boolean;
  toggleAiPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;

  // Navigation
  currentView: ViewType;
  previousView: ViewType | null;
  navigateTo: (view: ViewType) => void;
  goBack: () => void;

  // Active document
  activeDocumentId: string | null;
  activeDocument: Document | null;
  setActiveDocument: (doc: Document | null) => void;

  // Zoom
  zoomLevel: number;
  setZoomLevel: (level: number) => void;

  // Command palette
  cmdPaletteOpen: boolean;
  setCmdPaletteOpen: (open: boolean) => void;

  // Notification toasts
  toasts: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>;
  addToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;
}

let toastId = 0;

export const useAppStore = create<AppStore>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  aiPanelOpen: true,
  toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),

  currentView: 'workspace',
  previousView: null,
  navigateTo: (view) => {
    const { currentView } = get();
    if (currentView === view) return;
    set({ previousView: currentView, currentView: view });
  },
  goBack: () => {
    const { previousView } = get();
    if (previousView) {
      set({ currentView: previousView, previousView: null });
    }
  },

  activeDocumentId: null,
  activeDocument: null,
  setActiveDocument: (doc) =>
    set({ activeDocument: doc, activeDocumentId: doc?.id ?? null }),

  zoomLevel: 100,
  setZoomLevel: (level) => set({ zoomLevel: Math.min(200, Math.max(50, level)) }),

  cmdPaletteOpen: false,
  setCmdPaletteOpen: (open) => set({ cmdPaletteOpen: open }),

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${++toastId}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
