"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DuckLogo } from "./DuckLogo";
import { MagneticButton } from "./MagneticButton";
import { SplitText } from "./SplitText";

const cols: Array<{ title: string; links: string[] }> = [
  { title: "Product", links: ["AI PDF Editor", "AI Slide Generator", "Doc Chat", "Templates"] },
  { title: "Company", links: ["About", "Manifesto", "Careers", "Press"] },
  { title: "Resources", links: ["Docs", "Changelog", "Status", "Security"] },
  { title: "Legal", links: ["Privacy", "Terms", "DPA", "Cookies"] },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-obsidian">
      {/* big CTA */}
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
              <MagneticButton as="a" href="#signup" variant="primary">
                Start for Free
                <span aria-hidden className="ml-1">→</span>
              </MagneticButton>
              <MagneticButton as="a" href="#contact" variant="secondary">
                Book a demo
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* link columns */}
      <div className="mx-auto mt-20 max-w-7xl px-6">
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
                      <a
                        href="#"
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {l}
                      </a>
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

      {/* easter-egg duck */}
      <EasterEggDuck />
    </footer>
  );
}

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

    // Two short "quack" syllables with a sweeping sawtooth + bandpass
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
          {/* ripple */}
          <span className="pointer-events-none absolute inset-0 rounded-full">
            <span className="absolute inset-0 animate-pulseGlow rounded-full bg-cyber/15" />
          </span>
        </button>
      </div>
    </div>
  );
}
