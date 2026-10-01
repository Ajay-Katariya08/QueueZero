import { Radio, Users, Cpu, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
  const steps = [
    {
      icon: Radio,
      title: "1. Operational Feeds",
      desc: "Hospitals, DMVs, and banks broadcast counter status, delays, and token numbers directly in real time.",
      badge: "Real-time Telemetry",
      panelBg: "bg-keylime",
    },
    {
      icon: Users,
      title: "2. Anonymous Crowdsourcing",
      desc: "Anyone physically present can report queue length with one tap. No login required. Algorithms cross-verify inputs.",
      badge: "Zero Friction",
      panelBg: "bg-mint",
    },
    {
      icon: Cpu,
      title: "3. Journey Simulation",
      desc: "Input your target time budget. QueueZero simulates each step (check-in, consult, lab, payment) to recommend your exact departure time.",
      badge: "Predictive Intelligence",
      panelBg: "bg-sage",
    },
  ];

  return (
    <section className="py-8 sm:py-10 bg-cream">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-2 max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="eyebrow">
            HOW QUEUEZERO OPERATES
          </span>
          <h2 className="font-serif font-light text-3xl sm:text-5xl text-forest leading-tight">
            Triangulated reality, not stale schedules
          </h2>
          <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
            A traditional appointment tells you when you were supposed to be seen. QueueZero informs you of real-time queue health with quiet clinical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`rounded-[14px] ${step.panelBg} p-8 shadow-none border-0 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex size-10 items-center justify-center rounded-[10px] bg-cream text-forest">
                      <Icon className="size-5 text-forest" />
                    </span>
                    <span className="text-xs font-normal px-3 py-1 rounded-full bg-cream text-forest border border-border-mist">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="font-serif font-light text-2xl text-forest mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-charcoal/80 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/plan">
            <Button
              size="lg"
              className="gap-2 rounded-[14px] bg-forest text-cream hover:bg-forest-shadow px-8 py-3.5 text-sm font-medium"
            >
              Calculate Your Visit Time <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
