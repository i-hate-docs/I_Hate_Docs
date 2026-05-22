"use client";

/**
 * ToolsGrid
 * ─────────
 * Animated, filterable grid of PDF tool cards.
 * Stagger-reveals on scroll entry (Framer Motion whileInView),
 * category filter pills use a shared layoutId for the active indicator,
 * each card glows in its accent colour and links to /dashboard/tools/[id].
 * Coming-soon tools open a ComingSoonModal instead of navigating.
 */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PDF_TOOLS,
  TOOL_CATEGORIES,
  type PdfTool,
  type ToolCategory,
} from "@/lib/pdf-tools";
import { ComingSoonModal } from "@/components/ComingSoonModal";

// ── Stagger animation variants ────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    // Cast to tuple so Framer Motion v12 accepts it as BezierDefinition
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ── Category-colour mapping for the filter pills ──────────────────────────────
const CATEGORY_ACCENT: Record<ToolCategory | "all", string> = {
  all: "rgba(255,255,255,0.15)",
  organize: "rgba(255,212,0,0.22)",
  optimize: "rgba(0,229,255,0.22)",
  convert: "rgba(0,229,255,0.22)",
  security: "rgba(176,38,255,0.22)",
  advanced: "rgba(255,47,208,0.22)",
};

// ── Tool icons ────────────────────────────────────────────────────────────────
// Minimal 24-px SVG paths keyed by tool id.

function ToolIcon({ id, accent }: { id: string; accent: string }) {
  const paths: Record<string, React.ReactNode> = {
    merge: (
      <>
        <rect x="2" y="3" width="8" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="14" y="3" width="8" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 17 Q6 21 12 21 Q18 21 18 17" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 19 L12 21 L14 19" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
    split: (
      <>
        <rect x="3" y="2" width="18" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2"/>
        <path d="M9 9 L12 12 L9 15 M15 9 L12 12 L15 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </>
    ),
    rotate: (
      <>
        <path d="M19.07 4.93A10 10 0 0 0 4 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M20 2 L20 8 L14 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="14" r="5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      </>
    ),
    "remove-pages": (
      <>
        <rect x="3" y="2" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <line x1="17" y1="8" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="21" y1="8" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="6" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
        <line x1="6" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.55"/>
      </>
    ),
    compress: (
      <>
        <rect x="3" y="2" width="18" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 14 L12 18 L16 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 18 L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 6 h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <path d="M8 9 h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </>
    ),
    flatten: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="5" y="2" width="14" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45"/>
        <path d="M7 15 h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
      </>
    ),
    "pdf-to-word": (
      <>
        <rect x="2" y="2" width="12" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M16 8 L20 8 M18 5 L18 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 7 h6 M5 10 h4 M5 13 h6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5"/>
      </>
    ),
    "pdf-to-images": (
      <>
        <rect x="2" y="4" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="6" cy="7.5" r="1.2" fill="currentColor" opacity="0.6"/>
        <path d="M2 13 L6 10 L9 12 L12 9 L16 13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M19 8 L22 11 M19 11 L22 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    "images-to-pdf": (
      <>
        <rect x="2" y="4" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="5" cy="7" r="1" fill="currentColor" opacity="0.6"/>
        <path d="M2 12 L5 9 L8 11 L14 6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" opacity="0.7"/>
        <path d="M17 5 L21 9 M17 9 L21 5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.4"/>
        <rect x="16" y="11" width="6" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M18 14 h2 M18 16 h1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      </>
    ),
    "pdf-to-html": (
      <>
        <path d="M4 6 L2 12 L4 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 6 L22 12 L20 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 8 L16 8 M9 12 L15 12 M10 16 L14 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      </>
    ),
    watermark: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <text x="12" y="15" fontSize="8" fill="currentColor" textAnchor="middle" opacity="0.5" transform="rotate(-20,12,12)" fontFamily="monospace" fontWeight="700">WM</text>
        <path d="M5 19 L19 5" stroke="currentColor" strokeWidth="0.8" opacity="0.25"/>
      </>
    ),
    "password-protect": (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 11 V8 A4 4 0 0 1 16 8 V11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
        <line x1="12" y1="17.5" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </>
    ),
    redact: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="5" y="8" width="14" height="3" rx="1" fill="currentColor" opacity="0.65"/>
        <rect x="5" y="13" width="9" height="3" rx="1" fill="currentColor" opacity="0.65"/>
        <line x1="16" y1="13" x2="19" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="19" y1="13" x2="16" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </>
    ),
    ocr: (
      <>
        <rect x="2" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 10 h10 M5 13 h7 M5 16 h9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5"/>
        <circle cx="19" cy="7" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
        <line x1="21.5" y1="9.5" x2="23" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </>
    ),
    "page-numbers": (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 7 h8 M8 11 h6 M8 15 h8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.45"/>
        <text x="12" y="21.5" fontSize="4.5" fill="currentColor" textAnchor="middle" fontFamily="monospace">1</text>
      </>
    ),
    "edit-metadata": (
      <>
        <rect x="3" y="2" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 7 h8 M6 10 h6 M6 13 h7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.5"/>
        <path d="M15 16 L19 12 L21 14 L17 18 Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <line x1="19" y1="12" x2="21" y2="14" stroke="currentColor" strokeWidth="1.3"/>
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      style={{ color: accent }}
      aria-hidden
    >
      {paths[id] ?? (
        <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      )}
    </svg>
  );
}

