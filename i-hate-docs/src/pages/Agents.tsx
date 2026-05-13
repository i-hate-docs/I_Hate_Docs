import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { AGENTS } from '@/lib/constants';
import {
  BookOpen, Scale, Presentation, GraduationCap, BarChart, User,
  Zap, ArrowRight, Sparkles,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  'book-open': BookOpen,
  scale: Scale,
  presentation: Presentation,
  'graduation-cap': GraduationCap,
  'bar-chart': BarChart,
  user: User,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CAPABILITY_ICONS: Record<string, any> = {
  'book-open': BookOpen,
  link: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  list: Presentation,
  'file-text': ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  'alert-triangle': ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  search: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  shield: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  layout: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  palette: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="13.5" cy="6.5" r="1.5" />
      <circle cx="17.5" cy="10.5" r="1.5" />
      <circle cx="8.5" cy="7.5" r="1.5" />
      <circle cx="6.5" cy="12.5" r="1.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  download: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  mic: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  code: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  sigma: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">&#931;</text>
    </svg>
  ),
  file: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  ),
  bookmark: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  'bar-chart': BarChart,
  paintbrush: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
      <path d="M12 12L8 8" />
    </svg>
  ),
  'layout-template': ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <rect x="9" y="9" width="13" height="13" />
    </svg>
  ),
  'check-circle': ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  key: ({ size, className }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
};

export function Agents() {
  const addToast = useAppStore((s) => s.addToast);
  const [launching, setLaunching] = useState<string | null>(null);

  const handleLaunch = (id: string, name: string) => {
    setLaunching(id);
    addToast(`Launching ${name}...`, 'info');
    setTimeout(() => {
      addToast(`${name} is ready`, 'success');
      setLaunching(null);
    }, 1500);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            AI Agents
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Specialized AI agents for every document workflow
          </p>
        </div>

        {/* Agent Grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {AGENTS.map((agent) => {
            const AgentIcon = ICON_MAP[agent.icon] ?? Sparkles;
            const isLoading = launching === agent.id;

            return (
              <div
                key={agent.id}
                className="group relative glass-panel-strong rounded-2xl p-5 border border-border-subtle hover:border-border-glow hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Inner radial glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${agent.color}10, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${agent.color}80, ${agent.color}20, transparent)` }}
                />

                {/* Card Content */}
                <div className="relative z-[1]">
                  {/* Top Row: Icon + Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${agent.color}18` }}
                    >
                      <AgentIcon size={22} style={{ color: agent.color }} />
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold" style={{ borderColor: `${agent.color}30`, color: agent.color, backgroundColor: `${agent.color}0d` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color, boxShadow: `0 0 6px ${agent.color}80` }} />
                      Ready
                    </div>
                  </div>

                  {/* Name + Description */}
                  <h3 className="text-[15px] font-bold text-text-primary mb-1.5">
                    {agent.name}
                  </h3>
                  <p className="text-[13px] text-text-tertiary leading-relaxed mb-4">
                    {agent.description}
                  </p>

                  {/* Capability Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {agent.capabilities.map((cap) => {
                      const CapIcon = CAPABILITY_ICONS[cap.icon];
                      return (
                        <span
                          key={cap.name}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] border border-border-subtle text-text-secondary hover:bg-white/[0.08] hover:border-border-strong transition-colors"
                          title={cap.description}
                        >
                          {CapIcon && <CapIcon size={12} className="opacity-60" />}
                          {cap.name}
                        </span>
                      );
                    })}
                  </div>

                  {/* Launch Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunch(agent.id, agent.name);
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-300 group/btn"
                    style={{
                      backgroundColor: isLoading ? `${agent.color}20` : `${agent.color}12`,
                      border: `1px solid ${agent.color}30`,
                      color: agent.color,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${agent.color}22`;
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${agent.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = isLoading ? `${agent.color}20` : `${agent.color}12`;
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: `${agent.color}40`, borderTopColor: agent.color }} />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        Launch Agent
                        <ArrowRight size={14} className="ml-auto opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Agents;
