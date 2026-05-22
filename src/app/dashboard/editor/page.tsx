import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { PdfEditorWorkspace } from "@/components/pdf/PdfEditorWorkspace";

export const metadata: Metadata = {
  title: "Visual PDF Editor — I Hate Docs",
  description:
    "Drag-and-drop PDF page editor. Reorder, rotate, and delete pages, then export a clean PDF — all in your browser, no uploads, no servers.",
};

export default async function EditorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/editor");

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-obsidian pb-24 pt-28">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint opacity-[0.3]" />

      {/* Top glow — purple tint for the editor page */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96"
        style={{
          background:
            "radial-gradient(900px 420px at 50% 0%, rgba(176,38,255,0.14), transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/35">
            Dashboard / Visual PDF Editor
          </div>
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            PDF Editor
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/55">
            Drop a PDF, rearrange pages by dragging, rotate or delete any page,
            then export. Everything runs in your browser — nothing is ever
            uploaded.
          </p>
        </div>

        {/* Interactive editor — client component */}
        <PdfEditorWorkspace />
      </div>
    </section>
  );
}