// ── Filter pills ──────────────────────────────────────────────────────────────

function CategoryPills({
  active,
  onChange,
}: {
  active: ToolCategory | "all";
  onChange: (c: ToolCategory | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
      {TOOL_CATEGORIES.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(id)}
            className="relative rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-colors"
            style={{
              color: isActive ? "#0a0a0a" : "rgba(255,255,255,0.5)",
            }}
          >
            {/* Sliding background pill */}
            {isActive && (
              <motion.span
                layoutId="pill-bg"
                className="absolute inset-0 rounded-full"
                style={{ background: "#FFD400" }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Tool card ─────────────────────────────────────────────────────────────────

function ToolCard({
  tool,
  onComingSoon,
}: {
  tool: PdfTool;
  onComingSoon: (tool: PdfTool) => void;
}) {
  const inner = (
    <>
      {/* Card surface */}
      <div
        className="flex h-full flex-col gap-3 p-5 transition-shadow duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          border: `1px solid rgba(255,255,255,0.07)`,
          borderRadius: 16,
          boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.05), 0 20px 40px -20px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Hover glow layer */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${tool.accentGlow}, transparent 65%)`,
            boxShadow: `0 0 50px -10px ${tool.accentGlow}`,
          }}
        />
        {/* Icon chip */}
        <div
          className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${tool.accentGlow.replace("0.35", "0.45")}, transparent 70%)`,
            border: `1px solid ${tool.accent}33`,
          }}
        >
          <ToolIcon id={tool.id} accent={tool.accent} />
        </div>
        {/* Text */}
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[15px] font-semibold leading-tight text-white">
              {tool.label}
            </h3>
            {tool.comingSoon && (
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/35">
                Soon
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
            {tool.description}
          </p>
        </div>
        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide"
            style={{ background: CATEGORY_ACCENT[tool.category], color: tool.accent }}
          >
            {tool.category}
          </span>
          {!tool.comingSoon && (
            <span
              className="text-sm text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/70"
              aria-hidden
            >
              →
            </span>
          )}
        </div>
      </div>
    </>
  );

  const sharedClass =
    "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber/60";

  return (
    <motion.div variants={cardVariants} className="flex h-full">
      {tool.comingSoon ? (
        <button
          type="button"
          onClick={() => onComingSoon(tool)}
          className={`${sharedClass} text-left`}
        >
          {inner}
        </button>
      ) : (
        <Link href={`/dashboard/tools/${tool.id}`} className={sharedClass}>
          {inner}
        </Link>
      )}
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ToolsGrid() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const [modal, setModal] = useState<{ feature: string; description: string } | null>(null);

  const visible =
    activeCategory === "all"
      ? PDF_TOOLS
      : PDF_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-7">
      {/* Filter pills */}
      <CategoryPills active={activeCategory} onChange={setActiveCategory} />

      {/* Stats line */}
      <p className="font-mono text-xs text-white/30">
        {visible.length} tool{visible.length !== 1 ? "s" : ""}{" "}
        {activeCategory !== "all" ? `· ${activeCategory}` : ""}
      </p>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={activeCategory}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-label="PDF tools"
        >
          {visible.map((tool) => (
            <li key={tool.id} className="flex">
              <ToolCard
                tool={tool}
                onComingSoon={(t) =>
                  setModal({ feature: t.label, description: t.description })
                }
              />
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {/* Coming-soon modal */}
      <ComingSoonModal
        show={!!modal}
        feature={modal?.feature ?? ""}
        description={modal?.description}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
