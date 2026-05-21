"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MagneticButton } from "./MagneticButton";
import { DuckLogo } from "./DuckLogo";

const links: Array<{ label: string; href: string }> = [
  { label: "Features", href: "/features" },
  { label: "Duck vs Doc", href: "/duck-vs-doc" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-500 ${
        scrolled ? "pt-3" : "pt-6"
      }`}
    >
      <nav
        className={`flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-500 ${
          scrolled
            ? "glass-strong shadow-[0_8px_40px_-20px_rgba(0,0,0,0.8)]"
            : "glass"
        }`}
        style={{ minWidth: "min(720px, 92vw)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-semibold tracking-tight"
        >
          <DuckLogo className="h-7 w-7" />
          <span className="hidden sm:inline">
            <span className="text-white">I Hate</span>
            <span className="ml-1 text-cyber">Docs</span>
          </span>
        </Link>
        <div className="ml-2 hidden flex-1 items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                isActive(l.href)
                  ? "bg-white/[0.08] text-white"
                  : "text-white/70 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className={`hidden rounded-full px-3 py-1.5 text-sm transition-colors sm:inline-block ${
              isActive("/login")
                ? "bg-white/[0.08] text-white"
                : "text-white/70 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            Log in
          </Link>
          <MagneticButton
            as="a"
            href="/register"
            variant="primary"
            className="!px-4 !py-2 text-xs"
            strength={0.25}
          >
            Start free
          </MagneticButton>
        </div>
      </nav>
    </header>
  );
}
