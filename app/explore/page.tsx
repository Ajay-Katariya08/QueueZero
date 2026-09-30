"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem } from "@/lib/venue-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    async function loadVenues() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCat !== "all") params.set("category", selectedCat);
        if (search.trim()) params.set("q", search.trim());

        const res = await fetch(`/api/venues?${params.toString()}`);
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

    return () => clearTimeout(timer);
  }, [selectedCat, search]);

  const sorted = [...venues].sort((a, b) => {
    if (sortBy === "wait") {
      return a.averageWaitMinutes - b.averageWaitMinutes;
    }
    return b.totalWaitingCount - a.totalWaitingCount;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight flex items-center gap-2">
            <Compass className="size-6 text-primary" />
            Live Operational Radar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time waiting times and crowd telemetry from verified
            facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals, clinics, DMVs, banks..."
            className="pl-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "wait" | "waiting")}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedCat === c.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-medium">
            Scanning live radars...
          </p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-border p-8">
          <Compass className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold">No Facilities Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your category filter or search keywords.
          </p>
        </div>
      ) : viewMode === "map" ? (
        <div className="relative h-[480px] w-full rounded-xl border border-border bg-muted/40 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
          <div className="relative z-10 flex flex-col items-center gap-3 max-w-md">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary animate-pulse">
              <MapPin className="size-6" />
            </span>
            <h3 className="text-base font-bold">
              Interactive Geolocation Radar
            </h3>
            <p className="text-xs text-muted-foreground">
              Showing {sorted.length} verified facilities. Real-time telemetry
              broadcasting active.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full mt-2">
              {sorted.slice(0, 4).map((v) => (
                <Link
                  key={v.slug || v._id || v.id}
                  href={`/venue/${v.slug}`}
                  className="p-2.5 rounded-lg border border-border bg-card/90 text-left hover:border-primary transition-colors text-xs"
                >
                  <p className="font-bold truncate">{v.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {v.averageWaitMinutes}m wait · {v.city}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((venue) => (
            <Card
              key={venue.slug || venue._id || venue.id}
              className="group hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {venue.name}
                      </h2>
                      {venue.isVerified && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 font-semibold text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60"
                        >
                          <ShieldCheck className="size-3 mr-0.5 inline" />
                          GST Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3" />
                      {venue.address}, {venue.city}
                    </p>
                  </div>
                  <QueueBadge waitMinutes={venue.averageWaitMinutes} />
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Users className="size-3" /> Waiting Count
                    </span>
                    <p className="text-sm font-bold font-mono mt-0.5">
                      {venue.totalWaitingCount} people
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Clock className="size-3" /> Average Wait
                    </span>
                    <p className="text-sm font-bold font-mono text-primary mt-0.5">
                      {venue.averageWaitMinutes} min
                    </p>
                  </div>
                </div>

                {venue.statusText && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    ⚡ {venue.statusText}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">
                    {venue.servicePoints?.length || 0} active counters
                  </span>

                  <div className="flex items-center gap-2">
                    <Link href={`/plan?venue=${venue.slug}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-primary"
                      >
                        Plan Visit
                      </Button>
                    </Link>
                    <Link href={`/venue/${venue.slug}`}>
                      <Button
                        size="sm"
                        className="h-7 text-xs px-2.5 gap-1 font-semibold"
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
