# I Hate Docs — Multi-page SaaS app

> _We Love Ducks, just not the Docs._
> AI-powered PDF editor & Slide Generator — full-stack Next.js app with multi-page routing and email/password auth.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind + GSAP + Lenis + Framer Motion + React Three Fiber + NextAuth.js + Prisma + Postgres**.

## Tech & techniques

| Concern             | Library / Technique                                                             |
| ------------------- | ------------------------------------------------------------------------------- |
| Framework           | Next.js 14, App Router, React 18, TypeScript                                    |
| Styling             | Tailwind CSS with custom design tokens (Cyber Yellow, Neon Cyan, Neon Purple)   |
| Smooth scrolling    | `@studio-freight/lenis` (synced with GSAP ticker + ScrollTrigger)               |
| Scroll animations   | `gsap` + `ScrollTrigger` (parallax, pinned horizontal scroll, stagger reveals)  |
| Component motion    | `framer-motion` (layout pills, accordion, pricing card lift, grid stagger)      |
| 3D scene            | `three`, `@react-three/fiber`, `@react-three/drei` (Sparkles, Environment)      |
| Auth                | `next-auth` v4 (Credentials provider, JWT strategy)                             |
| ORM / DB            | `prisma` v6 + `@prisma/client` + Postgres                                       |
| Password hashing    | `bcryptjs` (12 rounds)                                                          |
| Validation          | `zod`                                                                           |
| Glassmorphism       | Custom `.glass` / `.glass-strong` utilities + 1px hairlines                     |
| Custom cursor       | Duck-footprint cursor with delayed ring follower & hover state                  |
| Magnetic buttons    | GSAP-driven attractor on `mousemove` with elastic return                        |
| Fonts               | `next/font` Inter (body) + Space Grotesk (display) + JetBrains Mono             |

## Routes

| Path             | Type           | What it does                                                                 |
| ---------------- | -------------- | ---------------------------------------------------------------------------- |
| `/`              | Static         | Landing page — Hero + structured feature grid + How-it-works + CTA           |
| `/features`      | Static         | Full pinned horizontal-scroll feature deep-dive                              |
| `/duck-vs-doc`   | Static         | Before/after slider demo with duck-footprint trail                           |
| `/pricing`       | Static         | Hatchling / Mallard / Flock with animated Monthly↔Yearly toggle              |
| `/faq`           | Static         | Animated accordion of quack-asked questions                                  |
| `/login`         | Dynamic        | Email/password sign-in (redirects to `/dashboard` if already authed)         |
| `/register`      | Dynamic        | Sign-up; auto signs in and redirects to `/dashboard`                         |
| `/dashboard`     | Dynamic, auth  | Authed-only — welcomes user by name + sign-out                               |
| `/api/auth/[...nextauth]` | Route handler | NextAuth.js endpoint                                              |
| `/api/auth/register` | Route handler | Creates a User row (bcrypt-hashed password)                            |

`src/middleware.ts` protects `/dashboard/**` — unauthenticated users get redirected to `/login?callbackUrl=...`.

## Local setup

```bash
# 1. Install deps
npm install

# 2. Set up env
cp .env.example .env
# then edit .env: set NEXTAUTH_SECRET (`openssl rand -base64 32`) and DATABASE_URL

# 3. Create DB tables
npx prisma db push

# 4. Run
npm run dev      # http://localhost:3000
npm run build    # production build (runs prisma generate first)
npm start        # serve the build
npm run lint
```

Node ≥ 20 recommended.

### Local Postgres options

- **Docker** (recommended for full parity with prod):
  ```bash
  docker run --name ihd-pg -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=ihatedocs \
    -p 5432:5432 -d postgres:16
  ```
  Then set `DATABASE_URL="postgres://postgres:devpass@localhost:5432/ihatedocs"`.

- **No Postgres?** For purely local dev you can temporarily switch `prisma/schema.prisma`'s `provider` to `"sqlite"` and `DATABASE_URL` to `"file:./dev.db"`, then `npx prisma db push`. Don't commit this — the production target is Postgres.

## Deploy to Vercel

