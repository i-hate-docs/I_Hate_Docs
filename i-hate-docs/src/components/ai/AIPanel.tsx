import { useState, useRef, useEffect } from 'react';
import type { Document, AIMessage } from '@/types';
import { Send, Plus, ChevronUp, Paperclip, FileText, Clock, Smile, MessageCircle } from 'lucide-react';

interface AIPanelProps {
  open: boolean;
  onToggle: () => void;
  document: Document | null;
  messages: AIMessage[];
  loading: boolean;
  onSend: (message: string) => Promise<string>;
  onClear: () => void;
}

const SUGGESTED_PROMPTS = [
  { icon: FileText, label: 'Summarize this document', prompt: 'Summarize this document in 3-5 key points' },
  { icon: FileText, label: 'Generate presentation slides', prompt: 'Generate presentation slides from this document' },
  { icon: FileText, label: 'Translate to Spanish', prompt: 'Translate the key sections of this document to Spanish' },
  { icon: FileText, label: 'Extract key data', prompt: 'Extract all key data points and metrics from this document' },
];

export function AIPanel({ open, onToggle, document, messages, loading, onSend, onClear }: AIPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    onSend(text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`bg-bg-glass-strong backdrop-blur-lg border-l border-border-subtle flex flex-col shrink-0 transition-all duration-400 ${
        open ? 'w-[380px] min-w-[380px]' : 'w-0 min-w-0 opacity-0 overflow-hidden'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <span className="ai-pulse-dot" />
          <span className="text-sm font-bold">AI Copilot</span>
        </div>
        <div className="flex gap-0.5">
          <button onClick={onClear} className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary transition-colors" title="New chat">
            <Plus size={16} />
          </button>
          <button onClick={onToggle} className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary transition-colors" title="Close panel">
            <ChevronUp size={16} />
          </button>
        </div>
      </div>

      {/* Context Bar */}
      {document && (
        <div className="px-4 py-3 border-b border-border-subtle space-y-1.5 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/8 border border-accent/15 rounded-full text-[11px] font-medium text-accent-light">
            <MessageCircle size={12} />
            <span className="truncate max-w-[200px]">{document.original_name}</span>
          </div>
          <div className="text-[11px] text-text-tertiary">{document.page_count} pages · {formatSize(document.size_bytes)}</div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!document && (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-sm text-text-tertiary">Open a document to start chatting</p>
          </div>
        )}

        {document && messages.length === 0 && (
          <div className="text-center space-y-3 pt-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center">
              <MessageCircle size={20} className="text-accent-light" />
            </div>
            <p className="text-sm text-text-secondary">Ask me anything about this document</p>
            <div className="grid grid-cols-2 gap-1.5">
              <InsightCard icon={FileText} label="Structure" value={`${document.page_count} pages`} color="accent" />
              <InsightCard icon={Clock} label="Size" value={formatSize(document.size_bytes)} color="cyan" />
              <InsightCard icon={Smile} label="Type" value={formatMime(document.mime_type)} color="violet" />
              <InsightCard icon={MessageCircle} label="Ready" value="Ask a question" color="accent" />
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-violet flex items-center justify-center shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/></svg>
              </div>
            )}
            <div
              className={`text-[13px] leading-relaxed p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-accent/15 border border-accent/20 rounded-br-sm ml-auto'
                  : msg.role === 'system'
                  ? 'bg-white/[0.03] border border-border-subtle mx-auto text-center text-text-tertiary'
                  : 'bg-white/[0.03] border border-border-subtle rounded-bl-sm'
              }`}
              dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
            />
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 pl-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                  style={{ animation: `thinking-bounce 1.4s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-text-tertiary">AI thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {document && messages.length === 0 && (
        <div className="px-4 py-2 border-t border-border-subtle flex flex-wrap gap-1.5 shrink-0">
          {SUGGESTED_PROMPTS.map((sp) => (
            <button
              key={sp.prompt}
              onClick={() => onSend(sp.prompt)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] border border-border-subtle rounded-full text-[11px] text-text-tertiary hover:bg-accent/8 hover:border-accent/20 hover:text-accent-light transition-colors"
            >
              <sp.icon size={12} className="opacity-60" />
              {sp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      {document && (
        <div className="p-3 border-t border-border-subtle shrink-0">
          <div className="flex items-end bg-white/[0.04] border border-border-strong focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 rounded-xl p-1.5 transition-all">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary transition-colors shrink-0">
              <Paperclip size={16} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this document..."
              rows={1}
              className="flex-1 resize-none p-1.5 text-[13px] text-text-primary placeholder:text-text-tertiary bg-transparent min-h-[20px] max-h-[120px]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-8 h-8 flex items-center justify-center bg-accent hover:bg-accent-light disabled:opacity-30 rounded-lg text-white transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, color }: { icon: typeof FileText; label: string; value: string; color: string }) {
  const bgMap: Record<string, string> = { accent: 'bg-accent/10 text-accent-light', cyan: 'bg-cyan/10 text-cyan', violet: 'bg-violet/10 text-violet' };
  return (
    <div className="bg-white/[0.03] border border-border-subtle rounded-lg p-3 space-y-1.5 hover:bg-white/[0.05] transition-colors">
      <div className={`w-6 h-6 rounded flex items-center justify-center ${bgMap[color] ?? bgMap.accent}`}>
        <Icon size={14} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-text-tertiary uppercase tracking-[0.05em]">{label}</span>
        <span className="text-[11px] text-text-secondary font-semibold">{value}</span>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMime(mime: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  };
  return map[mime] ?? mime.split('/')[1]?.toUpperCase() ?? 'Document';
}

function formatContent(content: string): string {
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-white/[0.08] px-1 py-0.5 rounded text-[12px] font-mono">$1</code>')
    .replace(/\n/g, '<br/>')
    .replace(/• (.*?)(<br\/>|$)/g, '<div class="flex gap-2"><span class="text-accent-light">•</span><span>$1</span></div>');

  // Numbered lists (1. 2. 3.)
  html = html.replace(/^(\d+)\. (.*?)<br\/>$/gm, '<div class="flex gap-2 ml-2"><span class="text-accent-light font-semibold">$1.</span><span>$2</span></div><br/>');

  return html;
}
