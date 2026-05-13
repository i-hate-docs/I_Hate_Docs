import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { VIEW_LABELS } from '@/lib/constants';
import { Search, Bell, ChevronRight, ArrowLeft } from 'lucide-react';

export function Topbar() {
  const { user } = useAuth();
  const currentView = useAppStore((s) => s.currentView);
  const previousView = useAppStore((s) => s.previousView);
  const navigateTo = useAppStore((s) => s.navigateTo);
  const goBack = useAppStore((s) => s.goBack);
  const setCmdPaletteOpen = useAppStore((s) => s.setCmdPaletteOpen);
  const activeDocument = useAppStore((s) => s.activeDocument);
  const addToast = useAppStore((s) => s.addToast);

  const viewLabel = VIEW_LABELS[currentView] ?? currentView;
  const docName = activeDocument?.name;
  const isWorkspace = currentView === 'workspace';
  const initials = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="h-14 min-h-[56px] glass-panel border-b border-border-subtle flex items-center gap-4 px-6 z-[5]">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-[200px]">
        {previousView && (
          <button onClick={goBack} className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-text-tertiary">{isWorkspace ? 'Workspace' : viewLabel}</span>
          {isWorkspace && (
            <>
              <ChevronRight size={12} className="text-text-tertiary" />
              <span className="text-text-primary font-semibold">{docName ?? 'No document selected'}</span>
            </>
          )}
        </div>
        {isWorkspace && activeDocument && (
          <div className="flex items-center gap-1.5 ml-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
            <span className="text-[11px] text-text-tertiary">Saved</span>
          </div>
        )}
      </div>

      {/* Center - Search */}
      <div className="flex-1 flex justify-center">
        <button
          onClick={() => setCmdPaletteOpen(true)}
          className="flex items-center gap-2 px-4 py-1.5 min-w-[320px] bg-white/[0.04] border border-border-strong rounded-lg text-text-tertiary text-[13px] hover:bg-white/[0.06] hover:border-border-glow transition-colors"
        >
          <Search size={16} className="shrink-0" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="flex gap-0.5 text-[11px] font-mono px-1.5 py-0.5 bg-white/[0.06] rounded text-text-tertiary">
            <span>⌘</span><span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 min-w-[200px] justify-end">
        {/* Collaborator avatars (placeholder) */}
        <div className="flex items-center mr-2">
          {['A', 'M', 'S'].map((letter, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-bg-base flex items-center justify-center text-[11px] font-bold text-white ml-[-6px] first:ml-0"
              style={{ background: `linear-gradient(135deg, ${i === 0 ? '#818cf8,#6366f1' : i === 1 ? '#22d3ee,#06b6d4' : '#a78bfa,#8b5cf6'})` }}
            >
              {letter}
            </div>
          ))}
          <button className="w-7 h-7 rounded-full border border-dashed border-border-strong text-text-tertiary text-[14px] flex items-center justify-center ml-[-6px] hover:bg-white/[0.08] transition-colors">+</button>
        </div>

        {/* AI Activity */}
        <button
          onClick={() => addToast('AI processing 2 tasks in background')}
          className="relative w-[34px] h-[34px] flex items-center justify-center rounded-lg text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/>
          </svg>
          <span className="absolute top-1 right-1.5 w-[7px] h-[7px] rounded-full bg-accent-light shadow-[0_0_6px_var(--color-accent-glow)] animate-[ai-pulse_2s_infinite]" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => addToast('3 new notifications')}
          className="relative w-[34px] h-[34px] flex items-center justify-center rounded-lg text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-2 w-[7px] h-[7px] rounded-full bg-rose shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
        </button>

        {/* Profile */}
        <button
          onClick={() => navigateTo('settings')}
          className="w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-accent to-violet flex items-center justify-center text-[13px] font-bold text-white hover:scale-105 transition-transform"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
