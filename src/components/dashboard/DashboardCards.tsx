"use client";

import Link from "next/link";
import { useState } from "react";
import { ComingSoonModal } from "@/components/ComingSoonModal";

interface Tool {
  title: string;
  blurb: string;
  accent: string;
  href: string;
  /** When true, clicking shows a "coming soon" modal instead of navigating */
  comingSoon?: boolean;
  comingSoonDesc?: string;
}

const tools: Tool[] = [
  {
    title: "PDF Toolbox",
    blurb: "Merge, split, rotate, compress, watermark & 11 more ops.",
    accent: "#FFD400",
    href: "/dashboard/tools",
  },
  {
    title: "Visual PDF Editor",
    blurb: "Drag pages, rotate, delete — export in one click. 100% in-browser.",
    accent: "#B026FF",
    href: "/dashboard/editor",
  },
  {
    title: "AI Slide Generator",
    blurb: "PDF or prompt → polished deck in 30 s.",
    accent: "#00E5FF",
    href: "#",
    comingSoon: true,
    comingSoonDesc:
      "Turn any PDF or prompt into a polished slide deck in seconds. We're adding the finishing quacks.",
  },
  {
    title: "Doc Chat",
    blurb: "Ask any document, get cited answers instantly.",
    accent: "#B026FF",
    href: "#",
    comingSoon: true,
    comingSoonDesc:
      "Chat with any PDF and get answers with exact page citations. Coming very soon.",
  },
];

export function DashboardCards() {
  const [modal, setModal] = useState<{ feature: string; description: string } | null>(null);

  return (
    <>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((t) =>
          t.comingSoon ? (
            /* Coming-soon card — intercept click, show modal */
            <button
              key={t.title}
              type="button"
              onClick={() => setModal({ feature: t.title, description: t.comingSoonDesc ?? "" })}
              className="group relative overflow-hidden rounded-3xl glass p-6 text-left transition-transform hover:-translate-y-1"
              style={{
                boxShadow: `0 30px 80px -50px ${t.accent}33, inset 0 1px 0 0 rgba(255,255,255,0.06)`,
              }}
            >
              <CardInner tool={t} comingSoon />
            </button>
          ) : (
            /* Live card — normal navigation */
            <Link
              key={t.title}
              href={t.href}
              className="group relative overflow-hidden rounded-3xl glass-strong p-6 transition-transform hover:-translate-y-1"
              style={{
                boxShadow: `0 30px 80px -50px ${t.accent}55, inset 0 1px 0 0 rgba(255,255,255,0.06)`,
              }}
            >
              <CardInner tool={t} />
            </Link>
          ),
        )}
      </div>

      <ComingSoonModal
        show={!!modal}
        feature={modal?.feature ?? ""}
        description={modal?.description}
        onClose={() => setModal(null)}
      />
    </>
  );
}

function CardInner({ tool, comingSoon }: { tool: Tool; comingSoon?: boolean }) {
  return (
    <>
      {/* Accent dot */}
      <div
        className="mb-4 grid h-10 w-10 place-items-center rounded-2xl"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${tool.accent}${comingSoon ? "33" : "55"}, transparent 70%)`,
          border: `1px solid ${tool.accent}${comingSoon ? "22" : "44"}`,
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: comingSoon ? `${tool.accent}88` : tool.accent,
            boxShadow: comingSoon ? "none" : `0 0 14px ${tool.accent}`,
          }}
        />
      </div>

      {/* Title + coming soon badge */}
      <div className="flex items-start justify-between gap-2">
        <h2
          className={`font-display text-xl font-semibold ${comingSoon ? "text-white/50" : "text-white"}`}
        >
          {tool.title}
        </h2>
        {comingSoon && (
          <span
            className="mt-1 shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
            style={{ background: "rgba(176,38,255,0.12)", border: "1px solid rgba(176,38,255,0.25)", color: "#B026FF" }}
          >
            Soon
          </span>
        )}
      </div>

      <p className={`mt-2 text-sm ${comingSoon ? "text-white/35" : "text-white/65"}`}>
        {tool.blurb}
      </p>

      <span
        className={`mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] transition-colors ${
          comingSoon
            ? "text-white/25"
            : "text-white/55 group-hover:text-cyber"
        }`}
      >
        {comingSoon ? "Coming soon" : "Open"}
        <span aria-hidden>{comingSoon ? "🚧" : "→"}</span>
      </span>
    </>
  );
}
