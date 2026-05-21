import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata: Metadata = {
  title: "Dashboard — I Hate Docs",
};

const tools = [
  {
    title: "AI PDF Editor",
    blurb: "Edit, sign, merge, redact, summarize, chat.",
    accent: "#FFD400",
    href: "/features",
  },
  {
    title: "AI Slide Generator",
    blurb: "PDF or prompt → polished deck in 30s.",
    accent: "#00E5FF",
    href: "/features",
  },
  {
    title: "Doc Chat",
    blurb: "Ask any document, get cited answers.",
    accent: "#B026FF",
    href: "/features",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const name = session.user.name ?? session.user.email?.split("@")[0] ?? "Duck";

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-obsidian pb-24 pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint opacity-[0.35]" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80"
        style={{
          background:
            "radial-gradient(900px 400px at 50% 0%, rgba(255,212,0,0.18), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-white/40">
              Dashboard
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Welcome back, <span className="text-cyber">{name}</span>.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/60">
              Signed in as{" "}
              <span className="text-white/80">{session.user.email}</span>.
              Pick a tool below to start. Real document tooling lands in the
              next sprint — for now, this is your perch.
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className="group relative overflow-hidden rounded-3xl glass-strong p-6 transition-transform hover:-translate-y-1"
              style={{
                boxShadow: `0 30px 80px -50px ${t.accent}55, inset 0 1px 0 0 rgba(255,255,255,0.06)`,
              }}
            >
              <div
                className="mb-4 grid h-10 w-10 place-items-center rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${t.accent}55, transparent 70%)`,
                  border: `1px solid ${t.accent}44`,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: t.accent,
                    boxShadow: `0 0 14px ${t.accent}`,
                  }}
                />
              </div>
              <h2 className="font-display text-xl font-semibold text-white">
                {t.title}
              </h2>
              <p className="mt-2 text-sm text-white/65">{t.blurb}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55 transition-colors group-hover:text-cyber">
                Open
                <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-3xl glass p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                Plan · Hatchling (free)
              </div>
              <p className="mt-2 text-sm text-white/70">
                You&apos;ve got 30 AI prompts and 5 slide generations this
                month. Upgrade to Mallard for unlimited.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full bg-cyber px-5 py-2.5 text-sm font-medium text-black shadow-glow ring-1 ring-cyber/60 transition-transform hover:scale-[1.02]"
            >
              Upgrade to Pro
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
