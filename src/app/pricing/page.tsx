import type { Metadata } from "next";
import { Pricing } from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Pricing — I Hate Docs",
  description:
    "Free forever for hobbyists. Paid plans for ducks who mean business.",
};

export default function PricingPage() {
  return (
    <div className="pt-24 md:pt-28">
      <Pricing />
    </div>
  );
}
