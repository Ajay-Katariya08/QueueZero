import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, PlusCircle, LayoutDashboard } from "lucide-react";

export function CTA() {
  return (
    <section className="py-10 sm:py-14 bg-card/60">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center flex flex-col items-center gap-4">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          Never Travel Blindly Again.
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg">
          Check live bottlenecks before starting your car, or publish conditions for your hospital, clinic, or service center in 2 minutes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/explore">
            <Button size="lg" className="gap-2 text-xs sm:text-sm">
              <Compass className="size-4" />
              Find Open Venues Near Me
            </Button>
          </Link>
          <Link href="/report">
            <Button variant="outline" size="lg" className="gap-2 text-xs sm:text-sm">
              <PlusCircle className="size-4" />
              Quick Anonymous Report
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="lg" className="gap-2 text-xs sm:text-sm">
              <LayoutDashboard className="size-4" />
              Business Operators
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
