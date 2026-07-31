import { AuroraBackground } from "@/components/animated-background";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <AuroraBackground>
        <Navbar />
        <Hero />
      </AuroraBackground>
      <Features />
      <Pricing />
      <Testimonials />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}
