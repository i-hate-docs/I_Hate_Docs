"use client";

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { DuckLogo } from "./DuckLogo";
import { MagneticButton } from "./MagneticButton";
import { SplitText } from "./SplitText";

// ── Footer link columns ───────────────────────────────────────────────────────

const cols: Array<{ title: string; links: string[] }> = [
  { title: "Product",   links: ["AI PDF Editor", "AI Slide Generator", "Doc Chat", "Templates"] },
  { title: "Company",   links: ["About", "Manifesto", "Careers", "Press"] },
  { title: "Resources", links: ["Docs", "Changelog", "Status", "Security"] },
  { title: "Legal",     links: ["Privacy", "Terms", "DPA", "Cookies"] },
];

const MESSAGES = [
  "Still building this, duck! 🚧",
  "Our ducks are on it. 🦆",
  "Coming soon™ — quack!",
  "Not yet, but soon. We promise.",
  "The duck is still writing code.",
  "🚧 Under quackstruction.",
];

const CONFETTI_COLORS = [
  "#FFD400", "#00E5FF", "#B026FF",
  "#FF2FD0", "#FF8A00", "#ffffff",
  "#39FF14", "#FF4D4D",
];

// ── Burst effect (portal) ─────────────────────────────────────────────────────

interface BurstProps {
  id: number;
  x: number;
  y: number;
  onDone: (id: number) => void;
}

function BurstEffect({ id, x, y, onDone }: BurstProps) {
  const message = useMemo(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    [],
  );

  // Confetti pieces
  const confetti = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 70 + Math.random() * 110;
      return {
        id: i,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 10,
        rot: Math.random() * 720 - 360,
        dur: 0.75 + Math.random() * 0.55,
        delay: Math.random() * 0.12,
      };
    }), []);

  // Ducks
  const ducks = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const spread = ((i / 5) - 0.5) * 160;
      return {
        id: i,
        dx: spread,
        jumpH: 120 + Math.random() * 80,
        fallY: 260 + Math.random() * 80,
        size: 18 + Math.random() * 14,
        dur: 1.3 + Math.random() * 0.4,
        delay: 0.04 * i + Math.random() * 0.08,
        flip: Math.random() > 0.5,
      };
    }), []);

  useEffect(() => {
    const t = setTimeout(() => onDone(id), 2200);
    return () => clearTimeout(t);
  }, [id, onDone]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 9998 }}>

      {/* ── Message bubble ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.75, y: -12 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        style={{
          position: "fixed",
          left: x,
          top: y - 52,
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: "linear-gradient(135deg,rgba(20,12,32,0.97),rgba(10,10,15,0.99))",
          border: "1px solid rgba(176,38,255,0.45)",
          boxShadow: "0 0 40px rgba(176,38,255,0.25), 0 8px 32px rgba(0,0,0,0.5)",
        }}
        className="whitespace-nowrap rounded-2xl px-4 py-2 text-[13px] font-semibold text-white"
        aria-live="polite"
      >
        {message}
        {/* Tail */}
        <span
          className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
          style={{ background: "rgba(20,12,32,0.97)", border: "1px solid rgba(176,38,255,0.45)", borderTop: "none", borderLeft: "none" }}
          aria-hidden
        />
      </motion.div>

      {/* ── Confetti ── */}
      {confetti.map((p) => (
        <motion.div
          key={`c${p.id}`}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.dx,
            y: [0, p.dy * 0.4, p.dy + 120],
            rotate: p.rot,
            scale: [1, 1, 0.4],
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "fixed",
            left: x,
            top: y,
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: 2,
            transformOrigin: "center",
            marginLeft: -p.w / 2,
            marginTop: -p.h / 2,
          }}
        />
      ))}

      {/* ── Ducks ── */}
      {ducks.map((d) => (
        <motion.div
          key={`d${d.id}`}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 1, 0],
            x: [0, d.dx * 0.4, d.dx],
            y: [0, -d.jumpH, -d.jumpH * 0.2, d.fallY],
            rotate: [0, d.flip ? -18 : 18, d.flip ? 12 : -12, 0],
          }}
          transition={{
            duration: d.dur,
            delay: d.delay,
            ease: [0.22, 1, 0.36, 1],
            opacity: { times: [0, 0.4, 0.75, 1] },
          }}
          style={{
            position: "fixed",
            left: x,
            top: y,
            fontSize: d.size,
            lineHeight: 1,
            marginLeft: -d.size / 2,
            marginTop: -d.size / 2,
            userSelect: "none",
            transform: d.flip ? "scaleX(-1)" : undefined,
          }}
        >
          🦆
        </motion.div>
      ))}

    </div>,
    document.body,
  );
}

// ── Footer link button ────────────────────────────────────────────────────────

interface BurstState {
  id: number;
  x: number;
  y: number;
}

let _burstId = 0;

function FooterLink({
  label,
  onBurst,
}: {
  label: string;
  onBurst: (x: number, y: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onBurst(e.clientX, e.clientY);
      }}
      className="text-left text-sm text-white/70 transition-colors hover:text-white"
    >
      {label}
    </button>
  );
}

