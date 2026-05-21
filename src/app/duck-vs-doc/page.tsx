import type { Metadata } from "next";
import { DuckVsDoc } from "@/components/DuckVsDoc";

export const metadata: Metadata = {
  title: "Duck vs Doc — I Hate Docs",
  description:
    "Drag the slider. Watch a 23-page services agreement turn into clarity in 30 seconds.",
};

export default function DuckVsDocPage() {
  return (
    <div className="pt-24 md:pt-28">
      <DuckVsDoc />
    </div>
  );
}
