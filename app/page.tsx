import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Categories } from "@/components/landing/categories";
import { LiveDemo } from "@/components/landing/live-demo";
import { CTA } from "@/components/landing/cta";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <HowItWorks />
      <Categories />
      <LiveDemo />
      <CTA />
    </div>
  );
}
