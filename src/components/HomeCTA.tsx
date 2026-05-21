import Link from "next/link";
import { MagneticButton } from "./MagneticButton";
import { SplitText } from "./SplitText";

export function HomeCTA() {
  return (
    <section className="relative overflow-hidden bg-obsidian py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[32px] glass-strong p-10 sm:p-16">
          <div
            className="pointer-events-none absolute inset-0 -z-0 opacity-80"
            style={{
              background:
                "radial-gradient(800px 400px at 80% 20%, rgba(255,212,0,0.22), transparent 60%), radial-gradient(600px 300px at 10% 90%, rgba(0,229,255,0.18), transparent 60%)",
            }}
          />
          <div className="relative grid gap-8 sm:grid-cols-[1.4fr_1fr] sm:items-end">
            <div>
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-white/40">
                Try it free
              </div>
              <SplitText
                as="h2"
                text="Stop fighting your documents."
                by="word"
                className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl"
              />
              <p className="mt-4 max-w-md text-sm text-white/65">
                Free forever for hobbyists. Pro plans for ducks who mean
                business. No card. No quack. Just the duck doing the docs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:justify-end">
              <MagneticButton as="a" href="/register" variant="primary">
                Start for Free
                <span aria-hidden className="ml-1">→</span>
              </MagneticButton>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full glass px-5 py-3 text-sm text-white ring-1 ring-white/10 transition-colors hover:bg-white/[0.06] hover:ring-white/25"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
