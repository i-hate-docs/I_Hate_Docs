import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Search } from 'lucide-react';

const COMMANDS = [
  { id: 'new-doc', label: 'New Document', icon: 'file', shortcut: '⌘N', action: () => {} },
  { id: 'chat', label: 'Chat with Document', icon: 'message-circle', shortcut: '⌘J', action: () => {} },
  { id: 'upload', label: 'Upload Document', icon: 'upload', shortcut: '⌘U', action: () => {} },
  { id: 'workspace', label: 'Go to Workspace', icon: 'monitor', view: 'workspace' },
  { id: 'documents', label: 'Go to Documents', icon: 'folder', view: 'documents' },
  { id: 'agents', label: 'AI Agents', icon: 'bot', view: 'agents' },
] as const;

export function CommandPalette() {
  const open = useAppStore((s) => s.cmdPaletteOpen);
  const setOpen = useAppStore((s) => s.setCmdPaletteOpen);
  const navigateTo = useAppStore((s) => s.navigateTo);
  const setAiPanelOpen = useAppStore((s) => s.setAiPanelOpen);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  if (!open) return null;

  const filtered = query
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  const handleSelect = (cmd: (typeof COMMANDS)[number]) => {
    if ('view' in cmd && cmd.view) {
      navigateTo(cmd.view as Parameters<typeof navigateTo>[0]);
    } else if (cmd.id === 'chat') {
      navigateTo('workspace');
      setAiPanelOpen(true);
    } else if (cmd.id === 'upload') {
      navigateTo('documents');
    }
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="w-[560px] max-w-[90vw] bg-bg-glass-strong backdrop-blur-lg border border-border-strong rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search size={16} className="text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 text-sm font-medium bg-transparent text-text-primary placeholder:text-text-tertiary"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered.length > 0) handleSelect(filtered[0]);
            }}
          />
          <kbd className="px-1.5 py-0.5 text-[11px] font-mono text-text-tertiary bg-white/5 border border-border-strong rounded">ESC</kbd>
        </div>
        <div className="py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 transition-colors ${
                i === 0 && !query ? 'bg-accent/10 border-l-2 border-accent' : ''
              }`}
              onClick={() => handleSelect(cmd)}
            >
              <span className="text-text-secondary">{cmd.label}</span>
              {'shortcut' in cmd && (
                <kbd className="ml-auto text-[11px] font-mono text-text-tertiary">{cmd.shortcut}</kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
