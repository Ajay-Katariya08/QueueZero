import { Radio, Users, Cpu, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
  const steps = [
    {
      icon: Radio,
      title: "1. Operational Feeds",
      desc: "Hospitals, DMVs, and banks broadcast counter status, doctor delays, and token numbers directly in real time.",
      badge: "Real-time Telemetry",
    },
    {
      icon: Users,
      title: "2. Anonymous Crowdsourcing",
      desc: "Anyone physically present can report queue length with one tap. No login required. Algorithms cross-verify inputs.",
      badge: "Zero Friction",
    },
    {
      icon: Cpu,
      title: "3. AI Journey Simulation",
      desc: "Input your target time budget. QueueZero simulates each step (check-in, consult, lab, payment) to recommend your exact departure time.",
      badge: "Predictive Intelligence",
    },
  ];

  return (
    <section className="py-10 sm:py-12 border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-2 max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            How QueueZero Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Triangulated Reality, Not Stale Schedules
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            A traditional appointment tells you when you were supposed to be seen. QueueZero tells you what is actually happening right now.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-xl border border-border/80 bg-card p-5 transition-all hover:border-primary/50 hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <Link href="/plan">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              Calculate Your Visit Time <ArrowUpRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
