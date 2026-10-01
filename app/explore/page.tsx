"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem } from "@/lib/venue-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QueueBadge } from "@/components/shared/queue-badge";
import {
  Search,
  MapPin,
  Clock,
  Users,
  Compass,
  ArrowRight,
  Map as MapIcon,
  List,
  ShieldCheck,
} from "lucide-react";

export default function ExplorePage() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [sortBy, setSortBy] = useState<"wait" | "waiting">("wait");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const categories = [
    { label: "All Venues", value: "all" },
    { label: "🏥 Clinics & Hospitals", value: "clinic" },
    { label: "🛂 Passport & Visas", value: "passport" },
    { label: "🏛️ Government & Offices", value: "government" },
    { label: "🏦 Banks", value: "bank" },
    { label: "🔧 Device Repair", value: "repair" },
    { label: "🍽️ Restaurants", value: "restaurant" },
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function loadVenues() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCat !== "all") params.set("category", selectedCat);
        if (search.trim()) params.set("q", search.trim());

        const res = await fetch(`/api/venues?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const json = await res.json();
          setVenues(json.data || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadVenues();
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedCat, search]);

  const sorted = [...venues].sort((a, b) => {
    if (sortBy === "wait") {
      return a.averageWaitMinutes - b.averageWaitMinutes;
    }
    return b.totalWaitingCount - a.totalWaitingCount;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-12 flex flex-col gap-8 bg-cream">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest">
            LIVE OPERATIONAL RADAR
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-[-0.03em] text-forest mt-1">
            Real-Time Queue Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/75 mt-1.5 leading-relaxed">
            Direct telemetry and citizen crowd observations from verified
            facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-[14px] border border-border-mist bg-cream p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[12px] text-xs font-normal transition-colors ${
                viewMode === "list"
                  ? "bg-forest text-cream"
                  : "text-charcoal/80 hover:text-forest"
              }`}
            >
              <List className="size-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[12px] text-xs font-normal transition-colors ${
                viewMode === "map"
                  ? "bg-forest text-cream"
                  : "text-charcoal/80 hover:text-forest"
              }`}
            >
              <MapIcon className="size-3.5" />
              Map Radar
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 size-4 text-charcoal/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals, clinics, DMVs, banks..."
            className="pl-11 h-11 rounded-[14px] border border-border-mist bg-cream text-xs sm:text-sm text-charcoal focus-visible:ring-1 focus-visible:ring-forest"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "wait" | "waiting")}
            className="h-11 rounded-[14px] border border-border-mist bg-cream px-4 text-xs font-normal text-forest focus-visible:outline-none"
          >
            <option value="wait">Sort: Shortest Wait</option>
            <option value="waiting">Sort: Most Crowded</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setSelectedCat(c.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-normal transition-all border ${
              selectedCat === c.value
                ? "bg-forest text-cream border-forest"
                : "bg-cream text-charcoal/80 border-border-mist hover:bg-mint hover:text-forest"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="size-8 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal/70">Scanning live radars...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-20 text-center rounded-[14px] bg-keylime p-10">
          <Compass className="size-10 text-forest mx-auto mb-3 opacity-40" />
          <h3 className="font-serif text-xl font-light text-forest">
            No Facilities Found
          </h3>
          <p className="text-xs text-charcoal/70 mt-1 max-w-sm mx-auto">
            Try adjusting your category filter or search keywords.
          </p>
        </div>
      ) : viewMode === "map" ? (
        <div className="relative h-[480px] w-full rounded-[14px] bg-slate-hush overflow-hidden flex flex-col items-center justify-center p-8 text-center">
          <div className="relative z-10 flex flex-col items-center gap-3 max-w-md">
            <span className="flex size-14 items-center justify-center rounded-full bg-cream text-forest">
              <MapPin className="size-7 text-forest" />
            </span>
            <h3 className="font-serif text-2xl font-light text-forest">
              Interactive Geolocation Radar
            </h3>
            <p className="text-xs text-charcoal/80">
              Showing {sorted.length} verified facilities. Real-time telemetry
              broadcasting active.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              {sorted.slice(0, 4).map((v) => (
                <Link
                  key={v.slug || v._id || v.id}
                  href={`/venue/${v.slug}`}
                  className="p-3.5 rounded-[14px] bg-cream text-left hover:bg-mint transition-colors text-xs"
                >
                  <p className="font-normal text-forest truncate">
                    {v.name}
                  </p>
                  <p className="text-[11px] text-charcoal/70">
                    {v.averageWaitMinutes}m wait · {v.city}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map((venue) => (
            <Card
              key={venue.slug || venue._id || venue.id}
              className="rounded-[14px] bg-keylime border-0 shadow-none flex flex-col justify-between p-2"
            >
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-xl sm:text-2xl font-light text-forest leading-tight">
                          {venue.name}
                        </h2>
                        {venue.isVerified && (
                          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-cream border border-border-mist px-2.5 py-0.5 text-[11px] font-medium text-forest whitespace-nowrap shrink-0">
                            <ShieldCheck className="size-3.5 text-forest shrink-0" />
                            GST Verified
                          </span>
                        )}
                      </div>

                      <div className="flex sm:hidden items-center gap-2 mt-2 flex-wrap">
                        {venue.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-border-mist px-2.5 py-0.5 text-[11px] font-medium text-forest whitespace-nowrap shrink-0">
                            <ShieldCheck className="size-3.5 text-forest shrink-0" />
                            GST Verified
                          </span>
                        )}
                        <QueueBadge waitMinutes={venue.averageWaitMinutes} />
                      </div>

                      <p className="text-xs text-charcoal/70 flex items-center gap-1.5 mt-2 sm:mt-1.5">
                        <MapPin className="size-3.5 text-forest shrink-0" />
                        <span className="truncate">
                          {venue.address}, {venue.city}
                        </span>
                      </p>
                    </div>

                    <div className="hidden sm:block shrink-0">
                      <QueueBadge waitMinutes={venue.averageWaitMinutes} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-[14px] bg-cream p-4 text-xs">
                  <div>
                    <span className="text-[11px] text-charcoal/70 font-normal flex items-center gap-1">
                      <Users className="size-3 text-forest" /> Waiting Count
                    </span>
                    <p className="text-lg font-light font-mono mt-1 text-forest">
                      {venue.totalWaitingCount} people
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal/70 font-normal flex items-center gap-1">
                      <Clock className="size-3 text-forest" /> Average Wait
                    </span>
                    <p className="text-lg font-light font-mono text-forest mt-1">
                      {venue.averageWaitMinutes} min
                    </p>
                  </div>
                </div>

                {venue.statusText && (
                  <p className="text-xs text-forest font-normal bg-mint px-3.5 py-2 rounded-[14px]">
                    {venue.statusText}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-sage/40">
                  <span className="text-xs text-charcoal/70">
                    {venue.servicePoints?.length || 0} active counters
                  </span>

                  <div className="flex items-center gap-2">
                    <Link href={`/plan?venue=${venue.slug}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-[14px] text-xs px-3 text-forest hover:bg-mint"
                      >
                        Plan Visit
                      </Button>
                    </Link>
                    <Link href={`/venue/${venue.slug}`}>
                      <Button
                        size="sm"
                        className="rounded-[14px] bg-forest text-cream hover:bg-forest-shadow text-xs px-4 gap-1 font-normal border-0 flex items-center"
                      >
                        View Live <ArrowRight className="size-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
