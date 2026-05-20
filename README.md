# I Hate Docs — Landing Page

> _We Love Ducks, just not the Docs._
> The ultimate AI-powered PDF editor and Slide Generator — landing page.

A premium, highly-animated SaaS landing built with **Next.js 14 (App Router) + TypeScript + Tailwind + GSAP + Lenis + Framer Motion + React Three Fiber**.

## Tech & techniques

| Concern             | Library / Technique                                                             |
| ------------------- | ------------------------------------------------------------------------------- |
| Framework           | Next.js 14, App Router, React 18, TypeScript                                    |
| Styling             | Tailwind CSS with custom design tokens (Cyber Yellow, Neon Cyan, Neon Purple)   |
| Smooth scrolling    | `@studio-freight/lenis` (synced with GSAP ticker + ScrollTrigger)               |
| Scroll animations   | `gsap` + `ScrollTrigger` (parallax, pinned horizontal scroll, stagger reveals)  |
| Component motion    | `framer-motion` (layout pills, accordion, pricing card lift)                    |
| 3D scene            | `three`, `@react-three/fiber`, `@react-three/drei` (Sparkles, Environment)      |
| Glassmorphism       | Custom `.glass` / `.glass-strong` utilities + 1px hairlines                     |
| Custom cursor       | Duck-footprint cursor with delayed ring follower & hover state                  |
| Magnetic buttons    | GSAP-driven attractor on `mousemove` with elastic return                        |
| Fonts               | `next/font` Inter (body) + Space Grotesk (display) + JetBrains Mono             |

## Page sections

1. **Hero** — full-bleed 3D glassmorphic duck (React Three Fiber) shooting an AI "laser" at a messy doc that morphs into a pristine PDF. The morph is driven by your cursor X-position. Includes magnetic primary/secondary CTAs and stagger-reveal headline.
2. **Marquee** strip — pond-tested taglines.
3. **Features** — pinned horizontal-scroll section with three feature cards (AI PDF Editor, AI Slide Generator, Doc Chat) + each one has its own faux-UI visual.
4. **Duck vs Doc** — interactive before/after slider showing a chaotic legal document on the left morphing into an AI-summarized brief on the right. Duck-footprint trail follows the slider thumb.
5. **Pricing** — three glassmorphic tiers (Hatchling / Mallard / Flock) with animated Monthly/Yearly toggle (Framer Motion `layoutId` pill) and on-hover sheen + lift.
6. **FAQ** — animated accordion.
7. **Footer** — final CTA card, link columns, and a floating **easter-egg duck** in the bottom-right corner. Click it: it quacks (random phrase bubble) and scrolls to the top.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the build
npm run lint
```

Node ≥ 20 recommended.

## File map

```
src/
├─ app/
│  ├─ layout.tsx       # fonts, metadata, mounts SmoothScroll + CustomCursor
│  ├─ page.tsx         # composes all sections
│  └─ globals.css      # tokens, glassmorphism utilities, cursor hiding
└─ components/
   ├─ SmoothScroll.tsx     # Lenis wrapper, hooked into GSAP ticker
   ├─ CustomCursor.tsx     # Duck-footprint cursor (dot + ring)
   ├─ MagneticButton.tsx   # GSAP magnetic attractor + hover sheen
   ├─ SplitText.tsx        # Stagger-reveal headline helper
   ├─ DuckLogo.tsx         # Inline SVG mascot
   ├─ Navbar.tsx           # Floating glass pill nav
   ├─ Hero.tsx             # Hero composition + parallax
   ├─ DuckScene.tsx        # 3D R3F scene (duck, laser, messy ↔ clean doc)
   ├─ Marquee.tsx          # Looping tagline marquee
   ├─ Features.tsx         # Pinned horizontal scroll section
   ├─ DuckVsDoc.tsx        # Before/after slider with duck-footprint trail
   ├─ Pricing.tsx          # Monthly/Yearly toggle + 3 glass tiers
   ├─ FAQ.tsx              # Animated accordion
   └─ Footer.tsx           # CTA + columns + easter-egg duck
```

## Tweak points

- Color tokens: `tailwind.config.ts` (`cyber`, `neon.cyan`, `neon.purple`)
- Duck materials: `DuckScene.tsx` → `MeshPhysicalMaterial` (`transmission`, `ior`, `emissive`)
- Pricing copy & tiers: `Pricing.tsx` → `TIERS` array
- Feature copy: `Features.tsx` → `FEATURES` array
- Easter-egg quack phrases: `Footer.tsx` → `phrases`

## Accessibility & perf notes

- Custom cursor is opt-out via `prefers-reduced-motion`.
- The 3D scene is dynamically imported with `ssr: false` so it never blocks the initial paint.
- Lenis is desktop-friendly and falls back gracefully on touch.
- All hover/parallax effects are gated by `(pointer: fine)` where they hide the native cursor.
