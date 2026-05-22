import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ToolsGrid } from "@/components/pdf/ToolsGrid";

export const metadata: Metadata = {
  title: "PDF Tools — I Hate Docs",
  description:
    "Merge, split, compress, convert, watermark and more — all in your browser, no uploads.",
};

export default async function ToolsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/tools");

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-obsidian pb-28 pt-32">
      {/* ── Background layers ── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Purple radial for this page — differentiates it from dashboard yellow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 0%, rgba(176,38,255,0.14), transparent 65%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 -z-10 h-80 w-80 translate-x-1/2 translate-y-1/2"
        style={{
          background:
            "radial-gradient(600px 600px at center, rgba(0,229,255,0.08), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        {/* ── Breadcrumb ── */}
        <nav className="mb-10 flex items-center gap-2 text-xs text-white/35" aria-label="Breadcrumb">
          <Link href="/dashboard" className="transition-colors hover:text-white/70">
            Dashboard
          </Link>
          <span aria-hidden>/</span>
          <span className="text-white/60">PDF Tools</span>
        </nav>

        {/* ── Page header ── */}
        <div className="mb-12 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Eyebrow */}
            <div className="mb-2 flex items-center gap-2.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: "#B026FF",
                  boxShadow: "0 0 12px rgba(176,38,255,0.9)",
                }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/35">
                Browser-native · pdf-lib
              </span>
            </div>

            <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              PDF{" "}
              <span
                style={{
                  background: "linear-gradient(110deg, #B026FF 0%, #00E5FF 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Toolbox
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/55">
              Every PDF operation you could ever need — merge, split, compress, convert,
              watermark, OCR and more. Select a tool below to get started.
            </p>
          </div>

          {/* Quick stats pill */}
          <div
            className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="text-center">
              <p className="font-display text-xl font-semibold text-white">16</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">Tools</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-display text-xl font-semibold text-white">5</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">
                Categories
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-display text-xl font-semibold text-white">50</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">
                MB limit
              </p>
            </div>
          </div>
        </div>

        {/* ── Tools grid (client component — handles filter state) ── */}
        <ToolsGrid />
      </div>
    </section>
  );
}
