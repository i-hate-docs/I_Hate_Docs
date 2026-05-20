"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "./MagneticButton";
import { SplitText } from "./SplitText";

const DuckScene = dynamic(
  () => import("./DuckScene").then((m) => m.DuckScene),
  { ssr: false },
);

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      // pointer-driven spotlight
      const onMove = (e: MouseEvent) => {
        if (!sectionRef.current) return;
        const r = sectionRef.current.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        sectionRef.current.style.setProperty("--mx", `${mx}%`);
        sectionRef.current.style.setProperty("--my", `${my}%`);
      };
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-obsidian"
    >
      {/* background layers */}
      <div
        ref={bgRef}
        className="absolute inset-0 -z-10 bg-grid-faint opacity-[0.5]"
        style={{ backgroundSize: "44px 44px" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-spot" />
      <div
        className="pointer-events-none absolute inset-x-0 -z-10 top-0 h-64"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,212,0,0.10), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72"
        style={{
          background:
            "linear-gradient(0deg, #0a0a0a 10%, transparent 100%)",
        }}
      />
      <div className="noise -z-10" />

      {/* 3D scene — right half only */}
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-0 hidden w-[55vw] md:block">
        <DuckScene />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-24 pt-36 md:flex-row md:items-center md:pt-44">
        <div className="flex-1 md:max-w-[640px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber animate-pulseGlow" />
            New · AI Slide Generator v2
          </div>

          <SplitText
            as="h1"
            text="Stop fighting your documents."
            by="word"
            stagger={0.08}
            duration={1.05}
            trigger="load"
            className="font-display text-5xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl md:text-[5.25rem]"
          />
          <SplitText
            as="h1"
            text="Let AI do it."
            by="word"
            stagger={0.08}
            duration={1.1}
            delay={0.25}
            trigger="load"
            className="mt-1 font-display text-5xl font-semibold italic leading-[1.04] tracking-tight text-cyber drop-shadow-[0_0_30px_rgba(255,212,0,0.35)] sm:text-6xl md:text-[5.25rem]"
          />

          <p className="mt-7 max-w-xl text-balance text-base leading-relaxed text-white/70 sm:text-lg">
            <span className="text-white">
              We Love Ducks, just not the Docs.
            </span>{" "}
            The ultimate AI-powered PDF editor and Slide Generator — edit, sign,
            merge, summarize, and turn boring documents into stunning slides in
            seconds.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton as="a" href="#pricing" variant="primary">
              Start for Free
              <span aria-hidden className="ml-1">
                →
              </span>
            </MagneticButton>
            <MagneticButton as="a" href="#features" variant="secondary">
              Explore Pro
            </MagneticButton>
            <div className="flex items-center gap-2 pl-2 text-xs text-white/50">
              <span className="flex -space-x-1.5">
                {["#FFD400", "#00E5FF", "#B026FF"].map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-full ring-2 ring-obsidian"
                    style={{ background: c }}
                  />
                ))}
              </span>
              Trusted by 38,000+ flock members
            </div>
          </div>

          <div className="mt-12 flex max-w-md items-center gap-6 text-xs text-white/50">
            <Stat value="2.4M+" label="Pages processed" />
            <Stat value="120k" label="Slides generated" />
            <Stat value="99.98%" label="Uptime" />
          </div>
        </div>

        {/* mobile-only fallback visual */}
        <div className="md:hidden">
          <div className="glass rounded-3xl p-6 text-center">
            <div className="mx-auto h-40 w-40 rounded-full bg-duck-gradient shadow-glow" />
            <p className="mt-4 text-sm text-white/70">
              Move on desktop to see the duck do its magic →
            </p>
          </div>
        </div>
      </div>

      {/* scroll hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.28em] text-white/40">
        <div className="flex flex-col items-center gap-2">
          <span>Scroll</span>
          <span className="block h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-lg font-semibold text-white">
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-white/40">
        {label}
      </div>
    </div>
  );
}
