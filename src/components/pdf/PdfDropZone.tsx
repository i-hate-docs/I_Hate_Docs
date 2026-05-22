"use client";

/**
 * PdfDropZone
 * ───────────
 * Reusable drag-and-drop upload widget that drives the entire PDF tool
 * interaction cycle: idle → dragging → ready → processing → done | error.
 *
 * Props
 * ─────
 * action       The tool id forwarded to /api/pdf/proxy as `action`.
 * multiFile    Allow multiple files (Merge, Images→PDF). Default false.
 * acceptedTypes MIME type array; controls <input accept> and client validation.
 * extraParams  Additional FormData fields sent alongside the file.
 * onDone       Called with the object-URL + filename when processing succeeds.
 */

import { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatBytes } from "@/lib/pdf-tools";

// ── Types ────────────────────────────────────────────────────────────────────

type DropState = "idle" | "dragging" | "ready" | "processing" | "done" | "error";

interface FileEntry {
  file: File;
  name: string;
  size: number;
}

interface Props {
  action: string;
  multiFile?: boolean;
  acceptedTypes?: string[];
  extraParams?: Record<string, string>;
  onDone?: (objectUrl: string, filename: string) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DuckIdleIcon() {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden>
      {/* body */}
      <ellipse cx="48" cy="64" rx="32" ry="22" fill="#FFD400" />
      {/* wing */}
      <ellipse
        cx="36"
        cy="62"
        rx="16"
        ry="9"
        fill="#E6BE00"
        transform="rotate(-12 36 62)"
      />
      {/* head */}
      <circle cx="72" cy="46" r="16" fill="#FFD400" />
      {/* eye */}
      <circle cx="77" cy="41" r="3" fill="#0a0a0a" />
      <circle cx="78" cy="40" r="1" fill="white" />
      {/* beak */}
      <path d="M85 46 L96 44 L96 50 L85 50 Z" fill="#FF8A00" />
      {/* tail */}
      <path d="M17 58 Q4 50 8 64 Q12 74 22 69 Z" fill="#E6BE00" />
      {/* feet */}
      <path
        d="M36 82 L30 92 M36 82 L42 92 M36 82 L48 89"
        stroke="#FF8A00"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 85 L50 94 M56 85 L62 94"
        stroke="#FF8A00"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function DuckHappyIcon() {
  return (
    <motion.svg
      viewBox="0 0 96 96"
      className="h-20 w-20"
      aria-hidden
      animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="48" cy="64" rx="32" ry="22" fill="#FFD400" />
      <ellipse cx="36" cy="62" rx="16" ry="9" fill="#E6BE00" transform="rotate(-12 36 62)" />
      <circle cx="72" cy="46" r="16" fill="#FFD400" />
      <circle cx="77" cy="41" r="3" fill="#0a0a0a" />
      <circle cx="78" cy="40" r="1" fill="white" />
      {/* happy beak — slightly open */}
      <path d="M85 44 L96 42 L96 52 L85 52 Z" fill="#FF8A00" />
      <path d="M85 52 Q90 55 96 52" stroke="#E67000" strokeWidth="1.5" fill="none" />
      <path d="M17 58 Q4 50 8 64 Q12 74 22 69 Z" fill="#E6BE00" />
    </motion.svg>
  );
}

function DuckDragIcon() {
  return (
    <motion.svg
      viewBox="0 0 96 96"
      className="h-20 w-20"
      aria-hidden
      animate={{ scale: [1, 1.08, 1], rotate: [-6, 6, -6] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="48" cy="64" rx="32" ry="22" fill="#00E5FF" opacity="0.9" />
      <ellipse cx="36" cy="62" rx="16" ry="9" fill="#00C8E0" transform="rotate(-12 36 62)" />
      <circle cx="72" cy="46" r="16" fill="#00E5FF" opacity="0.9" />
      <circle cx="77" cy="41" r="3" fill="#0a0a0a" />
      <circle cx="78" cy="40" r="1" fill="white" />
      <path d="M85 46 L96 44 L96 50 L85 50 Z" fill="#0099CC" />
      <path d="M17 58 Q4 50 8 64 Q12 74 22 69 Z" fill="#00C8E0" />
    </motion.svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 32" className={className} fill="none" aria-hidden>
      <rect x="1" y="1" width="20" height="27" rx="3" fill="rgba(255,212,0,0.12)" stroke="#FFD400" strokeWidth="1.2" />
      <path d="M15 1 L21 7" stroke="#FFD400" strokeWidth="1.2" />
      <rect x="14" y="0" width="7" height="7" rx="1" fill="rgba(255,212,0,0.12)" stroke="#FFD400" strokeWidth="1.2" />
      <path d="M5 13 h12 M5 17 h9 M5 21 h11" stroke="#FFD400" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      {/* PDF badge */}
      <rect x="0" y="22" width="14" height="9" rx="2" fill="#B026FF" />
      <text x="7" y="29" fontSize="4.8" fill="white" textAnchor="middle" fontFamily="monospace" fontWeight="700">
        PDF
      </text>
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path d="M10 12.5l-4.5-4.5h3V3h3v5h3L10 12.5z" />
      <rect x="3" y="15" width="14" height="2" rx="1" />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PdfDropZone({
  action,
  multiFile = false,
  acceptedTypes = ["application/pdf"],
  extraParams = {},
  onDone,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<DropState>("idle");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── File validation ──────────────────────────────────────────────────────────
  const validate = useCallback(
    (raw: File[]): FileEntry[] | null => {
      for (const f of raw) {
        const valid = acceptedTypes.some((mime) =>
          mime.endsWith("/*")
            ? f.type.startsWith(mime.replace("/*", "/"))
            : f.type === mime,
        );
        if (!valid) {
          setErrorMsg(`"${f.name}" isn't a supported type.`);
          setState("error");
          return null;
        }
        const limitMB = 50;
        if (f.size > limitMB * 1_048_576) {
          setErrorMsg(`"${f.name}" is over the ${limitMB} MB limit.`);
          setState("error");
          return null;
        }
      }
      return raw.map((f) => ({ file: f, name: f.name, size: f.size }));
    },
    [acceptedTypes],
  );

  // ── Drop handlers ────────────────────────────────────────────────────────────
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (state === "idle" || state === "ready") setState("dragging");
    },
    [state],
  );

  const handleDragLeave = useCallback(() => {
    setState((s) => (s === "dragging" ? (files.length ? "ready" : "idle") : s));
  }, [files.length]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files);
      const subset = multiFile ? dropped : [dropped[0]];
      const entries = validate(subset);
      if (entries) {
        setFiles((prev) => (multiFile ? [...prev, ...entries] : entries));
        setState("ready");
      }
    },
    [multiFile, validate],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (!selected.length) return;
      const subset = multiFile ? selected : [selected[0]];
      const entries = validate(subset);
      if (entries) {
        setFiles((prev) => (multiFile ? [...prev, ...entries] : entries));
        setState("ready");
      }
      // Reset input so the same file can be re-selected after a clear
      e.target.value = "";
    },
    [multiFile, validate],
  );

  const handleZoneClick = useCallback(() => {
    if (state === "idle" || state === "ready") inputRef.current?.click();
  }, [state]);

  // ── Process ──────────────────────────────────────────────────────────────────
  const handleProcess = useCallback(async () => {
    if (!files.length) return;
    setState("processing");
    setProgress(0);

    // Fake progress while the fetch is in flight
    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 10 + 3, 88));
    }, 350);

