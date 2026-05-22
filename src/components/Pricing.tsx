"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { SplitText } from "./SplitText";
import { MagneticButton } from "./MagneticButton";
import { ComingSoonModal } from "./ComingSoonModal";

type Tier = {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  blurb: string;
  features: string[];
  highlight?: boolean;
  accent: string;
  cta: string;
  comingSoon?: boolean;
};

const TIERS: Tier[] = [
  {
    id: "hatchling",
    name: "Hatchling",
    tagline: "Free forever",
    monthly: 0,
    yearly: 0,
    blurb: "For the curious. Edit, sign, and try the magic.",
    features: [
      "Basic PDF edit, sign, merge",
      "30 AI prompts / month",
      "5 slide generations / month",
      "Web app · 1 device",
    ],
    accent: "#9aa0a6",
    cta: "Start free",
  },
  {
    id: "mallard",
    name: "Mallard",
    tagline: "Most popular",
    monthly: 18,
    yearly: 14,
    blurb: "For pros who want the full duck experience.",
    features: [
      "Unlimited AI edits & summarize",
      "Unlimited slide generation",
      "Doc Chat with citations",
      "Brand kits & templates",
      "Priority models · GPU pool",
    ],
    highlight: true,
    accent: "#FFD400",
    cta: "Go Pro",
    comingSoon: true,
  },
  {
    id: "flock",
    name: "Flock",
    tagline: "Teams",
    monthly: 42,
    yearly: 34,
    blurb: "For collaborative ducks. Shared kits, API, audit.",
    features: [
      "Everything in Mallard, for the team",
      "Shared brand kits & libraries",
      "API + Zapier + Slack",
      "SSO · SCIM · Audit logs",
      "Dedicated success duck",
    ],
    accent: "#00E5FF",
    cta: "Talk to us",
    comingSoon: true,
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  const [modal, setModal] = useState<{ feature: string; description: string } | null>(null);
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const openModal = (tier: Tier) => {
    setModal({
      feature: `${tier.name} plan`,
      description: `The ${tier.name} plan is coming soon. We're polishing every feather — you'll be the first to know when it's ready.`,
    });
  };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-obsidian py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-cyber/10 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(800px 400px at 50% 0%, rgba(255,212,0,0.15), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-white/40">
            Pricing
          </div>
          <SplitText
            as="h2"
            text="Pick your pond."
            by="word"
            className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl"
          />
          <p className="mt-4 text-base text-white/65">
            Free forever for hobbyists. Paid plans for ducks who mean business.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 border-b border-white/10 pb-2">
            <BillingToggle
              active={!yearly}
              onClick={() => setYearly(false)}
              label="Monthly"
            />
            <BillingToggle
              active={yearly}
              onClick={() => setYearly(true)}
              label={
                <span className="flex items-center gap-2">
                  Yearly
                  <span className="rounded-full bg-cyber/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyber">
                    -22%
                  </span>
                </span>
              }
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <PricingCard
              key={t.id}
              tier={t}
              yearly={yearly}
              isLoggedIn={isLoggedIn}
              onComingSoon={() => openModal(t)}
            />
          ))}
        </div>

        <div className="mt-10 text-center text-xs text-white/40">
          Prices in USD · cancel anytime · no doc watermarks, ever.
        </div>
      </div>

      {/* Coming soon modal */}
      <ComingSoonModal
        show={!!modal}
        feature={modal?.feature ?? ""}
        description={modal?.description}
        onClose={() => setModal(null)}
      />
    </section>
  );
}

// ── BillingToggle ─────────────────────────────────────────────────────────────

function BillingToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-colors ${
        active ? "text-white" : "text-white/60 hover:text-white"
      }`}
    >
      {active && (
        <motion.span
          layoutId="billing-slider"
          className="absolute -bottom-2 left-0 right-0 h-[2px] bg-duck-gradient shadow-glow"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      {label}
    </button>
  );
}

// ── PricingCard ───────────────────────────────────────────────────────────────

function PricingCard({
  tier,
  yearly,
  isLoggedIn,
  onComingSoon,
}: {
  tier: Tier;
  yearly: boolean;
  isLoggedIn: boolean;
  onComingSoon: () => void;
}) {
  const price = yearly ? tier.yearly : tier.monthly;
  const isFree = price === 0;
  const isCurrentPlan = isLoggedIn && tier.id === "hatchling";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -8 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl p-7 ${
        tier.highlight ? "glass-strong" : "glass"
      }`}
      style={{
        boxShadow: tier.highlight
          ? `0 30px 60px -30px ${tier.accent}66, inset 0 0 0 1px ${tier.accent}55`
          : undefined,
      }}
    >
      {/* sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      >
        <span className="absolute -inset-y-10 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-[260%] group-hover:opacity-100" />
      </span>

      {/* Badge */}
      {tier.highlight && !isCurrentPlan && (
        <div
          className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black"
          style={{ background: tier.accent }}
        >
          Most popular
        </div>
      )}
      {isCurrentPlan && (
        <div
          className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: "rgba(154,160,166,0.15)", border: "1px solid rgba(154,160,166,0.35)", color: "#9aa0a6" }}
        >
          <span>✓</span> Current plan
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl ring-1 ring-white/10"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${tier.accent}33, transparent 70%)`,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: tier.accent, boxShadow: `0 0 14px ${tier.accent}` }}
          />
        </div>
        <div>
          <div className="font-display text-xl font-semibold text-white">{tier.name}</div>
          <div className="text-[11px] uppercase tracking-wider text-white/45">{tier.tagline}</div>
        </div>
      </div>

      <p className="mt-4 text-sm text-white/65">{tier.blurb}</p>

      {/* Price */}
      <div className="mt-6 flex items-end gap-1">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${tier.id}-${price}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-end gap-1"
          >
            <span
              className={`font-display text-5xl font-semibold ${
                yearly ? "bg-duck-gradient bg-clip-text text-transparent" : "text-white"
              }`}
            >
              ${price}
            </span>
            <span className="pb-2 text-xs text-white/45">
              {isFree ? "/forever" : yearly ? "/mo · billed yearly" : "/mo"}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Features */}
      <ul className="mt-6 flex flex-col gap-2.5 text-sm text-white/80">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: tier.accent, boxShadow: `0 0 10px ${tier.accent}` }}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-8 pt-2">
        {isCurrentPlan ? (
          /* Logged-in + free tier → "your plan" indicator, no button */
          <div
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium"
            style={{
              background: "rgba(154,160,166,0.08)",
              border: "1px solid rgba(154,160,166,0.2)",
              color: "#9aa0a6",
            }}
          >
            <span>✓</span> You&apos;re on this plan
          </div>
        ) : tier.comingSoon ? (
          /* Paid tiers → coming soon button */
          <button
            type="button"
            onClick={onComingSoon}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all"
            style={{
              background: tier.highlight ? "rgba(255,212,0,0.1)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${tier.highlight ? "rgba(255,212,0,0.35)" : "rgba(255,255,255,0.12)"}`,
              color: tier.highlight ? "#FFD400" : "rgba(255,255,255,0.7)",
            }}
          >
            <span>{tier.cta}</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
              soon
            </span>
          </button>
        ) : (
          /* Default: free tier for non-logged-in */
          <MagneticButton
            as="a"
            href="/register"
            variant={tier.highlight ? "primary" : "secondary"}
            className="w-full justify-center"
          >
            {tier.cta}
          </MagneticButton>
        )}
      </div>
    </motion.div>
  );
}
