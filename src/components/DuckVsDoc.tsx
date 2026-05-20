"use client";

import { useEffect, useRef, useState } from "react";
import { SplitText } from "./SplitText";

export function DuckVsDoc() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(48);
  const draggingRef = useRef(false);
  const [tracks, setTracks] = useState<Array<{ id: number; x: number; y: number }>>(
    [],
  );
  const trackId = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const setFromClientX = (clientX: number) => {
      const rect = wrap.getBoundingClientRect();
      const next = Math.min(
        96,
        Math.max(4, ((clientX - rect.left) / rect.width) * 100),
      );
      setPct(next);
    };

    const onDown = (e: PointerEvent) => {
      draggingRef.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setFromClientX(e.clientX);
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      setFromClientX(e.clientX);
      // emit duck-footprint track
      const rect = wrap.getBoundingClientRect();
      const id = ++trackId.current;
      setTracks((t) =>
        [
          ...t,
          { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
        ].slice(-18),
      );
      setTimeout(() => {
        setTracks((t) => t.filter((p) => p.id !== id));
      }, 900);
    };
    const onUp = () => {
      draggingRef.current = false;
    };

    const handle = dragRef.current;
    handle?.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      handle?.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <section
      id="duck-vs-doc"
      className="relative overflow-hidden bg-obsidian py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start gap-3">
          <div className="text-xs uppercase tracking-[0.28em] text-white/40">
            Duck vs Doc
          </div>
          <SplitText
            as="h2"
            text="Drag. Watch chaos turn into clarity."
            by="word"
            className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl"
          />
          <p className="max-w-xl text-sm text-white/60 sm:text-base">
            On the left, a real legal clause your eyes refuse to read. On the
            right, the same content after the duck has had a quack at it.
          </p>
        </div>

        <div
          ref={wrapRef}
          className="relative aspect-[16/9] w-full select-none overflow-hidden rounded-3xl ring-1 ring-white/10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
          }}
        >
          {/* clean (right) layer */}
          <div className="absolute inset-0">
            <CleanDoc />
          </div>
          {/* messy (left) layer, clipped by pct */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${pct}%` }}
          >
            <MessyDoc />
          </div>

          {/* labels */}
          <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70 ring-1 ring-white/10">
            Before · The Doc
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-cyber/95 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-black ring-1 ring-cyber/30">
            After · The Duck
          </span>

          {/* divider */}
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{
              left: `${pct}%`,
              transform: "translateX(-1px)",
              width: "2px",
              background:
                "linear-gradient(180deg, transparent, #FFD400 20%, #FFD400 80%, transparent)",
              boxShadow: "0 0 22px rgba(255,212,0,0.55)",
            }}
          />

          {/* handle */}
          <div
            ref={dragRef}
            className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pct}%` }}
          >
            <div className="group grid h-14 w-14 cursor-grab place-items-center rounded-full bg-cyber text-black shadow-glow ring-4 ring-cyber/30 active:cursor-grabbing">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 6l-5 6 5 6M15 6l5 6-5 6" />
              </svg>
            </div>
          </div>

          {/* duck footprints */}
          {tracks.map((t) => (
            <Footprint key={t.id} x={t.x} y={t.y} />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          Tip: hold and drag the duck handle.
        </p>
      </div>
    </section>
  );
}

function MessyDoc() {
  return (
    <div className="relative h-full w-full bg-[#15151c] p-6 sm:p-10">
      <div className="absolute inset-0 noise opacity-30" />
      <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
        Exhibit A · 47 pages · scanned 2017
      </div>
      <div className="space-y-2 font-mono text-[10px] leading-[1.55] text-white/70 sm:text-[11px] md:text-xs">
        {[
          "WHEREAS, the party of the first part (hereinafter, the “Quacker”),",
          "doth covenant, agree, and otherwise affirm pursuant to §4.2(c)(iii)",
          "of that certain Master Services Agreement dated June 14, MMXVII,",
          "that all materials, including but not limited to PDFs, scans, faxes,",
          "and any successor formats not yet invented as of the Effective Date,",
          "shall be subject to a non-exclusive, royalty-free, sublicensable,",
          "fully-paid-up license to be used solely for the limited purposes",
          "set forth in Schedule 3 hereto, provided however that nothing in",
          "this clause shall be construed as a waiver of any rights under §7.1,",
          "§7.2, or any successor provisions thereto, including amendments,",
          "addenda, addendums, or duck-typed substitutes filed with the clerk…",
        ].map((line, i) => (
          <p
            key={i}
            className="origin-left"
            style={{
              transform: `rotate(${(Math.sin(i) * 0.6).toFixed(2)}deg) translateX(${(Math.cos(i) * 4).toFixed(1)}px)`,
              opacity: 0.45 + (i % 3) * 0.18,
              filter: i % 4 === 0 ? "blur(0.4px)" : "none",
            }}
          >
            {line}
          </p>
        ))}
      </div>
      {/* red marks */}
      <div className="absolute right-10 top-24 h-12 w-12 rotate-12">
        <svg viewBox="0 0 24 24" className="h-full w-full text-red-400/80">
          <path
            d="M4 4l16 16M20 4L4 20"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="absolute bottom-6 right-12 rounded bg-red-500/15 px-2 py-1 text-[10px] font-medium text-red-300 ring-1 ring-red-400/30">
        ⚠ unread for 14 months
      </div>
    </div>
  );
}

function CleanDoc() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#fafafa] to-[#efece2] p-6 text-black sm:p-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-cyber px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            Summary · AI
          </div>
          <h3 className="mt-3 text-xl font-semibold leading-tight text-black sm:text-2xl">
            Master Services Agreement — at a glance
          </h3>
        </div>
        <div className="text-right text-[10px] uppercase tracking-wider text-black/40">
          1 page · 38s read
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card title="Who" body="Quacker LLC ↔ Counterparty Inc." accent="#FFD400" />
        <Card
          title="Term"
          body="3 yrs · auto-renew unless 60-day notice"
          accent="#00C8FF"
        />
        <Card
          title="License"
          body="Non-exclusive, royalty-free, sublicensable. Scoped to Schedule 3."
          accent="#FFD400"
        />
        <Card
          title="Watch-outs"
          body="§7.1 / §7.2 carve-outs. FY26 renewal review."
          accent="#FF7A00"
        />
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-2 text-[10px] uppercase tracking-wider text-black/50">
        <span className="h-1.5 w-1.5 rounded-full bg-cyber" /> Generated by Duck
        · cited 11 sources
      </div>
    </div>
  );
}

