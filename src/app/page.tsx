import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { HowItWorks } from "@/components/HowItWorks";
import { HomeCTA } from "@/components/HomeCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <FeatureShowcase />
      <HowItWorks />
      <HomeCTA />
    </>
  );
}
