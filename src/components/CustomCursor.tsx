"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const pointerFine = window.matchMedia("(pointer: fine)");
    if (!pointerFine.matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
    };

    const onEnterInteractive = (e: Event) => {
      const t = e.target as HTMLElement;
      if (
        t.closest(
          "a, button, [role='button'], [data-cursor='duck'], input, textarea, select",
        )
      ) {
        setHover(true);
      }
    };
    const onLeaveInteractive = () => setHover(false);
    const onLeaveWindow = () => setVisible(false);
    const onEnterWindow = () => setVisible(true);

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onEnterInteractive);
    window.addEventListener("mouseout", onLeaveInteractive);
    window.addEventListener("mouseleave", onLeaveWindow);
    window.addEventListener("mouseenter", onEnterWindow);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onEnterInteractive);
      window.removeEventListener("mouseout", onLeaveInteractive);
      window.removeEventListener("mouseleave", onLeaveWindow);
      window.removeEventListener("mouseenter", onEnterWindow);
    };
  }, [visible]);

  if (reduceMotion) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden md:block"
        style={{
          width: hover ? 64 : 38,
          height: hover ? 64 : 38,
          transition:
            "width 280ms cubic-bezier(.2,.8,.2,1), height 280ms cubic-bezier(.2,.8,.2,1), opacity 200ms",
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="relative h-full w-full rounded-full"
          style={{
            border: "1px solid rgba(255,212,0,0.55)",
            boxShadow: hover
              ? "0 0 30px rgba(255,212,0,0.45), inset 0 0 18px rgba(255,212,0,0.25)"
              : "0 0 14px rgba(255,212,0,0.2)",
            background: hover
              ? "radial-gradient(closest-side, rgba(255,212,0,0.18), transparent 70%)"
              : "transparent",
          }}
        >
          {/* Duck footprint when hovered */}
          {hover && (
            <svg
              viewBox="0 0 64 64"
              className="absolute inset-0 m-auto h-7 w-7"
              style={{ color: "#FFD400" }}
              fill="currentColor"
              aria-hidden
            >
              {/* webbed duck footprint */}
              <path d="M32 8c-3 0-5 2.5-5 6 0 2.5 1.4 4.5 3.2 5.4-2.7 1.3-4.7 4-4.7 7.1 0 4.3 3.4 7.8 7.5 7.8s7.5-3.5 7.5-7.8c0-3.1-2-5.8-4.7-7.1 1.8-.9 3.2-2.9 3.2-5.4 0-3.5-2-6-5-6z" />
              <path d="M12 36c-2 0-3.6 1.6-3.6 3.6 0 1.7 1 3 2.3 3.5C9 44 8 45.6 8 47.4c0 2.5 2 4.6 4.5 4.6 2.4 0 4.5-2 4.5-4.6 0-1.8-1-3.4-2.6-4.3 1.3-.5 2.2-1.8 2.2-3.5 0-2-1.6-3.6-3.6-3.6z" />
              <path d="M52 36c-2 0-3.6 1.6-3.6 3.6 0 1.7 1 3 2.3 3.5-1.6.9-2.7 2.5-2.7 4.3 0 2.5 2 4.6 4.5 4.6s4.5-2 4.5-4.6c0-1.8-1-3.4-2.6-4.3 1.3-.5 2.2-1.8 2.2-3.5 0-2-1.6-3.6-3.6-3.6z" />
            </svg>
          )}
        </div>
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
        style={{
          width: 6,
          height: 6,
          background: "#FFD400",
          borderRadius: 9999,
          boxShadow: "0 0 12px rgba(255,212,0,0.8)",
          opacity: visible ? (hover ? 0 : 1) : 0,
          transition: "opacity 200ms",
        }}
      />
    </>
  );
}