    try {
      const body = new FormData();
      // action is now the URL segment — still append it so the legacy proxy
      // route stays compatible if someone hits it directly.
      body.append("action", action);
      if (multiFile) {
        files.forEach((f) => body.append("fileInput", f.file));
      } else {
        body.append("fileInput", files[0].file);
      }
      Object.entries(extraParams).forEach(([k, v]) => body.append(k, v));

      // POST to /api/pdf/[action] — runs pdf-lib locally, Stirling for heavy ops
      const res = await fetch(`/api/pdf/${action}`, { method: "POST", body });

      clearInterval(ticker);
      setProgress(100);

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(String(json.error ?? `HTTP ${res.status}`));
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const cd = res.headers.get("content-disposition") ?? "";
      const match = cd.match(/filename="?([^";]+)"?/);
      const filename = match?.[1] ?? `ihatedocs-${action}.pdf`;

      setDownloadUrl(url);
      setDownloadFilename(filename);
      setState("done");
      onDone?.(url, filename);
    } catch (err) {
      clearInterval(ticker);
      setErrorMsg(err instanceof Error ? err.message : "Processing failed.");
      setState("error");
    }
  }, [files, action, multiFile, extraParams, onDone]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setDownloadUrl(null);
    setDownloadFilename("");
    setErrorMsg("");
    setProgress(0);
    setState("idle");
  }, [downloadUrl]);

  const removeFile = useCallback((name: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.name !== name);
      if (!next.length) setState("idle");
      return next;
    });
  }, []);

  // ── Border / glow by state ────────────────────────────────────────────────────
  const borderColor: Record<DropState, string> = {
    idle: "rgba(255,255,255,0.08)",
    dragging: "rgba(0,229,255,0.60)",
    ready: "rgba(255,212,0,0.50)",
    processing: "rgba(255,212,0,0.30)",
    done: "rgba(0,229,255,0.55)",
    error: "rgba(255,60,60,0.55)",
  };
  const glowColor: Record<DropState, string> = {
    idle: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 24px 48px -20px rgba(0,0,0,0.5)",
    dragging: "0 0 60px rgba(0,229,255,0.25), inset 0 0 40px rgba(0,229,255,0.06)",
    ready: "0 0 60px rgba(255,212,0,0.18), inset 0 0 40px rgba(255,212,0,0.05)",
    processing: "0 0 40px rgba(255,212,0,0.12)",
    done: "0 0 60px rgba(0,229,255,0.25), inset 0 0 40px rgba(0,229,255,0.06)",
    error: "0 0 50px rgba(255,60,60,0.18)",
  };

  const isClickable = state === "idle" || state === "ready";
  const accept = acceptedTypes.join(",");

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-3">
      {/* ── Drop zone ── */}
      <motion.div
        layout
        role="button"
        tabIndex={0}
        aria-label={`Drop ${multiFile ? "files" : "a file"} here or click to browse`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={isClickable ? handleZoneClick : undefined}
        onKeyDown={(e) => e.key === "Enter" && isClickable && inputRef.current?.click()}
        className="relative overflow-hidden rounded-3xl"
        style={{
          minHeight: 260,
          cursor: isClickable ? "pointer" : "default",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          border: `1px solid ${borderColor[state]}`,
          boxShadow: glowColor[state],
          transition: "border-color 320ms ease, box-shadow 320ms ease",
          userSelect: "none",
        }}
      >
        {/* Grain */}
        <div className="noise" aria-hidden />

        {/* Dashed border SVG (idle + dragging only) */}
        {(state === "idle" || state === "dragging") && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
            preserveAspectRatio="none"
          >
            <rect
              x="6" y="6"
              width="calc(100% - 12px)" height="calc(100% - 12px)"
              rx="20" ry="20"
              fill="none"
              stroke={state === "dragging" ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.09)"}
              strokeWidth="1"
              strokeDasharray="7 5"
            />
          </svg>
        )}

        {/* Inner content */}
        <div
          className="flex flex-col items-center justify-center gap-5 p-8"
          style={{ minHeight: 260 }}
        >
          <AnimatePresence mode="wait">

            {/* IDLE */}
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <DuckIdleIcon />
                <div>
                  <p className="font-display text-xl font-semibold text-white">
                    Drop your {multiFile ? "files" : "PDF"} here
                  </p>
                  <p className="mt-1.5 text-sm text-white/50">
                    or click to browse &middot; max 50 MB{multiFile ? " per file" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {acceptedTypes.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-white/40"
                    >
                      {t.replace("application/", ".").replace("image/", ".").replace(".", "")}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* DRAGGING */}
            {state === "dragging" && (
              <motion.div
                key="dragging"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <DuckDragIcon />
                <p className="font-display text-xl font-semibold text-neon-cyan">
                  Release to load your {multiFile ? "files" : "file"}
                </p>
              </motion.div>
            )}

            {/* READY */}
            {state === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full max-w-sm flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {files.map((f) => (
                  <div
                    key={f.name + f.size}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3"
                  >
                    <FileIcon className="h-8 w-7 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-snug text-white">
                        {f.name}
                      </p>
                      <p className="font-mono text-xs text-white/40">{formatBytes(f.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(f.name)}
                      aria-label={`Remove ${f.name}`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white/80"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {multiFile && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="mt-1 text-center text-xs text-white/35 underline underline-offset-4 transition-colors hover:text-white/70"
                  >
                    + Add more files
                  </button>
                )}
              </motion.div>
            )}

            {/* PROCESSING */}
            {state === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                className="flex flex-col items-center gap-5 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Spinning ring around the duck emoji */}
                <div className="relative h-20 w-20">
                  <motion.svg
                    viewBox="0 0 80 80"
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  >
                    <circle
                      cx="40" cy="40" r="36"
                      fill="none"
                      stroke="url(#spin-grad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="100 126"
                    />
                    <defs>
                      <linearGradient id="spin-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FFD400" />
                        <stop offset="100%" stopColor="#00E5FF" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">
                    🦆
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-[220px]">
                  <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #FFD400 0%, #00E5FF 100%)",
                        width: `${progress}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[11px] text-white/45">
                    Processing… {Math.round(progress)}%
                  </p>
                </div>
              </motion.div>
            )}

            {/* DONE */}
            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="flex flex-col items-center gap-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.05 }}
                  className="flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle at 40% 30%, rgba(0,229,255,0.2), transparent 70%)",
                    border: "1px solid rgba(0,229,255,0.4)",
                    borderRadius: "50%",
                    padding: "12px",
                  }}
                >
                  <DuckHappyIcon />
                </motion.div>
                <div>
                  <p className="font-display text-xl font-semibold text-white">
                    Quack! All done. 🎉
                  </p>
                  <p className="mt-1 font-mono text-xs text-white/40">{downloadFilename}</p>
                </div>
              </motion.div>
            )}

            {/* ERROR */}
            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="flex flex-col items-center gap-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                  style={{
                    border: "1px solid rgba(255,70,70,0.5)",
                    background: "rgba(255,70,70,0.1)",
                    color: "rgba(255,120,120,1)",
                  }}
                >
                  ✕
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-red-400">
                    Something quacked.
                  </p>
                  <p className="mt-1 font-mono text-xs text-white/50 max-w-[280px]">
                    {errorMsg}
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Action bar — lives below the zone ── */}
      <AnimatePresence>

        {state === "ready" && (
          <motion.div
            key="actions-ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={handleProcess}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cyber px-6 py-3.5 text-sm font-semibold text-black shadow-glow ring-1 ring-cyber/60 transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              Process PDF
              <span aria-hidden className="opacity-70">→</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Clear
            </button>
          </motion.div>
        )}

        {state === "done" && downloadUrl && (
          <motion.div
            key="actions-done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3"
          >
            <a
              href={downloadUrl}
              download={downloadFilename}
              className="flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-neon-cyan ring-1 ring-neon-cyan/40 shadow-glow-cyan transition-transform hover:scale-[1.02] active:scale-[0.97]"
              style={{ background: "rgba(0,229,255,0.08)" }}
            >
              <DownloadIcon className="h-4 w-4" />
              Download
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 text-sm text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Another
            </button>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="actions-error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-3.5 text-sm text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Try again
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiFile}
        onChange={handleInputChange}
      />
    </div>
  );
}
