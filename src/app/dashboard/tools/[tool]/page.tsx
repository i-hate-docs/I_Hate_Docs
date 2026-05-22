import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getToolById, PDF_TOOLS } from "@/lib/pdf-tools";
import { ToolWorkspace } from "@/components/pdf/ToolWorkspace";

// ── Static params for build-time pre-rendering ────────────────────────────────
export function generateStaticParams() {
  return PDF_TOOLS.filter((t) => !t.comingSoon).map((t) => ({ tool: t.id }));
}

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool: toolId } = await params;
  const tool = getToolById(toolId);
  if (!tool) return { title: "Not Found — I Hate Docs" };
  return {
    title: `${tool.label} — I Hate Docs`,
    description: tool.description,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool: toolId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/tools/${toolId}`);
  }

  const tool = getToolById(toolId);
  if (!tool) notFound();
  if (tool.comingSoon) redirect("/dashboard/tools");

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-obsidian pb-28 pt-32">
      {/* ── Background ── */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px]"
        style={{
          background: `radial-gradient(860px 440px at 50% 0%, ${tool.accentGlow.replace("0.35", "0.18")}, transparent 65%)`,
        }}
      />

      <div className="mx-auto max-w-3xl px-6">
        {/* ── Breadcrumb ── */}
        <nav
          className="mb-10 flex items-center gap-2 text-xs text-white/35"
          aria-label="Breadcrumb"
        >
          <Link href="/dashboard" className="transition-colors hover:text-white/70">
            Dashboard
          </Link>
          <span aria-hidden>/</span>
          <Link
            href="/dashboard/tools"
            className="transition-colors hover:text-white/70"
          >
            PDF Tools
          </Link>
          <span aria-hidden>/</span>
          <span className="text-white/60">{tool.label}</span>
        </nav>

        {/* ── Header ── */}
        <div className="mb-10">
          {/* Accent dot + category */}
          <div className="mb-3 flex items-center gap-2.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background: tool.accent,
                boxShadow: `0 0 14px ${tool.accent}`,
              }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-white/35">
              {tool.category}
            </span>
          </div>

          <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">
            {tool.label}
          </h1>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-white/55">
            {tool.description}
          </p>
        </div>

        {/* ── Workspace (client component — owns the drop zone + state) ── */}
        <ToolWorkspace tool={tool} />

        {/* ── Tips card ── */}
        <div
          className="mt-8 rounded-2xl px-5 py-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/30">
            Tips
          </p>
          <ul className="space-y-1.5 text-[13px] text-white/45">
            {tool.multiFile ? (
              <li>Drop multiple files at once or click "+ Add more files" to queue them.</li>
            ) : (
              <li>Only the first file is used — drop a single PDF to begin.</li>
            )}
            {tool.acceptedTypes.includes("application/pdf") && (
              <li>
                Password-protected PDFs must be unlocked before processing.
              </li>
            )}
            <li>
              All processing runs locally in your browser — nothing is uploaded
              or stored anywhere.
            </li>
            <li>
              Maximum file size:{" "}
              <span className="font-mono text-white/65">50 MB</span> per file.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
