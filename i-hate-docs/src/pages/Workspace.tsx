import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { useAI } from '@/hooks/useAI';
import { supabase } from '@/lib/supabase';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { AIPanel } from '@/components/ai/AIPanel';
import type { Document } from '@/types';
import {
  MousePointer2, Hand, Type, Highlighter, Undo2, Redo2,
  Minus, Plus, Maximize2, FileText, Pencil, Languages, MessageCircle,
  Upload, File,
} from 'lucide-react';

export function Workspace() {
  const { user } = useAuth();
  const { documents, uploadDocument } = useDocuments();
  const activeDocument = useAppStore((s) => s.activeDocument);
  const setActiveDocument = useAppStore((s) => s.setActiveDocument);
  const aiPanelOpen = useAppStore((s) => s.aiPanelOpen);
  const toggleAiPanel = useAppStore((s) => s.toggleAiPanel);
  const setAiPanelOpen = useAppStore((s) => s.setAiPanelOpen);
  const zoomLevel = useAppStore((s) => s.zoomLevel);
  const setZoomLevel = useAppStore((s) => s.setZoomLevel);
  const addToast = useAppStore((s) => s.addToast);
  const isDragging = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // AI hook for the active document
  const {
    messages, loading: aiLoading, sendMessage, clearMessages
  } = useAI(activeDocument?.id ?? null);

  // Load document URL
  useEffect(() => {
    if (!activeDocument) {
      // Auto-select first non-deleted document
      const firstDoc = documents.find((d) => !d.is_deleted && d.mime_type === 'application/pdf');
      if (firstDoc && !activeDocument) {
        setActiveDocument(firstDoc);
      }
      return;
    }

    supabase.storage
      .from('documents')
      .createSignedUrl(activeDocument.storage_path, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) setDocUrl(data.signedUrl);
      });
  }, [activeDocument, documents, setActiveDocument]);

  const handleUpload = async (file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      addToast('File type not supported. Please upload a PDF or document.', 'error');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      addToast('File too large. Max size is 50MB.', 'error');
      return;
    }
    setUploading(true);
    const doc = await uploadDocument(file);
    if (doc) setActiveDocument(doc);
    setUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    isDragging.current = false;
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    isDragging.current = true;
  }, []);

  // No document selected - show upload prompt
  if (!activeDocument && !uploading && documents.filter((d) => !d.is_deleted).length === 0) {
    return (
      <div
        className="h-full flex items-center justify-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-accent/10 border-2 border-dashed border-accent/30 flex items-center justify-center">
            <Upload size={32} className="text-accent-light" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight mb-2">Drop your first PDF</h2>
            <p className="text-sm text-text-tertiary max-w-sm">
              Upload a PDF to start editing, chatting, and transforming with AI.
              <br />Supports PDF, DOCX, PPTX (up to 50MB).
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-accent hover:bg-accent-light text-white rounded-lg font-semibold text-sm transition-colors shadow-[0_4px_16px_var(--color-accent-glow)]"
            >
              Upload PDF
            </button>
            <button
              onClick={() => addToast('Drag and drop files anywhere in this area')}
              className="px-6 py-3 bg-white/[0.04] border border-border-strong hover:border-border-glow text-text-secondary hover:text-text-primary rounded-lg font-semibold text-sm transition-colors"
            >
              Browse files
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.xlsx,.txt,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex" onDrop={handleDrop} onDragOver={handleDragOver}>
      {/* Page Thumbnails */}
      <div className="w-[200px] min-w-[200px] glass-panel border-r border-border-subtle flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em]">
          Pages
          <span className="text-text-secondary">{activeDocument?.page_count ?? 1}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {Array.from({ length: activeDocument?.page_count ?? 1 }, (_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 cursor-pointer p-1 rounded-lg hover:bg-white/[0.04] transition-colors group"
            >
              <div className="w-full aspect-[3/4] bg-white/[0.03] border border-border-subtle group-hover:border-border-strong rounded-md p-2 flex items-center justify-center transition-colors">
                <div className="space-y-[3px] w-full">
                  <div className="h-[2px] bg-white/[0.15] rounded w-[85%]" />
                  <div className="h-[2px] bg-white/[0.15] rounded w-full" />
                  <div className="h-[2px] bg-white/[0.15] rounded w-[70%]" />
                  <div className="h-[2px] bg-white/[0.15] rounded w-[90%]" />
                  <div className="h-[2px] bg-white/[0.15] rounded w-[50%]" />
                </div>
              </div>
              <span className="text-[11px] text-text-tertiary font-semibold">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Canvas */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Canvas Toolbar */}
        <div className="h-11 min-h-[44px] glass-panel border-b border-border-subtle flex items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <ToolButton icon={MousePointer2} active />
            <ToolButton icon={Hand} />
            <ToolButton icon={Type} />
            <ToolButton icon={Highlighter} />
            <div className="w-px h-5 bg-border-strong mx-1.5" />
            <ToolButton icon={Undo2} />
            <ToolButton icon={Redo2} />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoomLevel(zoomLevel - 10)} className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary transition-colors">
              <Minus size={14} />
            </button>
            <span className="min-w-[48px] text-center text-xs font-semibold text-text-secondary tabular-nums">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(zoomLevel + 10)} className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary transition-colors">
              <Plus size={14} />
            </button>
            <button onClick={() => setZoomLevel(100)} className="ml-1.5 px-2 py-1 text-[11px] font-semibold text-text-tertiary bg-white/[0.04] rounded hover:bg-white/[0.08] transition-colors">
              <Maximize2 size={12} className="inline mr-1" />Fit
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-black/30 to-bg-deep">
          <div className="flex justify-center py-12">
            {docUrl ? (
              <PDFViewer url={docUrl} zoom={zoomLevel} />
            ) : (
              <div className="flex items-center justify-center w-[612px] h-[792px] bg-white rounded-sm shadow-xl">
                <div className="text-center text-gray-400">
                  <File size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Loading document...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating AI Actions */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-[3]">
          <FloatingAIBtn icon={FileText} label="Summarize" onClick={() => { if (!aiPanelOpen) toggleAiPanel(); sendMessage('Summarize this document'); }} />
          <FloatingAIBtn icon={Pencil} label="Rewrite" onClick={() => addToast('AI rewriting selected text...')} />
          <FloatingAIBtn icon={Languages} label="Translate" onClick={() => { if (!aiPanelOpen) toggleAiPanel(); sendMessage('Translate this document'); }} />
          <button
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className="w-9 h-9 flex items-center justify-center bg-accent border border-accent rounded-lg text-white shadow-[0_4px_16px_var(--color-accent-glow)] hover:bg-accent-light hover:shadow-[0_4px_24px_var(--color-accent-glow)] hover:scale-110 transition-all"
            title="Chat with document"
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </div>

      {/* AI Panel */}
      <AIPanel
        open={aiPanelOpen}
        onToggle={toggleAiPanel}
        document={activeDocument}
        messages={messages}
        loading={aiLoading}
        onSend={sendMessage}
        onClear={clearMessages}
      />

      {/* Hidden file input for keyboard upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.pptx,.xlsx,.txt,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
      />
    </div>
  );
}

function ToolButton({ icon: Icon, active }: { icon: typeof MousePointer2; active?: boolean }) {
  return (
    <button
      className={`w-[30px] h-[30px] flex items-center justify-center rounded transition-colors ${
        active ? 'bg-accent/10 text-accent-light' : 'text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary'
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function FloatingAIBtn({ icon: Icon, label, onClick }: { icon: typeof FileText; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 flex items-center justify-center glass-panel-strong border border-border-strong rounded-lg text-text-secondary hover:bg-accent/15 hover:border-accent hover:text-accent-light hover:scale-110 hover:shadow-[0_0_16px_var(--color-accent-glow)] transition-all"
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}