// ── Main Footer ───────────────────────────────────────────────────────────────

export function Footer() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [bursts, setBursts] = useState<BurstState[]>([]);

  const handleBurst = useCallback((x: number, y: number) => {
    const id = _burstId++;
    setBursts((prev) => [...prev, { id, x, y }]);
  }, []);

  const handleDone = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <footer className="relative overflow-hidden bg-obsidian">

      {/* ── Active burst effects (portalled into body) ── */}
      <AnimatePresence>
        {bursts.map((b) => (
          <BurstEffect key={b.id} id={b.id} x={b.x} y={b.y} onDone={handleDone} />
        ))}
      </AnimatePresence>

      {/* ── Big CTA — hidden for signed-in users ── */}
      {!isLoggedIn && (
        <div className="relative mx-auto max-w-7xl px-6 pt-28">
          <div className="relative overflow-hidden rounded-[32px] glass-strong p-10 sm:p-16">
            <div
              className="pointer-events-none absolute inset-0 -z-0 opacity-80"
              style={{
                background:
                  "radial-gradient(800px 400px at 80% 20%, rgba(255,212,0,0.25), transparent 60%), radial-gradient(600px 300px at 10% 90%, rgba(0,229,255,0.2), transparent 60%)",
              }}
            />
            <div className="relative grid gap-8 sm:grid-cols-[1.4fr_1fr] sm:items-end">
              <div>
                <SplitText
                  as="h2"
                  text="Ready to join the flock?"
                  by="word"
                  className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl"
                />
                <p className="mt-4 max-w-md text-sm text-white/65">
                  Free forever. No card. No quack. Just the duck doing the docs.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                <MagneticButton as="a" href="/register" variant="primary">
                  Start for Free
                  <span aria-hidden className="ml-1">→</span>
                </MagneticButton>
                <MagneticButton as="a" href="/login" variant="secondary">
                  Log in
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Link columns ── */}
      <div className={`mx-auto max-w-7xl px-6 ${isLoggedIn ? "pt-16 mt-0" : "mt-20"}`}>
        <div className="grid gap-12 md:grid-cols-[1.4fr_3fr]">
          <div>
            <div className="flex items-center gap-2">
              <DuckLogo className="h-8 w-8" />
              <span className="font-display text-lg font-semibold tracking-tight text-white">
                I Hate <span className="text-cyber">Docs</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/55">
              We Love Ducks, just not the Docs. Made with too much caffeine in a
              very small pond.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-white/40">
                  {c.title}
                </div>
                <ul className="flex flex-col gap-2">
                  {c.links.map((l) => (
                    <li key={l}>
                      <FooterLink label={l} onBurst={handleBurst} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/[0.06] py-8 sm:flex-row">
          <div className="text-xs text-white/40">
            © {new Date().getFullYear()} I Hate Docs, Inc. All ducks reserved.
          </div>
          <div className="text-xs text-white/40">
            Built with too much GSAP, Lenis, and a real duck.
          </div>
        </div>
      </div>

      {/* ── Easter-egg duck ── */}
      <EasterEggDuck />
    </footer>
  );
}

// ── Easter egg duck (unchanged) ───────────────────────────────────────────────

function EasterEggDuck() {
  const [quack, setQuack] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const phrases = [
    "Quack!",
    "Quack quack!",
    "Honk?",
    "🦆",
    "Beep beep, I'm a duck.",
    "*quietly judging your docs*",
  ];

  const playQuack = () => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;

    const syllable = (start: number, base: number, dur: number, peak: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(base * 2.4, start);
      osc.frequency.exponentialRampToValueAtTime(base, start + dur * 0.45);
      osc.frequency.exponentialRampToValueAtTime(base * 0.55, start + dur);

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(950, start);
      filter.frequency.linearRampToValueAtTime(550, start + dur);
      filter.Q.value = 4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(peak, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.04);
    };

    syllable(now, 360, 0.16, 0.22);
    syllable(now + 0.13, 300, 0.22, 0.18);
  };

  const onClick = () => {
    const word = phrases[Math.floor(Math.random() * phrases.length)];
    setQuack(word);
    playQuack();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setQuack(null), 1500);
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40">
      <div className="pointer-events-auto relative">
        <AnimatePresence>
          {quack && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-[78px] right-0 origin-bottom-right whitespace-nowrap rounded-2xl bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-glow"
              style={{ filter: "drop-shadow(0 8px 20px rgba(255,212,0,0.4))" }}
            >
              {quack}
              <span
                className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-white"
                aria-hidden
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          aria-label="Scroll to top"
          onClick={onClick}
          data-cursor="duck"
          className="group relative grid h-16 w-16 place-items-center rounded-full bg-duck-gradient shadow-glow ring-2 ring-cyber/40 transition-transform hover:scale-105 active:scale-95"
        >
          <DuckLogo className="h-10 w-10 transition-transform duration-500 group-hover:rotate-[-8deg]" />
          <span className="pointer-events-none absolute inset-0 rounded-full">
            <span className="absolute inset-0 animate-pulseGlow rounded-full bg-cyber/15" />
          </span>
        </button>
      </div>
    </div>
  );
}
