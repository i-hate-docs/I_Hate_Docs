"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  show: boolean;
  feature: string;
  description?: string;
  onClose: () => void;
}

/**
 * ComingSoonModal
 * ───────────────
 * Renders into document.body via a portal so it's never trapped inside
 * a transformed parent (Lenis, GSAP, etc.).
 *
 * Centering is done by a non-animated flex wrapper — this keeps Framer
 * Motion's y-animation from fighting the CSS -translate-* trick.
 */
export function ComingSoonModal({ show, feature, description, onClose }: Props) {
  // Escape key
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [show, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            aria-hidden
          />

          {/* ── Centering shell (non-animated, uses flexbox) ── */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            {/* ── Card (animated, no position transforms) ── */}
            <motion.div
              key="card"
              role="dialog"
              aria-modal
              aria-label={`${feature} — coming soon`}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="w-full max-w-[360px] rounded-3xl p-8 text-center"
              style={{
                background:
                  "linear-gradient(145deg, rgba(22,14,36,0.97) 0%, rgba(10,10,15,0.99) 100%)",
                border: "1px solid rgba(176,38,255,0.35)",
                boxShadow:
                  "0 0 90px rgba(176,38,255,0.18), 0 40px 80px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Icon */}
              <div
                className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl text-3xl"
                style={{
                  background: "rgba(176,38,255,0.1)",
                  border: "1px solid rgba(176,38,255,0.3)",
                }}
              >
                🚧
              </div>

              {/* Text */}
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-neon-purple/70">
                Coming Soon
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-white">
                {feature}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {description ??
                  "We're building this right now. We'll quack when it's ready."}
              </p>

              {/* Close button */}
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-full py-2.5 text-sm font-semibold text-neon-purple ring-1 ring-neon-purple/30 transition-all hover:bg-neon-purple/10 hover:ring-neon-purple/50"
              >
                Got it, duck. ✓
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
