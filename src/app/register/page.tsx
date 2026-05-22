"use client";

import { useRef, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  DuckAuthLayout,
  useEyeToggle,
  useDuckInteraction,
  EyeOpenIcon,
  EyeClosedIcon,
  GoogleIcon,
} from "@/components/DuckAuthLayout";
import { OAuthAlert } from "@/components/OAuthAlert";

export default function RegisterPage() {
  const emailRef = useRef<HTMLInputElement>(null!);
  const passwordRef = useRef<HTMLInputElement>(null!);
  const { status } = useSession();
  const router = useRouter();
  const [showOAuthAlert, setShowOAuthAlert] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") return null;

  return (
    <>
      <OAuthAlert show={showOAuthAlert} onClose={() => setShowOAuthAlert(false)} />
      <DuckAuthLayout emailInputRef={emailRef} passwordInputRef={passwordRef}>
        <RegisterForm emailRef={emailRef} passwordRef={passwordRef} onGoogleClick={() => setShowOAuthAlert(true)} />
      </DuckAuthLayout>
    </>
  );
}

// ─── Animations Variants ────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ─── Register Form ──────────────────────────────────────────────
function RegisterForm({
  emailRef,
  passwordRef,
  onGoogleClick,
}: {
  emailRef: React.RefObject<HTMLInputElement>;
  passwordRef: React.RefObject<HTMLInputElement>;
  onGoogleClick: () => void;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const eyeToggle = useEyeToggle();
  const duckCtx = useDuckInteraction();
  
  // Track typing speed
  const [lastTypeTime, setLastTypeTime] = useState(0);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (duckCtx) {
      duckCtx.setCaretPosition({ x: (e.target.value.length - 10) / 20, y: 0 });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (duckCtx) {
      duckCtx.setCaretPosition({ x: (val.length - 10) / 20, y: 0 });
      duckCtx.setIsValid(val.includes("@") && val.includes(".") ? true : val.length > 0 ? false : null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (duckCtx) {
      const now = Date.now();
      const speed = Math.min(1, 100 / Math.max(1, now - lastTypeTime));
      duckCtx.setTypingSpeed(speed);
      setLastTypeTime(now);
      
      setTimeout(() => {
        if (Date.now() - now > 300) duckCtx.setTypingSpeed(0);
      }, 350);
    }
  };

  const handleTextFocus = () => duckCtx?.setDuckState("tracking");
  const handleTextBlur = () => duckCtx?.setDuckState("idle");

  const handlePasswordFocus = () => duckCtx?.setDuckState(showPw ? "gasping" : "hiding");
  const handlePasswordBlur = () => {
    duckCtx?.setDuckState("idle");
    duckCtx?.setTypingSpeed(0);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    duckCtx?.setDuckState("tracking");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        duckCtx?.setDuckState("judging");
        setTimeout(() => duckCtx?.setDuckState("idle"), 2000);
        return;
      }

      // Auto sign-in after registration
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      setLoading(false);
      if (signInRes?.error) {
        setError("Account created, but auto-login failed. Please log in.");
        duckCtx?.setDuckState("judging");
        setTimeout(() => duckCtx?.setDuckState("idle"), 2000);
        return;
      }
      
      duckCtx?.setDuckState("cheering");
      setTimeout(() => {
        router.push(signInRes?.url ?? "/dashboard");
        router.refresh();
      }, 1000);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
      duckCtx?.setDuckState("judging");
      setTimeout(() => duckCtx?.setDuckState("idle"), 2000);
    }
  };

  const handleEyeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextShowPw = !showPw;
    setShowPw(nextShowPw);
    eyeToggle?.();
    
    if (document.activeElement === passwordRef.current) {
      duckCtx?.setDuckState(nextShowPw ? "gasping" : "hiding");
    }
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Join the flock.
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Free forever. No card. No quack.
        </p>
      </motion.div>

      {error && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
          Full Name
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-cyber/50 focus:bg-cyber/[0.02] focus:ring-1 focus:ring-cyber/20"
            placeholder="Ducky McDuckface"
            autoComplete="name"
            value={name}
            onChange={handleNameChange}
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
          Email Address
        </label>
        <div className="relative">
          <input
            ref={emailRef}
            type="email"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-cyber/50 focus:bg-cyber/[0.02] focus:ring-1 focus:ring-cyber/20"
            placeholder="duck@ihatedocs.com"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
            required
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
          Password
        </label>
        <div className="relative">
          <input
            ref={passwordRef}
            type={showPw ? "text" : "password"}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pr-12 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-cyber/50 focus:bg-cyber/[0.02] focus:ring-1 focus:ring-cyber/20"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            required
            minLength={8}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyber transition-colors"
            onClick={handleEyeClick}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3 pt-3">
        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center rounded-full bg-duck-gradient py-3.5 text-sm font-bold text-obsidian shadow-md transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.02] py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98]"
          onClick={onGoogleClick}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-center text-xs text-white/40"
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-cyber hover:underline"
        >
          Log In
        </Link>
      </motion.p>
    </motion.form>
  );
}
