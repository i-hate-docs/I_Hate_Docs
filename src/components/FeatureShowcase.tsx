"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SplitText } from "./SplitText";

type Tool = {
  title: string;
  blurb: string;
  accent: string;
  href: string;
};

const TOOLS: Tool[] = [
  {
    title: "AI PDF Editor",
    blurb: "Edit, annotate, redact, sign — with an AI copilot.",
    accent: "#FFD400",
    href: "/features",
  },
  {
    title: "AI Slide Generator",
    blurb: "PDF or prompt → polished deck in under 30 seconds.",
    accent: "#00E5FF",
    href: "/features",
  },
  {
    title: "Doc Chat",
    blurb: "Ask any document. Get answers with page citations.",
    accent: "#B026FF",
    href: "/features",
  },
  {
    title: "Merge & Split",
    blurb: "Drag, drop, rearrange. Combine PDFs in one click.",
    accent: "#FFD400",
    href: "/features",
  },
  {
    title: "E-Signature",
    blurb: "Sign, request, audit — step by step, legally binding.",
    accent: "#00E5FF",
    href: "/features",
  },
  {
    title: "Redact & Privacy",
    blurb: "One-click redaction. Private mode with zero retention.",
    accent: "#B026FF",
    href: "/features",
  },
  {
    title: "OCR Engine",
    blurb: "Turn scans into searchable, copy-pastable text.",
    accent: "#FFD400",
    href: "/features",
  },
  {
    title: "Brand Kits",
    blurb: "Lock in your fonts, colors, logo — across every doc.",
    accent: "#00E5FF",
    href: "/features",
  },
  {
    title: "Batch Automations",
    blurb: "Process a thousand documents the way you process one.",
    accent: "#B026FF",
    href: "/features",
  },
];

export function FeatureShowcase() {
  return (
    <section className="relative overflow-hidden bg-obsidian py-24 sm:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72"
        style={{
          background:
            "radial-gradient(800px 400px at 50% 0%, rgba(255,212,0,0.10), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-white/40">
            One platform · every document
          </div>
          <SplitText
            as="h2"
            text="All your doc tools, behind one duck."
            by="word"
            className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-[3.4rem]"
          />
          <p className="mt-4 text-base text-white/65">
            Nine tools. One workspace. No tab-switching. No reading 800-page
            PDFs by hand. Just drop it in and let the duck do it.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t, i) => (
            <ToolCard key={t.title} tool={t} delay={i * 0.04} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 rounded-full bg-cyber px-6 py-3 text-sm font-medium text-black shadow-glow ring-1 ring-cyber/60 transition-transform hover:scale-[1.02]"
          >
            Explore every feature
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ToolCard({ tool, delay }: { tool: Tool; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay }}
      whileHover={{ y: -6 }}
    >
      <Link
        href={tool.href}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-6 ring-1 ring-white/[0.06] transition-colors hover:ring-white/15"
        style={{
          boxShadow: `0 30px 60px -50px ${tool.accent}33, inset 0 1px 0 0 rgba(255,255,255,0.04)`,
        }}
      >
        {/* hover sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
        >
          <span className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-shimmer" />
        </span>

        <div
          className="mb-5 grid h-11 w-11 place-items-center rounded-2xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${tool.accent}55, transparent 70%)`,
            border: `1px solid ${tool.accent}44`,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: tool.accent,
              boxShadow: `0 0 14px ${tool.accent}`,
            }}
          />
        </div>

        <h3 className="font-display text-lg font-semibold leading-tight text-white">
          {tool.title}
        </h3>
        <p className="mt-2 text-sm text-white/65">{tool.blurb}</p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-white/40 transition-colors group-hover:text-white/80">
          Learn more
          <span aria-hidden>→</span>
        </span>
      </Link>
    </motion.div>
  );
}
