"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: "button" | "a";
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  strength?: number;
  className?: string;
  children: React.ReactNode;
};

export function MagneticButton({
  as = "button",
  href,
  variant = "primary",
  strength = 0.35,
  className = "",
  children,
  ...rest
}: Props) {
  const rootRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.6,
        ease: "power3.out",
      });
      if (labelRef.current) {
        gsap.to(labelRef.current, {
          x: x * strength * 0.6,
          y: y * strength * 0.6,
          duration: 0.6,
          ease: "power3.out",
        });
      }
    };
    const onLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.4)",
      });
      if (labelRef.current) {
        gsap.to(labelRef.current, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.4)",
        });
      }
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  const base =
    "group relative inline-flex select-none items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors will-change-transform";
  const variants: Record<string, string> = {
    primary:
      "bg-cyber text-black shadow-glow hover:bg-cyber-300 ring-1 ring-cyber/60",
    secondary:
      "glass text-white hover:bg-white/[0.06] ring-1 ring-white/10 hover:ring-white/25",
    ghost: "text-white/80 hover:text-white",
  };

  const content = (
    <>
      <span
        ref={labelRef}
        className="relative z-10 flex items-center gap-2"
      >
        {children}
      </span>
      {/* hover sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        <span className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-shimmer" />
      </span>
    </>
  );

  if (as === "a") {
    return (
      <a
        href={href}
        ref={rootRef as React.MutableRefObject<HTMLAnchorElement | null>}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={rootRef as React.MutableRefObject<HTMLButtonElement | null>}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {content}
    </button>
  );
}
