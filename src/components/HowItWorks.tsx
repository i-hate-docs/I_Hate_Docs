"use client";

import { motion } from "framer-motion";
import { SplitText } from "./SplitText";

const STEPS = [
  {
    n: "01",
    title: "Drop your doc.",
    blurb:
      "PDF, scan, contract, deck, report — drag it in or paste a prompt.",
    accent: "#FFD400",
  },
  {
    n: "02",
    title: "Pick a duck.",
    blurb:
      "Editor, slide generator, doc chat, or batch. Pick the tool, the duck does the rest.",
    accent: "#00E5FF",
  },
  {
    n: "03",
    title: "Ship it.",
    blurb:
      "Download, sign, share, or export. Everything is on-brand and audit-ready.",
    accent: "#B026FF",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-obsidian py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-white/40">
            How it works
          </div>
          <SplitText
            as="h2"
            text="Three clicks. One duck. Zero pain."
            by="word"
            className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl"
          />
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                ease: [0.2, 0.8, 0.2, 1],
                delay: i * 0.08,
              }}
              className="relative overflow-hidden rounded-3xl glass-strong p-7"
              style={{
                boxShadow: `0 30px 60px -50px ${s.accent}33, inset 0 1px 0 0 rgba(255,255,255,0.06)`,
              }}
            >
              <div
                className="absolute right-5 top-5 text-[11px] uppercase tracking-[0.28em]"
                style={{ color: s.accent }}
              >
                {s.n}
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {s.blurb}
              </p>
              <div
                className="mt-6 h-px w-12"
                style={{
                  background: `linear-gradient(90deg, ${s.accent}, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
