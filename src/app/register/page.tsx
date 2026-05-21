import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Sign up — I Hate Docs",
  description: "Join the flock. Free forever.",
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <AuthCard
      title="Join the flock"
      subtitle="Free forever. No card. No quack."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-cyber underline-offset-4 hover:underline"
          >
            Log in
          </Link>
          .
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
