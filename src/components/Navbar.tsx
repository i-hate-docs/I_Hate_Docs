"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MagneticButton } from "./MagneticButton";
import { DuckLogo } from "./DuckLogo";

const links: Array<{ label: string; href: string }> = [
  { label: "Features", href: "/features" },
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

  const isActive = (href: string) => {
    const path = href.split("#")[0];
    return path === "/" ? pathname === "/" : !!pathname?.startsWith(path);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-500 ${
        scrolled ? "pt-3" : "pt-6"
      }`}
    >
      <nav
        className={`flex items-center gap-2 rounded-full p-1.5 transition-all duration-500 ${
          scrolled
            ? "bg-black/60 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.8)]"
            : "bg-black/20 backdrop-blur-md ring-1 ring-white/5"
        }`}
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
        <div className="mx-4 hidden items-center gap-1 md:flex bg-white/[0.03] rounded-full p-1 ring-1 ring-white/[0.05]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                isActive(l.href)
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5 pl-2">
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
