"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem } from "@/lib/venue-types";
import {
  Building2,
  Landmark,
  FileText,
  Wrench,
  Scissors,
  UtensilsCrossed,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

type CategoryDef = {
  name: string;
  slug: string;
  icon: string;
  lucide: any;
  defaultLabel: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    name: "Hospitals & Clinics",
    slug: "clinic",
    icon: "🏥",
    lucide: Building2,
    defaultLabel: "Healthcare & Labs",
  },
  {
    name: "Passport & Visa Centers",
    slug: "passport",
    icon: "🛂",
    lucide: ShieldCheck,
    defaultLabel: "Consular Services",
  },
  {
    name: "Government & DMV",
    slug: "government",
    icon: "🏛️",
    lucide: FileText,
    defaultLabel: "Public Administration",
  },
  {
    name: "Banks & Forex",
    slug: "bank",
    icon: "🏦",
    lucide: Landmark,
    defaultLabel: "Financial Counters",
  },
  {
    name: "Device Repair Centers",
    slug: "repair",
    icon: "🔧",
    lucide: Wrench,
    defaultLabel: "Hardware Services",
  },
  {
    name: "Salons & Grooming",
    slug: "salon",
    icon: "✂️",
    lucide: Scissors,
    defaultLabel: "Personal Care",
  },
  {
    name: "Dining & Walk-ins",
    slug: "restaurant",
    icon: "🍽️",
    lucide: UtensilsCrossed,
    defaultLabel: "Walk-in Seating",
  },
  {
    name: "University Admin",
    slug: "university",
    icon: "🎓",
    lucide: GraduationCap,
    defaultLabel: "Campus Registrar",
  },
];

export function Categories() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCategoryCounts() {
      try {
        const res = await fetch("/api/venues");
        if (res.ok) {
          const json = await res.json();
          const items: VenueItem[] = json.data || [];
          const map: Record<string, number> = {};
          for (const item of items) {
            map[item.category] = (map[item.category] || 0) + 1;
          }
          setCounts(map);
        }
      } catch {}
    }
    loadCategoryCounts();
  }, []);

  return (
    <section className="py-10 sm:py-12 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Everywhere Queues Form
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
              Operational Categories
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Browse all locations →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const count = counts[cat.slug] || 0;
            return (
              <Link
                key={cat.slug}
                href={`/explore?category=${cat.slug}`}
                className="flex flex-col p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-semibold text-emerald-950 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                    {count > 0 ? `${count} live` : "Radar Ready"}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {cat.defaultLabel}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
