import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { UpgradeButton } from "@/components/dashboard/UpgradeButton";

export const metadata: Metadata = {
  title: "Dashboard — I Hate Docs",
};

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
        {/* Header */}
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
              Pick a tool below to start.
            </p>
          </div>
          <SignOutButton />
        </div>

        {/* Tool cards — client component handles coming-soon modals */}
        <DashboardCards />

        {/* Plan banner */}
        <div className="mt-8 rounded-3xl glass p-6 sm:p-8">
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
            <UpgradeButton />
          </div>
        </div>
      </div>
    </section>
  );
}
