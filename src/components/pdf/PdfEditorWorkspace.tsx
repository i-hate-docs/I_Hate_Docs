"use client";

/**
 * PdfEditorWorkspace — Minimalist Edition
 * ─────────────────────────────────────────
 * Drop a PDF → see every page as a numbered row →
 * rotate / move / delete pages → export in one click.
 *
 * Uses only pdf-lib (already a project dep).
 * Zero pdfjs-dist / canvas / CDN workers needed.
 */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { applyEdits, downloadPDF } from "@/lib/pdfEngine";
import type { PageEdit } from "@/lib/pdfEngine";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageItem {
  /** Stable ID so Reorder.Item can track identity across moves */
  id: string;
  /** 0-based index in the *original* source PDF */
  originalIndex: number;
  /** Accumulated extra rotation (multiple rotations stacked) */
  extraRotation: 0 | 90 | 180 | 270;
}

type Phase = "empty" | "loading" | "ready" | "saving";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconChevronUp() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 10l4-4 4 4" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}
function IconRotateCW() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M13 5A6 6 0 1 0 14 9" />
      <path d="M13 2v3h3" />
    </svg>
  );
}
function IconRotateCCW() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 5A6 6 0 1 1 2 9" />
      <path d="M3 2v3H0" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" />
    </svg>
  );
}
function IconGrip() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
      <circle cx="5" cy="4" r="1.2" /><circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" /><circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
      <path d="M10 13l-5-5h3.5V3h3v5H15L10 13z" />
      <rect x="3" y="15" width="14" height="2" rx="1" />
    </svg>
  );
}

// ── Rotation label ─────────────────────────────────────────────────────────────

