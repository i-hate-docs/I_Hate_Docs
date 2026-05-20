"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SplitText } from "./SplitText";

const items = [
  {
    q: "Wait — do you actually hate docs?",
    a: "Passionately. The hate is what fuels the product. The ducks just enjoy a steady paycheck.",
  },
  {
    q: "Is it really an AI PDF editor and slide generator?",
    a: "Yes. Edit, sign, merge, redact, summarize, chat with, and turn any PDF into a presentable deck — all in one app.",
  },
  {
    q: "How accurate is the AI?",
    a: "Citations are linked back to source pages so you can verify. We default to high-precision models on Pro and Teams.",
  },
  {
    q: "What about privacy?",
    a: "Your documents are encrypted in transit and at rest. Private mode disables retention entirely. SOC 2 in progress.",
  },
  {
    q: "Do I have to credit a duck?",
    a: "No, but the duck appreciates a quack on social media.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden bg-obsidian py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-white/40">
            FAQ
          </div>
          <SplitText
            as="h2"
            text="Quack-asked questions."
            by="word"
            className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl"
          />
        </div>
        <ul className="flex flex-col gap-3">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <li
                key={i}
                className={`rounded-2xl ${isOpen ? "glass-strong" : "glass"} transition-colors`}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="text-base font-medium text-white sm:text-lg">
                    {it.q}
                  </span>
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full bg-white/[0.06] text-xs transition-transform ${
                      isOpen ? "rotate-45 bg-cyber text-black" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm leading-relaxed text-white/70">
                        {it.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
