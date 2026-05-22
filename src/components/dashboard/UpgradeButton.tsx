"use client";

import { useState } from "react";
import { ComingSoonModal } from "@/components/ComingSoonModal";

export function UpgradeButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShow(true)}
        className="inline-flex items-center gap-2 rounded-full bg-cyber px-5 py-2.5 text-sm font-medium text-black shadow-glow ring-1 ring-cyber/60 transition-transform hover:scale-[1.02]"
      >
        Upgrade to Pro
        <span aria-hidden>→</span>
      </button>

      <ComingSoonModal
        show={show}
        feature="Mallard plan"
        description="Paid plans are coming very soon. You'll get unlimited AI edits, slide generation, Doc Chat with citations, and more. We'll quack when it's ready."
        onClose={() => setShow(false)}
      />
    </>
  );
}
