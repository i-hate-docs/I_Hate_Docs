import type { Metadata } from "next";
import { Features } from "@/components/Features";

export const metadata: Metadata = {
  title: "Features — I Hate Docs",
  description:
    "AI PDF Editor, AI Slide Generator, Doc Chat, and every shipping feature behind one duck.",
};

export default function FeaturesPage() {
  return <Features />;
}
