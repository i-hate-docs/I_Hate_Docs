"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({
  className = "",
  label = "Sign out",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/[0.06] hover:text-white"
      }
    >
      {label}
      <span aria-hidden>→</span>
    </button>
  );
}
