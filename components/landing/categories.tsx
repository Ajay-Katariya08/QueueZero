"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem } from "@/lib/venue-types";

type CategoryDef = {
  name: string;
  slug: string;
  icon: string;
  defaultLabel: string;
  pastelBg: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    name: "Hospitals & Clinics",
    slug: "clinic",
    icon: "🏥",
    defaultLabel: "Emergency, consults & diagnostics",
    pastelBg: "#e1f4df",
  },
  {
    name: "Passport & Visas",
    slug: "passport",
    icon: "🛂",
    defaultLabel: "Biometrics & document interviews",
    pastelBg: "#cfe7d3",
  },
  {
    name: "Government & DMV",
    slug: "government",
    icon: "🏛️",
    defaultLabel: "Civic registry & permits",
    pastelBg: "#b6ced5",
  },
  {
    name: "Banks & Financial",
    slug: "bank",
    icon: "🏦",
    defaultLabel: "Teller windows & loan desks",
    pastelBg: "#b1dbb8",
  },
  {
    name: "Device Repair",
    slug: "repair",
    icon: "🔧",
    defaultLabel: "Hardware check-ins & diagnostics",
    pastelBg: "#e1f4df",
  },
  {
    name: "Salons & Care",
    slug: "salon",
    icon: "✂️",
    defaultLabel: "Stylists & wellness queues",
    pastelBg: "#cfe7d3",
  },
  {
    name: "Dining & Cafes",
    slug: "restaurant",
    icon: "🍽️",
    defaultLabel: "Walk-in table queues",
    pastelBg: "#b1dbb8",
  },
  {
    name: "University Admin",
    slug: "university",
    icon: "🎓",
    defaultLabel: "Admissions & financial clearance",
    pastelBg: "#b6ced5",
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
    <section className="py-8 sm:py-10 bg-[#fffefc]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="eyebrow">
              EVERYWHERE QUEUES FORM
            </span>
            <h2 className="font-serif font-light text-3xl sm:text-5xl text-[#0f3e17] mt-2">
              Operational categories
            </h2>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center text-sm font-medium text-[#0f3e17] hover:underline"
          >
            Browse all locations →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => {
            const count = counts[cat.slug] || 0;
            return (
              <Link
                key={cat.slug}
                href={`/explore?category=${cat.slug}`}
                style={{ backgroundColor: cat.pastelBg }}
                className="flex flex-col justify-between p-7 rounded-[14px] transition-transform hover:-translate-y-0.5 shadow-none border-0 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-[11px] font-normal text-[#0f3e17] bg-[#fffefc] border border-[#efeeeb] px-3 py-1 rounded-full">
                      {count > 0 ? `${count} active` : "Radar Ready"}
                    </span>
                  </div>
                  <h3 className="font-serif font-light text-2xl text-[#0f3e17] tracking-tight mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#222222]/80 leading-relaxed">
                    {cat.defaultLabel}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
