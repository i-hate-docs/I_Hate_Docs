"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export function OAuthAlert({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: -20, scale: 0.9, x: "-50%" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-8 left-1/2 z-[100] flex w-max max-w-[90vw] items-center gap-3 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-md"
        >
          <span className="text-xl leading-none">🦆</span>
          <span>Google OAuth coming soon!</span>
          <button
            onClick={onClose}
            className="ml-2 rounded-full p-1 text-red-400/50 transition-colors hover:bg-red-500/20 hover:text-red-400"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
