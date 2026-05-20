"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "./SplitText";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  visual: "editor" | "slides" | "chat";
  accent: string;
};

const FEATURES: Feature[] = [
  {
    id: "ai-pdf",
    eyebrow: "01 — The AI PDF Editor",
    title: "Edit, sign, merge, and chat with your PDFs.",
    body: "All the boring stuff — annotate, redact, sign, merge — but with an AI copilot that actually understands what's inside.",
    bullets: [
      "Inline AI rewrite & summarize",
      "Field-by-field e-signature flow",
      "Merge, split, redact in one click",
      "Ask: \"What does clause 7 mean?\"",
    ],
    visual: "editor",
    accent: "#FFD400",
  },
  {
    id: "ai-slides",
    eyebrow: "02 — AI Slide Generator",
    title: "Turn boring PDFs into stunning slides.",
    body: "Drop a PDF or type a prompt. Get a beautiful, on-brand deck in seconds — animations included.",
    bullets: [
      "PDF → polished deck in <30s",
      "Auto layouts, themes & brand kits",
      "Live edit with natural language",
      "Export to Keynote, PPT, PDF",
    ],
    visual: "slides",
    accent: "#00E5FF",
  },
  {
    id: "ai-chat",
    eyebrow: "03 — Doc Chat",
    title: "Your document, but conversational.",
    body: "Pull answers, citations, and structured tables out of any document — even 800-page filings — without scrolling.",
    bullets: [
      "Citations linked to source pages",
      "Multi-doc cross-referencing",
      "Tables, timelines, exports",
      "Private mode (zero retention)",
    ],
    visual: "chat",
    accent: "#B026FF",
  },
];

