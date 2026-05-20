"use client";

const items = [
  "Quack-tested",
  "AI-powered",
  "Lawyer-approved",
  "Designer-loved",
  "Boring-doc-allergic",
  "Slide-friendly",
  "Pond-native",
  "Caffeine-fueled",
];

export function Marquee() {
  return (
    <section
      aria-hidden
      className="relative -mt-px overflow-hidden border-y border-white/[0.06] bg-obsidian py-6"
    >
      <div className="flex animate-[scroll_30s_linear_infinite] gap-12 whitespace-nowrap text-xs uppercase tracking-[0.28em] text-white/40">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            <span>{t}</span>
            <span className="h-1 w-1 rounded-full bg-cyber" />
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
}
