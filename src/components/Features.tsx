"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
      "Step by step e-signature flow",
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
      "Multi doc cross referencing",
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
    <div>
      <section
        id="features"
        ref={wrapRef}
        className="relative overflow-hidden bg-obsidian"
      >
        <div className="mx-auto max-w-7xl px-6 pb-3 pt-28 md:pb-4 md:pt-32">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:gap-12">
            <div className="max-w-2xl">
              <div className="mb-2 text-xs uppercase tracking-[0.28em] text-white/40">
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

        <div className="relative h-[62svh] md:h-[66svh]">
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
              <Link
                href="/pricing"
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-cyber px-5 py-3 text-sm font-medium text-black shadow-glow transition-transform hover:scale-[1.02]"
              >
                See pricing
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
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
    return <InteractiveEditor accent={accent} />;
  }
  if (kind === "slides") {
    return <SlidesPreview accent={accent} />;
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

/* ─── Interactive Editor Demo ─── */
function InteractiveEditor({ accent }: { accent: string }) {
  const [activeTab, setActiveTab] = useState("Edit");
  const [editText, setEditText] = useState(
    "This Services Agreement is entered into as of January 15, 2025, by and between TechFlow Inc. and DataBridge Solutions LLC for the purpose of software development services including backend API development, database optimization, and cloud infrastructure setup."
  );
  const [aiResult, setAiResult] = useState("");
  const [processing, setProcessing] = useState(false);

  const tabs = ["Edit", "Sign", "OCR", "AI Rewrite"];

  const handleAiRewrite = () => {
    if (processing || !editText.trim()) return;
    setProcessing(true);
    setAiResult("");
    const simplified = "TechFlow Inc. hired DataBridge Solutions to build backend APIs, optimize databases, and set up cloud infrastructure. Contract started January 15, 2025.";
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setAiResult(simplified.slice(0, i));
      if (i >= simplified.length) {
        clearInterval(interval);
        setProcessing(false);
      }
    }, 12);
  };

  return (
    <div className="absolute inset-0 grid grid-cols-[auto_1fr] gap-0 overflow-hidden">
      {/* sidebar */}
      <div className="flex flex-col gap-0.5 border-r border-white/5 bg-black/40 px-1.5 py-3 w-[72px]">
        {tabs.map((s) => (
          <button
            key={s}
            onClick={() => { setActiveTab(s); setAiResult(""); }}
            className="rounded-md px-1.5 py-2 text-[10px] text-white/70 hover:bg-white/5 transition-colors text-center leading-tight"
            style={
              activeTab === s ? { color: accent, background: `${accent}15` } : {}
            }
          >
            {s}
          </button>
        ))}
      </div>
      {/* main area */}
      <div className="relative flex flex-col overflow-hidden bg-white/[0.03] p-3">
        {/* top bar */}
        <div className="flex items-center gap-1.5 mb-2 shrink-0">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="ml-2 text-[9px] uppercase tracking-wider text-white/40">
            {activeTab === "Sign" ? "NDA_Final.pdf" : activeTab === "OCR" ? "Scanned_Receipt.pdf" : "Contract_v3.pdf"}
          </span>
        </div>

        {activeTab === "Edit" && (
          <div className="flex flex-col gap-2 grow min-h-0">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="grow rounded-lg bg-white/90 p-3 text-[11px] leading-relaxed text-black/80 resize-none focus:outline-none focus:ring-1 min-h-0"
              style={{ focusRingColor: accent } as React.CSSProperties}
              placeholder="Type or paste your document text here..."
            />
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] text-white/40">{editText.length} characters</span>
            </div>
          </div>
        )}

        {activeTab === "Sign" && (
          <div className="flex flex-col items-center justify-center grow gap-3 min-h-0">
            <div className="rounded-xl bg-white/90 p-4 w-full max-w-[240px]">
              <div className="text-[10px] text-black/50 uppercase tracking-wider mb-2">Signature field</div>
              <div className="h-12 rounded-lg border-2 border-dashed border-black/20 flex items-center justify-center">
                <span className="text-[10px] text-black/40 italic">Click to sign here</span>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-[9px] text-black/60">2 of 3 fields signed</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "OCR" && (
          <div className="flex flex-col gap-2 grow min-h-0">
            <div className="rounded-lg bg-black/20 p-3 ring-1 ring-white/10">
              <div className="text-[9px] text-white/40 uppercase tracking-wider mb-2">Scanned image → extracted text</div>
              <div className="space-y-1.5 text-[11px] text-white/80">
                <div className="flex justify-between"><span className="text-white/50">Vendor:</span><span>Acme Corp</span></div>
                <div className="flex justify-between"><span className="text-white/50">Date:</span><span>03/15/2025</span></div>
                <div className="flex justify-between"><span className="text-white/50">Total:</span><span className="font-semibold" style={{color: accent}}>$142.87</span></div>
                <div className="flex justify-between"><span className="text-white/50">Tax:</span><span>$12.44</span></div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[9px]" style={{color: accent}}>
              <span className="h-1.5 w-1.5 rounded-full" style={{background: accent}} />
              OCR confidence: 98.2%
            </div>
          </div>
        )}

        {activeTab === "AI Rewrite" && (
          <div className="flex flex-col gap-2 grow min-h-0">
            <div className="rounded-lg bg-black/20 p-2.5 ring-1 ring-white/10 shrink-0">
              <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Original</div>
              <div className="text-[10px] text-white/60 leading-relaxed">{editText.slice(0, 120)}...</div>
            </div>
            {aiResult && (
              <div className="rounded-lg p-2.5 ring-1 shrink-0" style={{background: `${accent}08`, borderColor: `${accent}33`}}>
                <div className="text-[9px] uppercase tracking-wider mb-1" style={{color: accent}}>AI Rewrite</div>
                <div className="text-[10px] text-white/85 leading-relaxed">{aiResult}{processing && <span className="animate-pulse">|</span>}</div>
              </div>
            )}
            <button
              onClick={handleAiRewrite}
              disabled={processing}
              className="mt-auto shrink-0 self-start rounded-full px-3 py-1.5 text-[10px] font-medium text-black transition-transform hover:scale-105 disabled:opacity-50"
              style={{ background: accent }}
            >
              {processing ? "Rewriting..." : "✨ Rewrite with AI"}
            </button>
          </div>
        )}

        <div
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accent}, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
}