export function Features() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !trackRef.current) return;
    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      // pin only on wide screens
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const distance = () => track.scrollWidth - window.innerWidth + 80;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={wrapRef}
      className="relative overflow-hidden bg-obsidian"
    >
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-12 md:pb-12 md:pt-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-12">
          <div className="max-w-2xl">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-white/40">
              Features
            </div>
            <SplitText
              as="h2"
              text="One platform. Every document."
              by="word"
              className="font-display text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl"
            />
          </div>
          <p className="max-w-sm text-sm text-white/55">
            Scroll →{" "}
            <span className="text-white/85">
              to glide through the suite.
            </span>{" "}
            Built for legal, ops, sales, and the chaos in your downloads
            folder.
          </p>
        </div>
      </div>

      <div className="relative h-[80svh] md:h-[85svh]">
        <div
          ref={trackRef}
          className="absolute inset-y-0 left-0 flex items-center gap-8 pl-6 pr-24 will-change-transform"
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.id} feature={f} />
          ))}
          <div className="flex w-[40vw] shrink-0 flex-col justify-center gap-4 rounded-3xl glass-strong p-10">
            <div className="text-xs uppercase tracking-[0.28em] text-white/40">
              + and more
            </div>
            <h3 className="font-display text-3xl font-semibold leading-tight text-white">
              Brand kits, OCR, batch automations, secure rooms, audit trails.
            </h3>
            <p className="text-white/65">
              Every shipping feature, behind one duck.
            </p>
            <a
              href="#pricing"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-cyber px-5 py-3 text-sm font-medium text-black shadow-glow transition-transform hover:scale-[1.02]"
            >
              See pricing
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current!.querySelectorAll("[data-fade]"), {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.07,
        delay: 0.05,
      });
    }, cardRef);
    return () => ctx.revert();
  }, []);

  return (
    <article
      ref={cardRef}
      className="relative flex w-[85vw] shrink-0 flex-col gap-6 overflow-hidden rounded-3xl glass-strong p-8 sm:w-[70vw] md:w-[58vw] lg:w-[48vw]"
      style={{
        boxShadow: `0 30px 80px -40px ${feature.accent}33, inset 0 1px 0 0 rgba(255,255,255,0.06)`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            data-fade
            className="mb-3 text-[11px] uppercase tracking-[0.28em]"
            style={{ color: feature.accent }}
          >
            {feature.eyebrow}
          </div>
          <h3
            data-fade
            className="max-w-xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl"
          >
            {feature.title}
          </h3>
          <p
            data-fade
            className="mt-4 max-w-md text-sm text-white/65 sm:text-base"
          >
            {feature.body}
          </p>
        </div>
        <div
          className="hidden h-12 w-12 shrink-0 rounded-2xl sm:grid sm:place-items-center"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${feature.accent}55, transparent 70%)`,
            border: `1px solid ${feature.accent}44`,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: feature.accent,
              boxShadow: `0 0 16px ${feature.accent}`,
            }}
          />
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {feature.bullets.map((b) => (
          <li
            key={b}
            data-fade
            className="flex items-center gap-3 rounded-xl bg-white/[0.025] px-3 py-2 text-sm text-white/80 ring-1 ring-white/[0.06]"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: feature.accent,
                boxShadow: `0 0 10px ${feature.accent}`,
              }}
            />
            {b}
          </li>
        ))}
      </ul>

      <div
        data-fade
        className="relative mt-2 grow overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent"
        style={{ minHeight: 280 }}
      >
        <FeatureVisual kind={feature.visual} accent={feature.accent} />
      </div>
    </article>
  );
}

function FeatureVisual({
  kind,
  accent,
}: {
  kind: Feature["visual"];
  accent: string;
}) {
  if (kind === "editor") {
    return (
      <div className="absolute inset-0 grid grid-cols-[1fr_2fr] gap-3 p-4">
        <div className="flex flex-col gap-2 rounded-xl bg-black/30 p-3 ring-1 ring-white/5">
          {[
            "Annotate",
            "Sign",
            "Redact",
            "Merge",
            "Split",
            "OCR",
            "AI Edit",
          ].map((s, i) => (
            <div
              key={s}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] text-white/70 hover:bg-white/5"
              style={
                i === 6 ? { color: accent, background: `${accent}11` } : {}
              }
            >
              <span>{s}</span>
              <span className="opacity-40">⌘{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-xl bg-white/95 p-4 text-black">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="ml-3 text-[10px] uppercase tracking-wider text-black/50">
              Contract_v3.pdf
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-3/4 rounded bg-black/90" />
            <div className="h-1.5 w-1/3 rounded bg-black/40" />
            <div className="mt-3 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded bg-black/70"
                  style={{ width: `${[88, 92, 70, 95, 80, 96, 60, 84][i]}%` }}
                />
              ))}
            </div>
            <div
              className="mt-3 inline-block rounded px-2 py-0.5 text-[10px] font-medium text-black"
              style={{ background: accent }}
            >
              AI: summarize section 3 →
            </div>
          </div>
          <div
            className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-50"
            style={{
              background: `radial-gradient(circle, ${accent}, transparent 70%)`,
            }}
          />
        </div>
      </div>
    );
  }
  if (kind === "slides") {
    return (
      <div className="absolute inset-0 grid grid-cols-3 gap-3 p-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] p-3 ring-1 ring-white/10"
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background: i === 1 ? accent : `${accent}55`,
              }}
            />
            <div className="text-[10px] uppercase tracking-wider text-white/50">
              Slide {i + 1}
            </div>
            <div className="mt-2 h-2 w-3/4 rounded bg-white/80" />
            <div className="mt-1 h-1.5 w-1/2 rounded bg-white/40" />
            <div className="mt-4 grid gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className="h-1.5 rounded"
                  style={{
                    background: j === 0 ? `${accent}cc` : "rgba(255,255,255,0.3)",
                    width: `${[80, 65, 90, 50][j]}%`,
                  }}
                />
              ))}
            </div>
            <div
              className="absolute -bottom-8 -right-6 h-20 w-20 rounded-full opacity-60"
              style={{
                background: `radial-gradient(circle, ${accent}66, transparent 70%)`,
              }}
            />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2 text-[11px] text-white/60">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
        Chatting with Earnings_Q4.pdf · 218 pages
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <Bubble side="user">
          What were the top 3 risks called out for FY26?
        </Bubble>
        <Bubble side="ai" accent={accent}>
          1) FX volatility (pg. 142) · 2) Regulatory exposure in EU (pg. 167) ·
          3) Talent attrition in AI roles (pg. 184).
        </Bubble>
        <Bubble side="user">Export them as a slide.</Bubble>
        <Bubble side="ai" accent={accent}>
          Done. → Risks_FY26.pptx
        </Bubble>
      </div>
    </div>
  );
}

function Bubble({
  side,
  accent,
  children,
}: {
  side: "user" | "ai";
  accent?: string;
  children: React.ReactNode;
}) {
  const isUser = side === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed ring-1 ${
          isUser
            ? "bg-white/10 text-white/85 ring-white/10"
            : "text-white/90 ring-white/10"
        }`}
        style={
          !isUser
            ? {
                background: `linear-gradient(135deg, ${accent}1a, transparent)`,
                boxShadow: `inset 0 0 0 1px ${accent}33`,
              }
            : {}
        }
      >
        {children}
      </div>
    </div>
  );
}
