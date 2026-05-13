import { useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import {
  Columns, Columns2, GitCompare, X, GripVertical,
} from 'lucide-react';

interface DocPane {
  id: string;
  name: string;
  contentLines: number;
}

const INITIAL_LEFT: DocPane = {
  id: 'doc-1',
  name: 'Q4 Earnings Report.pdf',
  contentLines: 32,
};

const INITIAL_RIGHT: DocPane = {
  id: 'doc-2',
  name: 'Q4 Summary Notes.docx',
  contentLines: 18,
};

export function MultiDoc() {
  const addToast = useAppStore((s) => s.addToast);
  const [leftDoc, setLeftDoc] = useState<DocPane | null>(INITIAL_LEFT);
  const [rightDoc, setRightDoc] = useState<DocPane | null>(INITIAL_RIGHT);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      setLeftWidth(Math.min(80, Math.max(20, pct)));
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSplitVertical = () => addToast('Split vertical mode active', 'info');
  const handleSplitHorizontal = () => addToast('Split horizontal mode active', 'info');
  const handleCompareMode = () => addToast('Compare mode active – differences highlighted', 'info');

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
              Multi-Document Workspace
            </h1>
            <p className="mt-1 text-sm text-text-tertiary">
              Compare and work with multiple documents side by side
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSplitVertical}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-border-subtle text-text-secondary text-[12px] font-semibold hover:bg-white/[0.08] hover:border-border-strong transition-colors"
            >
              <Columns2 size={14} />
              Split Vertical
            </button>
            <button
              onClick={handleSplitHorizontal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-border-subtle text-text-secondary text-[12px] font-semibold hover:bg-white/[0.08] hover:border-border-strong transition-colors"
            >
              <Columns size={14} style={{ transform: 'rotate(90deg)' }} />
              Split Horizontal
            </button>
            <button
              onClick={handleCompareMode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent-light text-[12px] font-semibold hover:bg-accent/15 hover:border-accent/30 transition-colors shadow-[0_0_12px_var(--color-accent-glow)]"
            >
              <GitCompare size={14} />
              Compare Mode
            </button>
          </div>
        </div>
      </div>

      {/* Document Panes */}
      <div
        ref={containerRef}
        className="flex-1 flex px-8 pb-8 min-h-0 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'col-resize' : undefined }}
      >
        {/* Left Pane */}
        <div
          className="glass-panel rounded-2xl border border-border-subtle overflow-hidden flex flex-col"
          style={{ width: `calc(${leftWidth}% - 14px)` }}
        >
          {leftDoc ? (
            <DocumentPane
              doc={leftDoc}
              onClose={() => {
                setLeftDoc(null);
                addToast('Document closed', 'info');
              }}
            />
          ) : (
            <EmptyPane
              label="Drop a document here"
              onAdd={() => {
                setLeftDoc({ id: `doc-${Date.now()}`, name: 'New Document.pdf', contentLines: 24 });
                addToast('Document loaded', 'success');
              }}
            />
          )}
        </div>

        {/* Resizable Divider */}
        <div
          className="w-[6px] shrink-0 flex items-center justify-center cursor-col-resize group/divider transition-colors duration-200 relative z-10"
          onMouseDown={handleMouseDown}
        >
          <div className={`w-[2px] h-full rounded-full transition-colors duration-200 ${
            isDragging ? 'bg-accent' : 'bg-border-subtle group-hover/divider:bg-accent/60'
          }`} />
          <div className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className={`w-4 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isDragging
                ? 'bg-accent/20 border border-accent/40 shadow-[0_0_12px_var(--color-accent-glow)]'
                : 'bg-bg-glass-strong border border-border-strong opacity-0 group-hover/divider:opacity-100'
            }`}>
              <GripVertical size={12} className={isDragging ? 'text-accent-light' : 'text-text-tertiary'} />
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div
          className="glass-panel rounded-2xl border border-border-subtle overflow-hidden flex flex-col flex-1"
          style={{ width: `calc(${100 - leftWidth}% - 14px)` }}
        >
          {rightDoc ? (
            <DocumentPane
              doc={rightDoc}
              onClose={() => {
                setRightDoc(null);
                addToast('Document closed', 'info');
              }}
            />
          ) : (
            <EmptyPane
              label="Drop a document here"
              onAdd={() => {
                setRightDoc({ id: `doc-${Date.now()}`, name: 'New Document.pdf', contentLines: 24 });
                addToast('Document loaded', 'success');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentPane({ doc, onClose }: { doc: DocPane; onClose: () => void }) {
  return (
    <>
      {/* Pane Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0" />
          <span className="text-[12px] font-semibold text-text-primary truncate">
            {doc.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-text-tertiary hover:text-rose hover:bg-rose/10 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {/* Title placeholder */}
          <div className="h-5 w-[50%] bg-white/[0.08] rounded mb-5" />
          <div className="h-3 w-[30%] bg-white/[0.05] rounded mb-4" />

          {/* Content lines */}
          {Array.from({ length: doc.contentLines }, (_, i) => {
            const widths = ['92%', '85%', '97%', '70%', '88%', '95%', '78%', '82%', '90%', '65%'];
            const width = widths[i % widths.length];
            const isSection = i % 8 === 0 && i > 0;
            return (
              <div key={i} className={isSection ? 'pt-3' : ''}>
                {isSection && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-3 rounded-full bg-accent/40" />
                    <div className="h-4 w-[25%] bg-white/[0.07] rounded" />
                  </div>
                )}
                <div
                  className="h-2 rounded mb-2"
                  style={{
                    width,
                    backgroundColor: isSection
                      ? 'rgba(255,255,255,0.055)'
                      : i % 5 === 0
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.045)',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function EmptyPane({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-border-strong flex items-center justify-center">
        <Columns size={22} className="text-text-tertiary" />
      </div>
      <p className="text-sm text-text-tertiary">{label}</p>
      <button
        onClick={onAdd}
        className="px-4 py-2 rounded-lg bg-white/[0.04] border border-border-subtle text-text-secondary text-[12px] font-semibold hover:bg-white/[0.08] hover:border-border-strong transition-colors"
      >
        Load Document
      </button>
    </div>
  );
}

export default MultiDoc;