1. Push to GitHub.
2. Create a new Vercel project from the repo.
3. Provision a Postgres database — easiest is **Vercel Postgres** (Storage tab → Create → Postgres). Alternatives: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app).
4. Add the connection string as `DATABASE_URL` in Vercel project env vars. Vercel Postgres auto-injects it.
5. Add `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and `NEXTAUTH_URL` (your production URL).
6. The `build` script runs `prisma generate && next build`. After the first deploy, run `npx prisma db push` against your production DB once (Vercel CLI: `vercel env pull && npx prisma db push`).

## Page sections (used on `/` and individual routes)

1. **Hero** — full-bleed 3D glassmorphic duck (R3F) with orbit ambience, magnetic CTAs, stagger-reveal headline.
2. **Marquee** strip — pond-tested taglines.
3. **Feature showcase grid** (landing only) — 9 tool tiles in 3 columns, LightPDF-style, each linking to `/features`.
4. **How it works** — 3-step strip (Drop · Pick · Ship).
5. **Features** — pinned horizontal-scroll section with three feature cards + faux-UI visuals (`/features`).
6. **Duck vs Doc** — interactive before/after slider with footprint trail (`/duck-vs-doc`).
7. **Pricing** — three glass tiers with Monthly/Yearly toggle (`/pricing`).
8. **FAQ** — animated accordion (`/faq`).
9. **Footer** — global CTA + columns + floating easter-egg duck (random quack phrase, audible WebAudio quack, smooth-scroll to top).

## File map

```
prisma/
└─ schema.prisma             # User model (Postgres)

src/
├─ app/
│  ├─ layout.tsx             # Fonts, Navbar, Footer, SmoothScroll, SessionProvider, CustomCursor
│  ├─ page.tsx               # Landing (Hero + grid + how-it-works + CTA)
│  ├─ globals.css            # Tokens, glassmorphism utilities, cursor hiding
│  ├─ features/page.tsx
│  ├─ duck-vs-doc/page.tsx
│  ├─ pricing/page.tsx
│  ├─ faq/page.tsx
│  ├─ login/page.tsx
│  ├─ register/page.tsx
│  ├─ dashboard/page.tsx     # Protected (also enforced by middleware)
│  └─ api/auth/
│     ├─ [...nextauth]/route.ts
│     └─ register/route.ts
├─ components/
│  ├─ Navbar.tsx             # next/link routing, active state per pathname
│  ├─ Hero.tsx               # CTAs link to /register and /features
│  ├─ DuckScene.tsx          # 3D R3F duck + orbit ambience
│  ├─ Features.tsx           # Pinned horizontal scroll
│  ├─ FeatureShowcase.tsx    # Landing-only 3-col tool grid
│  ├─ HowItWorks.tsx         # 3-step strip
│  ├─ HomeCTA.tsx            # Landing closing CTA
│  ├─ DuckVsDoc.tsx          # Before/after slider
│  ├─ Pricing.tsx
│  ├─ FAQ.tsx
│  ├─ Footer.tsx             # Easter-egg duck + WebAudio quack
│  ├─ AuthCard.tsx           # Shared auth shell (glass card)
│  ├─ LoginForm.tsx
│  ├─ RegisterForm.tsx
│  ├─ SignOutButton.tsx
│  ├─ SessionProvider.tsx    # Client wrapper for next-auth/react
│  ├─ SmoothScroll.tsx       # Lenis + GSAP ticker
│  ├─ CustomCursor.tsx       # Duck-footprint cursor
│  ├─ MagneticButton.tsx
│  ├─ SplitText.tsx
│  ├─ Marquee.tsx
│  └─ DuckLogo.tsx
├─ lib/
│  ├─ prisma.ts              # PrismaClient singleton
│  └─ auth.ts                # NextAuth options (Credentials + Prisma adapter)
├─ types/
│  └─ next-auth.d.ts         # Augments Session with user.id
└─ middleware.ts             # Protects /dashboard/**
```

## Tweak points

- Color tokens: `tailwind.config.ts` (`cyber`, `neon.cyan`, `neon.purple`)
- Duck materials: `DuckScene.tsx` → `MeshPhysicalMaterial` (`transmission`, `ior`, `emissive`)
- Pricing copy & tiers: `Pricing.tsx` → `TIERS` array
- Feature deep-dive copy: `Features.tsx` → `FEATURES` array
- Landing tool tiles: `FeatureShowcase.tsx` → `TOOLS` array
- Easter-egg quack phrases: `Footer.tsx` → `phrases`
- Nav links: `Navbar.tsx` → `links` array

## Accessibility & perf notes

- Custom cursor is opt-out via `prefers-reduced-motion`.
- The 3D scene is dynamically imported with `ssr: false` so it never blocks the initial paint.
- Lenis is desktop-friendly and falls back gracefully on touch.
- All hover/parallax effects are gated by `(pointer: fine)` where they hide the native cursor.
- Passwords are bcrypt-hashed (12 rounds) — never stored or logged in plaintext.
- Session is JWT-based; no DB hit on every request to the protected route.
