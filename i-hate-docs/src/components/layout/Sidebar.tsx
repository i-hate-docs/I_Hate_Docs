import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { VIEW_LABELS } from '@/lib/constants';
import type { ViewType } from '@/types';
import {
  Monitor, FolderOpen, Bot, Presentation,Edit3, BookOpen, Columns,
  Clock, Users, Star, Layout, Trash2, Settings, PanelLeftClose,
  ChevronDown, LogOut,
} from 'lucide-react';

const PRIMARY_NAV: Array<{ view: ViewType; icon: typeof Monitor; extra?: string }> = [
  { view: 'workspace', icon: Monitor, extra: 'ai-dot' },
  { view: 'documents', icon: FolderOpen, extra: '24' },
  { view: 'agents', icon: Bot, extra: 'pulse' },
  { view: 'presentation', icon: Presentation },
];

const TOOL_NAV: Array<{ view: ViewType; icon: typeof Edit3; extra?: string }> = [
  { view: 'redesign', icon: Edit3, extra: 'new' },
  { view: 'research', icon: BookOpen },
  { view: 'multi-doc', icon: Columns },
];

const LIBRARY_NAV: Array<{ view: ViewType; icon: typeof Clock; extra?: string }> = [
  { view: 'recent', icon: Clock },
  { view: 'shared', icon: Users, extra: '7' },
  { view: 'starred', icon: Star },
  { view: 'templates', icon: Layout },
  { view: 'trash', icon: Trash2 },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { documents: allDocs } = useDocuments();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const currentView = useAppStore((s) => s.currentView);
  const navigateTo = useAppStore((s) => s.navigateTo);

  const docCount = allDocs.filter((d) => !d.is_deleted).length;
  const starredCount = allDocs.filter((d) => d.is_starred).length;

  const renderExtra = (extra?: string, view?: ViewType) => {
    if (extra === 'ai-dot') return <span className="ai-pulse-dot ml-auto" />;
    if (extra === 'pulse') return <span className="ml-auto w-[7px] h-[7px] rounded-full bg-cyan shadow-[0_0_6px_var(--color-cyan-glow)] animate-[ai-pulse_1.5s_ease-in-out_infinite]" />;
    if (extra === 'new') return <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-accent/15 text-accent-light rounded-full">New</span>;
    if (extra && view === 'documents') return <span className="ml-auto text-[11px] text-text-tertiary">{docCount}</span>;
    if (extra && view === 'shared') return <span className="ml-auto text-[11px] text-text-tertiary">{extra}</span>;
    return null;
  };

  const displayName = user?.name?.[0]?.toUpperCase() ?? '?';
  const userEmail = user?.email ?? '';
  const userPlan = user?.plan ?? 'free';

  return (
    <aside
      className={`glass-panel-strong border-r border-border-subtle h-screen flex flex-col shrink-0 transition-all duration-400 overflow-hidden relative ${
        sidebarCollapsed ? 'w-[64px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          {!sidebarCollapsed && (
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-text-primary to-accent-light bg-clip-text text-transparent whitespace-nowrap">
              I Hate Docs
            </span>
          )}
        </div>
        <button onClick={toggleSidebar} className="p-1 rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-secondary transition-colors shrink-0">
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Workspace Switcher */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3">
          <button className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/[0.03] border border-border-subtle hover:bg-white/[0.06] hover:border-border-strong transition-colors">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent to-violet flex items-center justify-center text-xs font-bold text-white shrink-0">
              {displayName}
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="block text-[13px] font-semibold truncate">Personal</span>
              <span className="block text-[11px] text-text-tertiary capitalize">{userPlan} Plan</span>
            </div>
            <ChevronDown size={14} className="text-text-tertiary shrink-0" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-1 space-y-5">
        <NavSection
          collapsed={sidebarCollapsed}
          label="Main"
          items={PRIMARY_NAV}
          currentView={currentView}
          navigateTo={navigateTo}
          renderExtra={renderExtra}
        />
        <NavSection
          collapsed={sidebarCollapsed}
          label="Tools"
          items={TOOL_NAV}
          currentView={currentView}
          navigateTo={navigateTo}
          renderExtra={renderExtra}
        />
        <NavSection
          collapsed={sidebarCollapsed}
          label="Library"
          items={LIBRARY_NAV}
          currentView={currentView}
          navigateTo={navigateTo}
          renderExtra={renderExtra}
          starredCount={starredCount}
        />
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-border-subtle shrink-0 space-y-3">
          {/* AI Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald/5 border border-emerald/10 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-[ai-pulse_2s_ease-in-out_infinite]" />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-emerald">AI Online</span>
              <span className="text-[10px] text-text-tertiary">GPT-4.5 Turbo</span>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-violet flex items-center justify-center text-[13px] font-bold text-white shrink-0">
              {displayName}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold truncate">{user?.name ?? 'User'}</span>
              <span className="block text-[11px] text-text-tertiary truncate">{userEmail}</span>
            </div>
            <button onClick={() => navigateTo('settings')} className="p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-white/5 transition-colors" title="Settings">
              <Settings size={16} />
            </button>
            <button onClick={signOut} className="p-1 rounded-md text-text-tertiary hover:text-rose hover:bg-rose/5 transition-colors" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavSection({
  collapsed, label, items, currentView, navigateTo, renderExtra,
}: {
  collapsed: boolean;
  label: string;
  items: Array<{ view: ViewType; icon: typeof Monitor }>;
  currentView: string;
  navigateTo: (v: ViewType) => void;
  renderExtra: (extra?: string, view?: ViewType) => React.ReactNode;
  starredCount?: number;
}) {
  return (
    <div>
      {!collapsed && (
        <div className="px-3 pb-1 text-[10px] font-bold text-text-tertiary uppercase tracking-[0.1em]">
          {label}
        </div>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const active = currentView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => navigateTo(item.view)}
            className={`w-full flex items-center gap-3 px-3 py-1.5 mb-px rounded-lg text-[13px] font-medium transition-colors group ${
              active
                ? 'bg-accent/8 text-text-primary'
                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
            } ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <Icon size={18} className={`shrink-0 ${active ? 'text-accent-light' : 'opacity-70'}`} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left whitespace-nowrap">{VIEW_LABELS[item.view]}</span>
                {renderExtra((item as { extra?: string }).extra, item.view)}
                {active && <span className="absolute right-2 w-[3px] h-4 bg-accent rounded-sm" />}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
