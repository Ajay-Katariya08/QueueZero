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
    <section className="relative bg-cream pt-6 pb-4 sm:pt-8 sm:pb-6">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 rounded-[14px] bg-keylime p-8 sm:p-12 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <span className="eyebrow">CROWDSOURCED QUEUE TELEMETRY</span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-forest leading-[1.08] tracking-[-0.02em]">
                Know before you go. Hushed queues, zero wasted hours.
              </h1>

              <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal max-w-xl">
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
                    className="rounded-[14px] bg-forest text-cream hover:bg-forest-shadow font-medium px-6 py-3.5 text-sm gap-2"
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
                    className="rounded-[14px] border border-forest/20 bg-cream text-forest hover:bg-mint font-medium px-6 py-3.5 text-sm"
                  >
                    <Clock className="size-4" />
                    Try Predictor
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1 text-xs text-forest">
                  <CheckCircle2 className="size-3.5 text-forest" />
                  Crowdsourced & Verified
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1 text-xs text-forest">
                  <CheckCircle2 className="size-3.5 text-forest" />
                  Multi-Service Bottleneck Radar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1 text-xs text-forest">
                  <CheckCircle2 className="size-3.5 text-forest" />
                  100% Anonymous
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[14px] bg-slate-hush p-6 sm:p-8 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              {featuredVenue ? (
                <div className="rounded-[14px] bg-cream p-6 text-charcoal flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-4 border-b border-border-mist">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getCategoryIcon(featuredVenue.category)}
                      </span>
                      <div>
                        <h2 className="font-serif font-light text-xl leading-tight text-forest">
                          {featuredVenue.name}
                        </h2>
                        <span className="text-xs text-charcoal/60">
                          {featuredVenue.city} • Live Telemetry
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-keylime px-3 py-1 text-xs text-forest">
                      <span className="size-1.5 rounded-full bg-forest animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[14px] bg-keylime p-3.5">
                      <span className="text-[11px] font-medium text-forest flex items-center gap-1.5">
                        <Users className="size-3.5" /> Waiting Now
                      </span>
                      <p className="font-serif text-2xl font-light mt-1 text-forest">
                        {featuredVenue.totalWaitingCount}{" "}
                        <span className="text-xs font-sans font-normal text-charcoal/70">
                          visitors
                        </span>
                      </p>
                    </div>

                    <div className="rounded-[14px] bg-mint p-3.5">
                      <span className="text-[11px] font-medium text-forest flex items-center gap-1.5">
                        <Clock className="size-3.5" /> Est. Total Wait
                      </span>
                      <p className="font-serif text-2xl font-light mt-1 text-forest">
                        {featuredVenue.averageWaitMinutes}{" "}
                        <span className="text-xs font-sans font-normal text-charcoal/70">
                          min
                        </span>
                      </p>
                    </div>
                  </div>

                  {featuredVenue.servicePoints &&
                    featuredVenue.servicePoints.length > 0 && (
                      <div className="flex flex-col gap-1 rounded-[14px] bg-cream border border-border-mist p-3 text-xs max-h-56 overflow-y-auto">
                        {featuredVenue.servicePoints.slice(0, 6).map((sp) => (
                          <div
                            key={sp.id || sp._id || sp.name}
                            className="flex items-center justify-between py-1.5 border-b border-border-mist last:border-0"
                          >
                            <span className="font-normal text-forest truncate pr-2">
                              {sp.name}
                            </span>
                            <span className="text-charcoal/80 font-mono shrink-0">
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
                      className="w-full text-xs font-medium rounded-[14px] bg-forest text-cream hover:bg-forest-shadow"
                    >
                      View Live Facility Station
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-[14px] bg-cream p-6 text-charcoal flex flex-col gap-4 text-center">
                  <div className="size-12 rounded-[14px] bg-keylime flex items-center justify-center text-forest mx-auto">
                    <Radio className="size-5 animate-pulse text-forest" />
                  </div>
                  <div>
                    <h3 className="font-serif font-light text-xl text-forest">
                      Facility Telemetry Station
                    </h3>
                    <p className="text-xs text-charcoal/70 mt-1 max-w-xs mx-auto">
                      Publish wait times and counter operational conditions
                      directly to citizens.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Link href="/dashboard" className="w-full">
                      <Button
                        size="default"
                        className="w-full text-xs font-medium rounded-[14px] bg-forest text-cream hover:bg-forest-shadow"
                      >
                        Register Facility
                      </Button>
                    </Link>
                    <Link href="/explore" className="w-full">
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full text-xs font-medium rounded-[14px] border border-border-mist bg-cream text-forest hover:bg-keylime"
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
