import type { Metadata } from "next";
import { FAQ } from "@/components/FAQ";

export const metadata: Metadata = {
  title: "FAQ — I Hate Docs",
  description: "Quack-asked questions about the duck and the docs.",
};

export default function FAQPage() {
  return (
    <div className="pt-24 md:pt-28">
      <FAQ />
    </div>
  );
}