function RotationBadge({ deg }: { deg: number }) {
  if (deg === 0) return null;
  return (
    <span
      className="rounded-full px-1.5 py-0.5 font-mono text-[10px]"
      style={{ background: "rgba(255,212,0,0.12)", color: "#FFD400", border: "1px solid rgba(255,212,0,0.25)" }}
    >
      +{deg}°
    </span>
  );
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────

function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") onFile(f);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Drop a PDF here or click to browse"
      className="group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl transition-all"
      style={{
        background: over
          ? "rgba(0,229,255,0.06)"
          : "linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
        border: `1px solid ${over ? "rgba(0,229,255,0.55)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: over ? "0 0 60px rgba(0,229,255,0.18)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(16px)",
        transition: "all 300ms ease",
      }}
    >
      {/* Dashed inner border */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
        <rect x="8" y="8" width="calc(100% - 16px)" height="calc(100% - 16px)" rx="20" fill="none"
          stroke={over ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.07)"}
          strokeWidth="1" strokeDasharray="7 5" />
      </svg>

      {/* Duck icon */}
      <motion.div
        animate={over ? { scale: 1.15, rotate: -8 } : { scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-6xl select-none"
      >
        🦆
      </motion.div>

      <div className="text-center">
        <p className="font-display text-xl font-semibold text-white">
          {over ? "Release to load PDF" : "Drop your PDF here"}
        </p>
        <p className="mt-1 text-sm text-white/45">or click to browse · max 50 MB</p>
      </div>

      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/35">
        .pdf
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </motion.div>
  );
}

// ── Page Row ──────────────────────────────────────────────────────────────────

function PageRow({
  page,
  position,
  total,
  onRotateCW,
  onRotateCCW,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  page: PageItem;
  position: number;
  total: number;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <Reorder.Item
      value={page}
      id={page.id}
      className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
        cursor: "grab",
      }}
      whileDrag={{ scale: 1.02, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", zIndex: 10 }}
    >
      {/* Grip */}
      <span className="text-white/20 group-hover:text-white/40 transition-colors">
        <IconGrip />
      </span>

      {/* Page number */}
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold"
        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
      >
        {position + 1}
      </span>

      {/* Label */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <span className="text-sm text-white/65 truncate">
          Page {page.originalIndex + 1}
        </span>
        <RotationBadge deg={page.extraRotation} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconBtn
          label="Move up"
          onClick={onMoveUp}
          disabled={position === 0}
        >
          <IconChevronUp />
        </IconBtn>
        <IconBtn
          label="Move down"
          onClick={onMoveDown}
          disabled={position === total - 1}
        >
          <IconChevronDown />
        </IconBtn>
        <div className="mx-1 h-4 w-px bg-white/10" />
        <IconBtn label="Rotate clockwise" onClick={onRotateCW}>
          <IconRotateCW />
        </IconBtn>
        <IconBtn label="Rotate counter-clockwise" onClick={onRotateCCW}>
          <IconRotateCCW />
        </IconBtn>
        <div className="mx-1 h-4 w-px bg-white/10" />
        <IconBtn label="Delete page" onClick={onDelete} danger>
          <IconTrash />
        </IconBtn>
      </div>
    </Reorder.Item>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed ${
        danger
          ? "text-red-400/60 hover:bg-red-500/15 hover:text-red-400"
          : "text-white/40 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PdfEditorWorkspace() {
  const [phase, setPhase] = useState<Phase>("empty");
  const [fileName, setFileName] = useState("");
  const [pages, setPages] = useState<PageItem[]>([]);
  const sourceRef = useRef<ArrayBuffer | null>(null);

  // ── Load ─────────────────────────────────────────────────────────────────────

  const loadFile = useCallback(async (file: File) => {
    if (file.size > 50 * 1_048_576) return; // 50 MB guard
    setPhase("loading");
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const count = doc.getPageCount();
      sourceRef.current = buf;
      setFileName(file.name);
      setPages(
        Array.from({ length: count }, (_, i) => ({
          id: `page-${i}`,
          originalIndex: i,
          extraRotation: 0,
        })),
      );
      setPhase("ready");
    } catch {
      setPhase("empty");
    }
  }, []);

  // ── Page mutations ─────────────────────────────────────────────────────────

  const rotatePage = (idx: number, dir: 1 | -1) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              extraRotation: (((p.extraRotation + dir * 90) % 360 + 360) %
                360) as 0 | 90 | 180 | 270,
            }
          : p,
      ),
    );
  };

  const deletePage = (idx: number) => {
    setPages((prev) => prev.filter((_, i) => i !== idx));
  };

  const movePage = (idx: number, dir: -1 | 1) => {
    setPages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    if (!sourceRef.current || !pages.length) return;
    setPhase("saving");
    try {
      const edits: PageEdit[] = pages.map((p) => ({
        originalIndex: p.originalIndex,
        extraRotation: p.extraRotation,
      }));
      const bytes = await applyEdits(sourceRef.current, edits);
      downloadPDF(bytes, fileName.replace(/\.pdf$/i, "-edited.pdf"));
    } finally {
      setPhase("ready");
    }
  };

  const reset = () => {
    setPhase("empty");
    setPages([]);
    setFileName("");
    sourceRef.current = null;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait">

        {/* ── EMPTY: drop zone ── */}
        {phase === "empty" && (
          <motion.div
            key="empty"
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
          >
            <DropZone onFile={loadFile} />
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[260px] flex-col items-center justify-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-5xl"
            >
              🦆
            </motion.div>
            <p className="text-sm text-white/50">Loading your PDF…</p>
          </motion.div>
        )}

        {/* ── READY / SAVING: editor ── */}
        {(phase === "ready" || phase === "saving") && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* File header */}
            <div
              className="flex items-center justify-between gap-4 rounded-2xl px-5 py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">📄</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{fileName}</p>
                  <p className="font-mono text-[11px] text-white/40">
                    {pages.length} page{pages.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Replace
              </button>
            </div>

            {/* Instructions */}
            <p className="text-xs text-white/30 pl-1">
              Drag rows to reorder · hover a row for actions · changes apply on export
            </p>

            {/* Page list */}
            {pages.length === 0 ? (
              <div
                className="flex items-center justify-center rounded-2xl py-10 text-sm text-white/35"
                style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
              >
                All pages deleted — add more or export an empty shell.
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={pages}
                onReorder={setPages}
                className="space-y-2"
              >
                {pages.map((page, idx) => (
                  <PageRow
                    key={page.id}
                    page={page}
                    position={idx}
                    total={pages.length}
                    onRotateCW={() => rotatePage(idx, 1)}
                    onRotateCCW={() => rotatePage(idx, -1)}
                    onMoveUp={() => movePage(idx, -1)}
                    onMoveDown={() => movePage(idx, 1)}
                    onDelete={() => deletePage(idx)}
                  />
                ))}
              </Reorder.Group>
            )}

            {/* Export toolbar */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleExport}
                disabled={phase === "saving" || pages.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cyber px-6 py-3 text-sm font-semibold text-black shadow-glow ring-1 ring-cyber/60 transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phase === "saving" ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      🦆
                    </motion.span>
                    Saving…
                  </>
                ) : (
                  <>
                    <IconDownload />
                    Export PDF
                    <span className="ml-0.5 rounded-full bg-black/20 px-1.5 py-0.5 font-mono text-[10px]">
                      {pages.length}p
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
