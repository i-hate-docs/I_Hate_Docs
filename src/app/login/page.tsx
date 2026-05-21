import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in — I Hate Docs",
  description: "Welcome back to the pond.",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to the pond. Your ducks have been waiting."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-cyber underline-offset-4 hover:underline"
          >
            Create one
          </Link>
          .
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
