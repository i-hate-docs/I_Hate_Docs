import { useState, useRef, useEffect } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useAppStore } from '@/stores/appStore';
import type { Document } from '@/types';
import {
  Search, Upload, Plus, Filter, Star, MoreHorizontal, File, Trash2,
} from 'lucide-react';

const FILE_TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDF', mime: 'application/pdf' },
  { id: 'docx', label: 'DOCX', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { id: 'pptx', label: 'PPTX', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { id: 'xlsx', label: 'Spreadsheets', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
];

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

function getMimeBadgeClass(mime: string): string {
  if (mime === 'application/pdf') return 'bg-rose/10 text-rose border-rose/20';
  if (mime.includes('spreadsheetml')) return 'bg-emerald/10 text-emerald border-emerald/20';
  if (mime.includes('presentationml')) return 'bg-amber/10 text-amber border-amber/20';
  if (mime.includes('wordprocessingml')) return 'bg-blue/10 text-blue border-blue/20';
  return 'bg-white/[0.06] text-text-tertiary border-border-subtle';
}

function getMimeIconClass(mime: string): string {
  if (mime === 'application/pdf') return 'text-rose/30';
  if (mime.includes('spreadsheetml')) return 'text-emerald/30';
  if (mime.includes('presentationml')) return 'text-amber/30';
  if (mime.includes('wordprocessingml')) return 'text-blue/30';
  return 'text-text-tertiary/30';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function Documents({ filter }: { filter?: string }) {
  const { documents, uploadDocument, toggleStar, deleteDocument } = useDocuments();
  const navigateTo = useAppStore((s) => s.navigateTo);
  const setActiveDocument = useAppStore((s) => s.setActiveDocument);
  const addToast = useAppStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside() {
      setOpenMenuId(null);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  let filteredDocs = documents;

  if (filter === 'starred') {
    filteredDocs = documents.filter((d) => d.is_starred && !d.is_deleted);
  } else if (filter === 'trash') {
    filteredDocs = documents.filter((d) => d.is_deleted);
  } else {
    filteredDocs = documents.filter((d) => !d.is_deleted);
  }

  if (activeTab !== 'all') {
    const tab = FILE_TYPE_TABS.find((t) => t.id === activeTab);
    if (tab?.mime) {
      filteredDocs = filteredDocs.filter((d) => d.mime_type === tab.mime);
    }
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredDocs = filteredDocs.filter(
      (d) => d.name.toLowerCase().includes(q) || d.original_name.toLowerCase().includes(q),
    );
  }

  const handleUpload = async (file: File) => {
    setUploading(true);
    await uploadDocument(file);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleOpen = (doc: Document) => {
    setActiveDocument(doc);
    navigateTo('workspace');
  };

  const title =
    filter === 'starred' ? 'Starred'
    : filter === 'trash' ? 'Trash'
    : filter === 'recent' ? 'Recent'
    : filter === 'shared' ? 'Shared with me'
    : filter === 'templates' ? 'Templates'
    : 'All Documents';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="glass-panel border-b border-border-subtle px-6 py-4 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold tracking-tight">{title}</h1>
            <span className="text-[11px] font-semibold text-text-tertiary bg-white/[0.04] px-2 py-0.5 rounded-full">
              {filteredDocs.length} {filteredDocs.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-border-strong rounded-lg text-text-tertiary focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 transition-all min-w-[260px]">
              <Search size={15} className="shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="flex-1 text-[13px] bg-transparent placeholder:text-text-tertiary"
              />
            </div>
            <button
              onClick={() => addToast('Advanced filters coming soon', 'info')}
              className="w-[34px] h-[34px] flex items-center justify-center rounded-lg text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary border border-border-subtle hover:border-border-strong transition-colors"
            >
              <Filter size={16} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-accent hover:bg-accent-light text-white rounded-lg font-semibold text-[13px] transition-colors shadow-[0_4px_16px_var(--color-accent-glow)] disabled:opacity-50"
            >
              <Upload size={15} />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {FILE_TYPE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent/10 text-accent-light border border-accent/20'
                  : 'text-text-tertiary hover:bg-white/[0.04] hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onStar={() => toggleStar(doc)}
              onDelete={() => deleteDocument(doc)}
              onOpen={() => handleOpen(doc)}
              menuOpen={openMenuId === doc.id}
              onToggleMenu={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === doc.id ? null : doc.id);
              }}
            />
          ))}

          {filter !== 'trash' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="glass-panel rounded-xl border-2 border-dashed border-border-strong hover:border-accent/30 hover:bg-accent/[0.02] transition-all flex flex-col items-center justify-center gap-3 p-8 min-h-[220px] cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-border-subtle flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors">
                <Plus size={24} className="text-text-tertiary group-hover:text-accent-light transition-colors" />
              </div>
              <div className="text-center space-y-0.5">
                <span className="block text-[13px] font-semibold text-text-tertiary group-hover:text-text-secondary transition-colors">
                  Drop files here
                </span>
                <span className="block text-[11px] text-text-tertiary">
                  PDF, DOCX, PPTX, XLSX
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.pptx,.xlsx,.txt,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function DocumentCard({
  doc,
  onStar,
  onDelete,
  onOpen,
  menuOpen,
  onToggleMenu,
}: {
  doc: Document;
  onStar: () => void;
  onDelete: () => void;
  onOpen: () => void;
  menuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
}) {
  const mimeLabel = formatMime(doc.mime_type);
  const mimeBadgeClass = getMimeBadgeClass(doc.mime_type);
  const mimeIconClass = getMimeIconClass(doc.mime_type);

  return (
    <div
      className="glass-panel rounded-xl hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-border-glow transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col"
      onClick={onOpen}
    >
      {/* Preview */}
      <div className="relative aspect-[3/2] bg-white/[0.02] border-b border-border-subtle flex items-center justify-center overflow-hidden">
        {doc.thumbnail_url ? (
          <img src={doc.thumbnail_url} alt={doc.name} className="w-full h-full object-cover" />
        ) : (
          <File size={40} className={mimeIconClass} />
        )}
        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold border ${mimeBadgeClass}`}>
          {mimeLabel}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onStar(); }}
          className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-black/30 backdrop-blur-sm border border-white/[0.06] hover:border-amber/30 transition-all ${
            doc.is_starred ? 'text-amber' : 'text-white/30 hover:text-amber/60'
          }`}
        >
          <Star size={14} fill={doc.is_starred ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-semibold text-text-primary truncate">{doc.name}</h3>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              {formatSize(doc.size_bytes)} · {formatDate(doc.updated_at)}
            </p>
          </div>
          <div className="relative shrink-0">
            <button
              onClick={onToggleMenu}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-white/[0.06] hover:text-text-secondary transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 glass-panel-strong rounded-lg border border-border-strong shadow-[0_8px_30px_rgba(0,0,0,0.6)] z-20 py-1 animate-fade-in-up">
                <button
                  onClick={(e) => { e.stopPropagation(); onStar(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-colors"
                >
                  <Star size={13} className={doc.is_starred ? 'text-amber' : ''} />
                  {doc.is_starred ? 'Unstar' : 'Star'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-text-secondary hover:bg-rose/10 hover:text-rose transition-colors"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {doc.tags.map((tag, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-white/[0.03] border border-border-subtle rounded text-[10px] text-text-tertiary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;
