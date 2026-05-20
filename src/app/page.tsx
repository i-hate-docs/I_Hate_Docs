import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { DuckVsDoc } from "@/components/DuckVsDoc";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";
import { FAQ } from "@/components/FAQ";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <DuckVsDoc />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
