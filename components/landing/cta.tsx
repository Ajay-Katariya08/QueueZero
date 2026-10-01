import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, PlusCircle, LayoutDashboard, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-8 sm:py-12 bg-cream">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <div className="rounded-[14px] bg-keylime p-10 sm:p-16 text-center flex flex-col items-center gap-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest">
            GET STARTED TODAY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] text-forest max-w-2xl leading-[1.1]">
            Never Travel Blindly Again.
          </h2>
          <p className="text-sm sm:text-base text-charcoal max-w-xl leading-relaxed">
            Check live bottlenecks before starting your journey, or publish real-time queue conditions for your hospital, clinic, or service center in minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link href="/explore">
              <Button
                size="lg"
                className="rounded-[14px] bg-forest text-cream hover:bg-forest-shadow font-normal px-6 py-3 text-sm border-0 flex items-center gap-2"
              >
                <Compass className="size-4" />
                Find Open Venues Near Me
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/report">
              <Button
                variant="outline"
                size="lg"
                className="rounded-[14px] border border-border-mist bg-cream text-forest hover:bg-mint font-normal px-6 py-3 text-sm"
              >
                <PlusCircle className="size-4" />
                Anonymous Report
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-[14px] text-forest hover:bg-mint/50 px-5 py-3 text-sm font-normal"
              >
                <LayoutDashboard className="size-4" />
                Operator Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
