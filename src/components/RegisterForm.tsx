"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || undefined,
        email: email.trim(),
        password,
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Could not create account.");
      setLoading(false);
      return;
    }

    // Auto sign in after register
    const signed = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);

    if (!signed || signed.error) {
      setError(
        "Account created, but auto sign-in failed. Try logging in manually.",
      );
      router.push("/login");
      return;
    }
    router.push(signed.url ?? "/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field
        label="Name (optional)"
        type="text"
        value={name}
        onChange={setName}
        autoComplete="name"
      />
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        required
      />
      <Field
        label="Password (min 8 characters)"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        required
        minLength={8}
      />

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-cyber px-5 py-3 text-sm font-medium text-black shadow-glow ring-1 ring-cyber/60 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}

type FieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

function Field({ label, value, onChange, ...rest }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.22em] text-white/45">
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 transition-colors placeholder:text-white/30 focus:bg-white/[0.06] focus:ring-cyber/60"
      />
    </label>
  );
}
