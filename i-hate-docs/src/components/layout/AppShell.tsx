import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toasts } from '@/components/ui/Toast';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { useAppStore } from '@/stores/appStore';
import { MessageCircle } from 'lucide-react';

export function AppShell() {
  const aiPanelOpen = useAppStore((s) => s.aiPanelOpen);
  const toggleAiPanel = useAppStore((s) => s.toggleAiPanel);
  const navigateTo = useAppStore((s) => s.navigateTo);
  const currentView = useAppStore((s) => s.currentView);

  return (
    <div className="relative z-[1] flex h-screen w-screen overflow-hidden">
      {/* Background */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" />

      {/* Shell */}
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative z-[1]">
        <Topbar />
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </main>

      {/* Floating AI Button */}
      {currentView !== 'workspace' && (
        <button
          onClick={() => {
            navigateTo('workspace');
            if (!aiPanelOpen) toggleAiPanel();
          }}
          className="fixed bottom-8 right-8 w-[52px] h-[52px] rounded-full bg-accent text-white flex items-center justify-center z-[100] shadow-[0_8px_32px_var(--color-accent-glow)] hover:scale-110 transition-transform duration-300"
        >
          <MessageCircle size={22} />
          <span className="absolute inset-[-6px] rounded-full border-2 border-accent animate-[float-pulse_2s_ease-out_infinite] opacity-0" />
        </button>
      )}

      <Toasts />
      <CommandPalette />
    </div>
  );
}