function Card({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/10 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-black/50">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent }}
        />
        {title}
      </div>
      <div className="text-sm font-medium leading-snug text-black">{body}</div>
    </div>
  );
}

function Footprint({ x, y }: { x: number; y: number }) {
  return (
    <span
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        animation: "fpFade 900ms ease-out forwards",
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        style={{ color: "rgba(255,212,0,0.85)" }}
        fill="currentColor"
      >
        <path d="M12 3c-1.4 0-2.5 1.4-2.5 3.2 0 1 .5 2 1.2 2.5C9 9.4 8 11 8 12.5 8 14.4 9.8 16 12 16s4-1.6 4-3.5c0-1.5-1-3.1-2.7-3.8.7-.5 1.2-1.5 1.2-2.5C14.5 4.4 13.4 3 12 3z" />
        <path d="M5 16c-1.1 0-2 .9-2 2 0 .9.5 1.6 1.2 1.9C3.6 20.4 3 21.1 3 22c0 1.1.9 2 2 2s2-.9 2-2c0-.9-.6-1.6-1.2-2.1C6.5 19.6 7 18.9 7 18c0-1.1-.9-2-2-2zM19 16c-1.1 0-2 .9-2 2 0 .9.5 1.6 1.2 1.9-.6.5-1.2 1.2-1.2 2.1 0 1.1.9 2 2 2s2-.9 2-2c0-.9-.6-1.6-1.2-2.1.7-.3 1.2-1 1.2-1.9 0-1.1-.9-2-2-2z" />
      </svg>
      <style jsx>{`
        @keyframes fpFade {
          0% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
          }
          40% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1) rotate(-8deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.1) rotate(8deg);
          }
        }
      `}</style>
    </span>
  );
}