/* ─── Slides Preview ─── */
function SlidesPreview({ accent }: { accent: string }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      title: "Q4 2025 Revenue Report",
      subtitle: "TechFlow Inc. · Confidential",
      items: [
        { label: "Total Revenue", value: "$4.2M", change: "+18%" },
        { label: "New Clients", value: "42", change: "+31%" },
        { label: "Retention Rate", value: "94.7%", change: "+2.1%" },
      ],
    },
    {
      title: "Key Highlights",
      subtitle: "What went well this quarter",
      items: [
        { label: "AI Adoption", value: "3x", change: "growth" },
        { label: "Churn Rate", value: "2.1%", change: "down" },
        { label: "NPS Score", value: "72", change: "+8 pts" },
      ],
    },
    {
      title: "2026 Roadmap",
      subtitle: "Next steps and priorities",
      items: [
        { label: "Expand", value: "APAC", change: "Q1" },
        { label: "Launch", value: "v3 Beta", change: "Q2" },
        { label: "Hire", value: "12 eng", change: "Q1-Q2" },
      ],
    },
  ];

  const current = slides[activeSlide];

  return (
    <div className="absolute inset-0 grid grid-cols-[60px_1fr] gap-0 overflow-hidden">
      {/* slide thumbnails */}
      <div className="flex flex-col gap-2 border-r border-white/5 bg-black/30 p-2">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`relative rounded-lg p-1.5 transition-all ring-1 ${
              i === activeSlide
                ? "ring-white/30 bg-white/10"
                : "ring-white/5 bg-white/[0.02] hover:bg-white/5"
            }`}
          >
            <div className="h-1 w-full rounded-full mb-1" style={{ background: i === activeSlide ? accent : `${accent}44` }} />
            <div className="h-1 w-3/4 rounded-full bg-white/30 mb-0.5" />
            <div className="h-0.5 w-1/2 rounded-full bg-white/20" />
            <div className="absolute bottom-0.5 right-1 text-[7px] text-white/30">{i + 1}</div>
          </button>
        ))}
      </div>

      {/* main slide */}
      <div className="relative flex flex-col p-4 overflow-hidden">
        <div className="h-1 w-full rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />
        <div className="text-[13px] font-semibold text-white/90">{current.title}</div>
        <div className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">{current.subtitle}</div>

        <div className="mt-4 grid grid-cols-3 gap-2 grow">
          {current.items.map((item, j) => (
            <div key={j} className="flex flex-col items-center justify-center rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/[0.06]">
              <div className="text-[9px] text-white/40 uppercase tracking-wider">{item.label}</div>
              <div className="text-lg font-bold text-white mt-1" style={{ textShadow: `0 0 20px ${accent}44` }}>{item.value}</div>
              <div className="text-[9px] font-medium mt-0.5" style={{ color: accent }}>{item.change}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 shrink-0">
          <div className="text-[8px] text-white/30">Generated from Earnings_Q4.pdf</div>
          <div className="flex items-center gap-1">
            {slides.map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full" style={{ background: i === activeSlide ? accent : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>

        <div
          className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accent}66, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
}
