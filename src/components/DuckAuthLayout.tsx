"use client";

import { createContext, useContext, type ReactNode, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DuckLogo } from "./DuckLogo";
import { AnimatedDucks, type DuckState } from "./AnimatedDucks";

// Context so child forms can trigger the eye toggle
const EyeToggleCtx = createContext<(() => void) | null>(null);
export const useEyeToggle = () => useContext(EyeToggleCtx);

// Context for expressive duck interactions
interface DuckInteractionContextValue {
  setDuckState: (state: DuckState) => void;
  setCaretPosition: (pos: { x: number; y: number }) => void;
  setTypingSpeed: (speed: number) => void;
  setIsValid: (valid: boolean | null) => void;
}
const DuckInteractionCtx = createContext<DuckInteractionContextValue | null>(null);
export const useDuckInteraction = () => useContext(DuckInteractionCtx);

interface Props {
  children: ReactNode;
  emailInputRef: React.RefObject<HTMLInputElement>;
  passwordInputRef: React.RefObject<HTMLInputElement>;
}

// ─── Exported Icons (matching original exports) ────────────────────────
export function EyeOpenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeClosedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function DuckAuthLayout({ children, emailInputRef, passwordInputRef }: Props) {
  const [, setDummyState] = useState(false);
  
  // Duck interaction states
  const [duckState, setDuckState] = useState<DuckState>("idle");
  const [caretPosition, setCaretPosition] = useState({ x: 0, y: 0 });
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleEyeToggle = () => {
    // Just trigger a state refresh if needed, forms listen to this context
    setDummyState((v) => !v);
  };

  // Consume refs to satisfy ESLint
  if (emailInputRef && passwordInputRef) {
    // No-op
  }

  const interactionValue = {
    setDuckState,
    setCaretPosition,
    setTypingSpeed,
    setIsValid,
  };

  return (
    <DuckInteractionCtx.Provider value={interactionValue}>
      <EyeToggleCtx.Provider value={handleEyeToggle}>
        <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-obsidian py-12 px-4 sm:px-6 lg:px-8">
          
          {/* Background grids and glowing lights */}
          <div 
            className="absolute inset-0 -z-10 bg-grid-faint opacity-[0.45]"
            style={{ backgroundSize: "40px 40px" }}
          />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-spot" />
          
          <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-cyber/10 blur-[150px]" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-neon-purple/10 blur-[150px]" />
          <div className="noise -z-10" />

          {/* Auth Layout Card Container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex w-full max-w-[1100px] min-h-[680px] rounded-[32px] overflow-hidden border border-white/10 bg-pond/85 shadow-glass backdrop-blur-xl"
          >
            {/* Left Panel: 2D Animated Duck Scene */}
            <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/5 bg-ink p-12 md:flex">
              
              {/* Ambient Background Spot in the Left Panel */}
              <div className="absolute inset-0 bg-gradient-to-tr from-obsidian via-pond to-cyber/5 opacity-80" />
              <div 
                className="absolute inset-0 opacity-[0.2]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }}
              />

              {/* Floating paper sheets animation */}
              <motion.div 
                className="absolute inset-0 pointer-events-none overflow-hidden"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.2 }
                  }
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm"
                    style={{
                      width: 40 + Math.random() * 40,
                      height: 50 + Math.random() * 50,
                      left: `${10 + Math.random() * 80}%`,
                      bottom: "-20%",
                    }}
                    variants={{
                      hidden: { y: 0, rotate: 0, opacity: 0 },
                      show: {
                        y: -800,
                        rotate: Math.random() * 360,
                        opacity: [0, 1, 0],
                        transition: {
                          duration: 10 + Math.random() * 10,
                          repeat: Infinity,
                          ease: "linear",
                          delay: Math.random() * 5
                        }
                      }
                    }}
                  />
                ))}
              </motion.div>

              {/* Top Text content */}
              <div className="relative z-10">
                <Link href="/" className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white/80 hover:text-white transition-colors">
                  <DuckLogo className="h-6 w-6" />
                  <span>I Hate <span className="text-cyber">Docs</span></span>
                </Link>
              </div>

              {/* Animated 3-Duck Characters Scene */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatedDucks 
                  state={duckState}
                  caretPosition={caretPosition}
                  typingSpeed={typingSpeed}
                  isValid={isValid}
                />
              </div>

              {/* Bottom text showcase */}
              <div className="relative z-10 space-y-2 mt-auto">
                <p className="font-display text-lg font-medium text-white/90">
                  &quot;We Love Ducks, just not the Docs.&quot;
                </p>
                <p className="text-xs text-white/40">
                  Unlock automated summarization, instant editing, and modern slides generation.
                </p>
              </div>
            </div>

            {/* Right Panel: Content Form */}
            <div className="relative flex w-full flex-col justify-center bg-obsidian/30 px-6 py-12 sm:px-12 md:w-1/2 lg:px-16">
              
              {/* Mobile Logo Header */}
              <div className="mb-8 flex items-center gap-2 md:hidden">
                <DuckLogo className="h-6 w-6" />
                <span className="font-display font-semibold text-white">
                  I Hate <span className="text-cyber">Docs</span>
                </span>
              </div>

              {/* Animated Mobile Duck (Optional: could display one duck here, but keeping clean form for now) */}

              {/* Form children (login or register fields) */}
              <div className="w-full">
                {children}
              </div>
            </div>
          </motion.div>
        </main>
      </EyeToggleCtx.Provider>
    </DuckInteractionCtx.Provider>
  );
}
