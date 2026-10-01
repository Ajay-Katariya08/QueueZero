"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <section className="relative overflow-hidden py-10 sm:py-14 border-b border-border/60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.15_160/0.08),transparent_60%)]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 self-center lg:self-start rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-xs dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              </span>
              <span>
                Not an appointment app. Real-time conditions before you travel.
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight leading-[1.15]">
              Know Before You Go.
              <span className="block text-primary">
                Zero Surprises. Zero Wasted Hours.
              </span>
            </h1>

            <p className="text-base text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Businesses publish operational health. Anonymous visitors
              broadcast live conditions. Our accurately models multi-step
              journeys so you never hit a 45-minute queue again.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link href="/explore">
                <Button size="lg" className="gap-2 font-medium">
                  <Compass className="size-4" />
                  Explore Live Places
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/plan">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 font-medium"
                >
                  <Clock className="size-4" />
                  Try Predictor
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Crowdsourced & Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Multi-Service Bottleneck Detection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>100% Anonymous Reports</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              {featuredVenue ? (
                <Card className="border-border/80 shadow-lg bg-card/95 backdrop-blur-xs">
                  <div className="p-4 border-b border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getCategoryIcon(featuredVenue.category)}
                      </span>
                      <div>
                        <h2 className="text-sm font-bold leading-none">
                          {featuredVenue.name}
                        </h2>
                        <span className="text-[11px] text-muted-foreground">
                          {featuredVenue.city} • Live Telemetry
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1 text-[11px]">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </Badge>
                  </div>

                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Users className="size-3" /> Waiting Now
                        </span>
                        <p className="text-xl font-medium mt-0.5">
                          {featuredVenue.totalWaitingCount}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            people
                          </span>
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/60 p-2.5">
                        <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" /> Est. Total Wait
                        </span>
                        <p className="text-xl font-medium mt-0.5 text-primary">
                          {featuredVenue.averageWaitMinutes}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            min
                          </span>
                        </p>
                      </div>
                    </div>

                    {featuredVenue.servicePoints &&
                      featuredVenue.servicePoints.length > 0 && (
                        <div className="flex flex-col gap-1.5 rounded-lg border border-border/80 p-2.5 text-xs max-h-64 overflow-y-auto">
                          {featuredVenue.servicePoints.slice(0, 6).map((sp) => (
                            <div
                              key={sp.id || sp._id || sp.name}
                              className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
                            >
                              <span className="font-medium text-foreground truncate pr-2">
                                {sp.name}
                              </span>
                              <span className="text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                                {sp.estimatedWaitMinutes} min
                              </span>
                            </div>
                          ))}
                          {featuredVenue.servicePoints.length > 6 && (
                            <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/30">
                              +{featuredVenue.servicePoints.length - 6} more services
                            </p>
                          )}
                        </div>
                      )}

                    <Link
                      href={`/venue/${featuredVenue.slug}`}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        View Live Facility Dashboard
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/80 shadow-lg bg-card/95 backdrop-blur-xs">
                  <div className="p-4 border-b border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Radio className="size-4 animate-pulse" />
                      </span>
                      <div>
                        <h2 className="text-sm font-bold leading-none">
                          Live Queue Radar
                        </h2>
                        <span className="text-[11px] text-muted-foreground">
                          Direct Facility Monitoring
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Operational
                    </Badge>
                  </div>

                  <CardContent className="p-5 flex flex-col gap-4 text-center">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      <Building2 className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">
                        Facility Telemetry Station
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Register your clinic, office, or branch to broadcast
                        wait times directly to citizens.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Link href="/dashboard" className="w-full">
                        <Button size="sm" className="w-full text-xs">
                          Register Facility
                        </Button>
                      </Link>
                      <Link href="/explore" className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                        >
                          Explore Live Radar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
