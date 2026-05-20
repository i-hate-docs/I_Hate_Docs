"use client";

import { createElement, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  by?: "char" | "word";
  delay?: number;
  duration?: number;
  stagger?: number;
  trigger?: "viewport" | "load";
  start?: string;
};

export function SplitText({
  text,
  as = "h2",
  className,
  by = "char",
  delay = 0,
  duration = 0.9,
  stagger = 0.025,
  trigger = "viewport",
  start = "top 80%",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll(
      by === "char" ? ".split-char" : ".split-word",
    );
    gsap.set(items, { yPercent: 110, opacity: 0, rotate: 2 });
    const animate = () =>
      gsap.to(items, {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        duration,
        ease: "power4.out",
        stagger,
        delay,
      });

    let st: ScrollTrigger | undefined;
    if (trigger === "load") {
      animate();
    } else {
      st = ScrollTrigger.create({
        trigger: ref.current,
        start,
        once: true,
        onEnter: animate,
      });
    }
    return () => {
      st?.kill();
    };
  }, [by, delay, duration, stagger, trigger, start]);

  const wordNodes = text.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token))
      return createElement("span", { key: `s-${i}` }, token);
    return createElement(
      "span",
      { key: `w-${i}`, className: "split-word" },
      createElement(
        "span",
        { style: { display: "inline-block", overflow: "hidden" } },
        createElement(
          "span",
          { className: "split-char", style: { display: "inline-block" } },
          token,
        ),
      ),
    );
  });

  const charNodes = text.split("").map((ch, i) => {
    if (ch === " ") return createElement("span", { key: `c-${i}` }, " ");
    return createElement(
      "span",
      {
        key: `c-${i}`,
        style: { display: "inline-block", overflow: "hidden" },
      },
      createElement("span", { className: "split-char" }, ch),
    );
  });

  return createElement(
    as,
    { ref, className },
    by === "char" ? charNodes : wordNodes,
  );
}
