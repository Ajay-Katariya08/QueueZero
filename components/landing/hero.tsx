"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  Users,
  Building2,
  Radio,
} from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const [featuredVenue, setFeaturedVenue] = useState<VenueItem | null>(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch("/api/venues");
        if (res.ok) {
          const json = await res.json();
          const items: VenueItem[] = json.data || [];
          if (items.length > 0) {
            setFeaturedVenue(items[0]);
          }
        }
      } catch {}
    }

    loadFeatured();
  }, []);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "clinic":
      case "hospital":
        return "🏥";
      case "passport":
        return "🛂";
      case "bank":
        return "🏦";
      case "government":
        return "🏛️";
      case "repair":
        return "🔧";
      case "salon":
        return "✂️";
      case "restaurant":
        return "🍽️";
      default:
        return "📍";
    }
  };

  return (
    <section className="relative bg-[#fffefc] pt-6 pb-4 sm:pt-8 sm:pb-6">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 rounded-[14px] bg-[#e1f4df] p-8 sm:p-12 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <span className="eyebrow">CROWDSOURCED QUEUE TELEMETRY</span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#0f3e17] leading-[1.08] tracking-[-0.02em]">
                Know before you go. Hushed queues, zero wasted hours.
              </h1>

              <p className="text-sm sm:text-base text-[#222222]/80 leading-relaxed font-normal max-w-xl">
                Businesses publish operational health. Anonymous visitors
                broadcast live conditions. Accurately model multi-step journeys
                so you never hit an unexpected bottleneck again.
              </p>
            </div>

            <div className="pt-8 flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/explore">
                  <Button
                    size="lg"
                    className="rounded-[14px] bg-[#0f3e17] text-[#fffefc] hover:bg-[#0c2f10] font-medium px-6 py-3.5 text-sm gap-2"
                  >
                    <Compass className="size-4" />
                    Explore Live Facilities
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/plan">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-[14px] border border-[#0f3e17]/20 bg-[#fffefc] text-[#0f3e17] hover:bg-[#cfe7d3] font-medium px-6 py-3.5 text-sm"
                  >
                    <Clock className="size-4" />
                    Try Predictor
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffefc] px-3.5 py-1 text-xs text-[#0f3e17]">
                  <CheckCircle2 className="size-3.5 text-[#0f3e17]" />
                  Crowdsourced & Verified
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffefc] px-3.5 py-1 text-xs text-[#0f3e17]">
                  <CheckCircle2 className="size-3.5 text-[#0f3e17]" />
                  Multi-Service Bottleneck Radar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffefc] px-3.5 py-1 text-xs text-[#0f3e17]">
                  <CheckCircle2 className="size-3.5 text-[#0f3e17]" />
                  100% Anonymous
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[14px] bg-[#b6ced5] p-6 sm:p-8 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              {featuredVenue ? (
                <div className="rounded-[14px] bg-[#fffefc] p-6 text-[#222222] flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-4 border-b border-[#efeeeb]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getCategoryIcon(featuredVenue.category)}
                      </span>
                      <div>
                        <h2 className="font-serif font-light text-xl leading-tight text-[#0f3e17]">
                          {featuredVenue.name}
                        </h2>
                        <span className="text-xs text-[#222222]/60">
                          {featuredVenue.city} • Live Telemetry
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e1f4df] px-3 py-1 text-xs text-[#0f3e17]">
                      <span className="size-1.5 rounded-full bg-[#0f3e17] animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[14px] bg-[#e1f4df] p-3.5">
                      <span className="text-[11px] font-medium text-[#0f3e17] flex items-center gap-1.5">
                        <Users className="size-3.5" /> Waiting Now
                      </span>
                      <p className="font-serif text-2xl font-light mt-1 text-[#0f3e17]">
                        {featuredVenue.totalWaitingCount}{" "}
                        <span className="text-xs font-sans font-normal text-[#222222]/70">
                          visitors
                        </span>
                      </p>
                    </div>

                    <div className="rounded-[14px] bg-[#cfe7d3] p-3.5">
                      <span className="text-[11px] font-medium text-[#0f3e17] flex items-center gap-1.5">
                        <Clock className="size-3.5" /> Est. Total Wait
                      </span>
                      <p className="font-serif text-2xl font-light mt-1 text-[#0f3e17]">
                        {featuredVenue.averageWaitMinutes}{" "}
                        <span className="text-xs font-sans font-normal text-[#222222]/70">
                          min
                        </span>
                      </p>
                    </div>
                  </div>

                  {featuredVenue.servicePoints &&
                    featuredVenue.servicePoints.length > 0 && (
                      <div className="flex flex-col gap-1 rounded-[14px] bg-[#fffefc] border border-[#efeeeb] p-3 text-xs max-h-56 overflow-y-auto">
                        {featuredVenue.servicePoints.slice(0, 6).map((sp) => (
                          <div
                            key={sp.id || sp._id || sp.name}
                            className="flex items-center justify-between py-1.5 border-b border-[#efeeeb] last:border-0"
                          >
                            <span className="font-normal text-[#0f3e17] truncate pr-2">
                              {sp.name}
                            </span>
                            <span className="text-[#222222]/80 font-mono shrink-0">
                              {sp.estimatedWaitMinutes} min
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                  <Link
                    href={`/venue/${featuredVenue.slug}`}
                    className="w-full pt-1"
                  >
                    <Button
                      size="default"
                      className="w-full text-xs font-medium rounded-[14px] bg-[#0f3e17] text-[#fffefc] hover:bg-[#0c2f10]"
                    >
                      View Live Facility Station
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-[14px] bg-[#fffefc] p-6 text-[#222222] flex flex-col gap-4 text-center">
                  <div className="size-12 rounded-[14px] bg-[#e1f4df] flex items-center justify-center text-[#0f3e17] mx-auto">
                    <Radio className="size-5 animate-pulse text-[#0f3e17]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-light text-xl text-[#0f3e17]">
                      Facility Telemetry Station
                    </h3>
                    <p className="text-xs text-[#222222]/70 mt-1 max-w-xs mx-auto">
                      Publish wait times and counter operational conditions
                      directly to citizens.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Link href="/dashboard" className="w-full">
                      <Button
                        size="default"
                        className="w-full text-xs font-medium rounded-[14px] bg-[#0f3e17] text-[#fffefc] hover:bg-[#0c2f10]"
                      >
                        Register Facility
                      </Button>
                    </Link>
                    <Link href="/explore" className="w-full">
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full text-xs font-medium rounded-[14px] border border-[#efeeeb] bg-[#fffefc] text-[#0f3e17] hover:bg-[#e1f4df]"
                      >
                        Explore Live Radar
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
