import Link from "next/link";
import { DuckLogo } from "./DuckLogo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-obsidian px-6 py-24">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint opacity-[0.35]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 0%, rgba(255,212,0,0.18), transparent 60%), radial-gradient(600px 400px at 80% 100%, rgba(0,229,255,0.14), transparent 70%)",
        }}
      />
      <div className="noise -z-10" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-sm font-semibold tracking-tight"
        >
          <DuckLogo className="h-8 w-8" />
          <span>
            <span className="text-white">I Hate</span>
            <span className="ml-1 text-cyber">Docs</span>
          </span>
        </Link>

        <div className="rounded-3xl glass-strong p-7 sm:p-9">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-white/60">{subtitle}</p>
          )}

          <div className="mt-7">{children}</div>
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-white/55">
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}
