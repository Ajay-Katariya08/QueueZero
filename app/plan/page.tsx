"use client";

import { useState, useEffect } from "react";
import { type VenueItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Route,
  CheckCircle,
  Bell,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function PlannerPage() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [targetBudget, setTargetBudget] = useState(60);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [savedReminder, setSavedReminder] = useState(false);

  useEffect(() => {
    async function loadVenues() {
      try {
        setLoading(true);
        const res = await fetch("/api/venues");
        if (res.ok) {
          const json = await res.json();
          const items: VenueItem[] = json.data || [];
          setVenues(items);
          if (items.length > 0) {
            setSelectedSlug(items[0].slug);
            const initialKeys = (items[0].servicePoints || []).map((sp, idx) =>
              String(sp._id || sp.id || sp.name || `sp-${idx}`),
            );
            setSelectedServices(initialKeys);
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadVenues();
  }, []);

  const activeVenue =
    venues.find((v) => v.slug === selectedSlug) || venues[0] || null;

  useEffect(() => {
    if (activeVenue) {
      const keys = (activeVenue.servicePoints || []).map((sp, idx) =>
        String(sp._id || sp.id || sp.name || `sp-${idx}`),
      );
      setSelectedServices(keys);
    }
  }, [selectedSlug]);

  const toggleService = (key: string) => {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  };

  const steps = (activeVenue?.servicePoints || [])
    .filter((sp, idx) =>
      selectedServices.includes(
        String(sp._id || sp.id || sp.name || `sp-${idx}`),
      ),
    )
    .map((sp) => ({
      name: sp.name,
      type: sp.type,
      minutes: sp.estimatedWaitMinutes || 10,
      delay: sp.delayMinutes || 0,
      status: sp.status,
    }));

  const totalExpected = steps.reduce((sum, s) => sum + s.minutes, 0);
  const margin = targetBudget - totalExpected;
  const risk =
    totalExpected > targetBudget
      ? "High"
      : totalExpected > targetBudget * 0.75
        ? "Medium"
        : "Low";

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center bg-cream">
        <div className="size-8 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-charcoal/70">
          Loading Trip Planner...
        </p>
      </div>
    );
  }

  if (!activeVenue) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center bg-cream">
        <div className="rounded-[14px] bg-keylime p-8">
          <h2 className="font-serif text-2xl font-light text-forest">No Venues Found</h2>
          <p className="text-xs text-charcoal/70 mt-2">
            Please register a facility first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-12 flex flex-col gap-8 bg-cream">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest">
          QUEUEZERO TRIP ENGINE
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-[-0.03em] text-forest">
          Will You Finish on Time?
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">
          Simulate multi-service bottlenecks and compute your safe departure window before traveling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="rounded-[14px] bg-keylime border-0 shadow-none p-2">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-light text-forest">
                1. Select Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-2.5">
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full h-11 rounded-[14px] border border-border-mist bg-cream px-4 text-xs font-normal text-forest focus-visible:outline-none"
              >
                {venues.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
              <p className="text-xs text-charcoal/70 flex items-center gap-1.5 pl-1">
                <MapPin className="size-3.5 text-forest" /> {activeVenue.address},{" "}
                {activeVenue.city}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[14px] bg-keylime border-0 shadow-none p-2">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg font-light text-forest">
                2. Services You Need to Complete
              </CardTitle>
              <CardDescription className="text-xs text-charcoal/70">
                Pick all counters you plan to visit during this trip.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-2">
              {(activeVenue.servicePoints || []).map((sp, idx) => {
                const spKey = String(sp._id || sp.id || sp.name || `sp-${idx}`);
                const isChecked = selectedServices.includes(spKey);
                return (
                  <button
                    key={spKey}
                    type="button"
                    onClick={() => toggleService(spKey)}
                    className={`flex items-center justify-between p-3.5 rounded-[14px] text-xs font-normal transition-all text-left ${
                      isChecked
                        ? "bg-forest text-cream"
                        : "bg-cream text-charcoal hover:bg-mint"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`size-4 rounded-full border flex items-center justify-center ${
                          isChecked
                            ? "border-cream bg-cream text-forest"
                            : "border-border-mist bg-cream"
                        }`}
                      >
                        {isChecked && <CheckCircle className="size-3" />}
                      </span>
                      <span>{sp.name}</span>
                    </div>
                    <span className="font-mono text-xs font-light">
                      {sp.estimatedWaitMinutes}m
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-[14px] bg-keylime border-0 shadow-none p-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-lg font-light text-forest">
                  3. Your Maximum Time Budget
                </CardTitle>
                <span className="font-serif text-lg font-light text-forest">
                  {targetBudget} min
                </span>
              </div>
              <CardDescription className="text-xs text-charcoal/70">
                When must you leave the premises to stay on schedule?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <input
                type="range"
                min="20"
                max="180"
                step="5"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Number(e.target.value))}
                className="w-full accent-forest h-2 bg-cream rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-charcoal/70 mt-2 font-normal">
                <span>20m</span>
                <span>60m</span>
                <span>90m</span>
                <span>120m</span>
                <span>180m</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="rounded-[14px] bg-slate-hush border-0 shadow-none p-4">
            <CardHeader className="pb-4 border-b border-cream/30 flex flex-row items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest">
                  JOURNEY FORECAST
                </span>
                <CardTitle className="font-serif text-2xl font-light mt-1 text-forest">
                  {activeVenue.name}
                </CardTitle>
              </div>
              <span
                className="px-3.5 py-1 text-xs font-normal rounded-full bg-cream text-forest border border-border-mist"
              >
                Risk Level: {risk}
              </span>
            </CardHeader>

            <CardContent className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold text-forest uppercase tracking-[0.08em]">
                  STEP-BY-STEP BREAKDOWN
                </span>
                <div className="flex flex-col gap-2 text-xs">
                  {steps.length === 0 ? (
                    <div className="p-6 text-center rounded-[14px] bg-cream text-xs text-charcoal/70">
                      No services selected. Pick at least one counter from the left to calculate your trip.
                    </div>
                  ) : (
                    steps.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-[14px] bg-cream text-forest"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-6 items-center justify-center rounded-full bg-forest text-cream text-[11px] font-normal">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-normal text-xs text-forest">
                              {s.name}
                            </p>
                            {s.delay > 0 && (
                              <span className="text-[10px] text-forest/80">
                                Delayed +{s.delay}m
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-light text-forest">
                          {s.minutes} min
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-5 rounded-[14px] bg-cream text-forest">
                <div>
                  <span className="text-xs text-charcoal/70 block font-normal">
                    Calculated Expected Total
                  </span>
                  <p className="font-serif text-3xl font-light text-forest font-mono mt-1">
                    {totalExpected}{" "}
                    <span className="text-xs font-sans text-charcoal/70">
                      min
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-charcoal/70 block font-normal">
                    Target Time Budget
                  </span>
                  <p className="font-serif text-3xl font-light text-forest font-mono mt-1">
                    {targetBudget}{" "}
                    <span className="text-xs font-sans text-charcoal/70">
                      min
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-mint text-xs flex items-start gap-3">
                <ShieldCheck className="size-5 text-forest shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-forest font-normal block mb-0.5">
                    {risk === "High"
                      ? "Warning: Budget Exceeded"
                      : risk === "Medium"
                        ? "Moderate Tightness"
                        : "Optimal Window"}
                  </strong>
                  <p className="text-charcoal/80">
                    {risk === "High"
                      ? `Expected visit time of ${totalExpected}m exceeds your ${targetBudget}m budget by ${totalExpected - targetBudget} minutes.`
                      : risk === "Medium"
                        ? `Expected visit time of ${totalExpected}m leaves a narrow ${margin}m safety margin. Arrive promptly.`
                        : `Comfortable safety runway: expected ${totalExpected}m total against ${targetBudget}m budget (${margin}m buffer).`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSavedReminder(true);
                    setTimeout(() => setSavedReminder(false), 3000);
                  }}
                  className="w-full rounded-[14px] bg-forest text-cream hover:bg-forest-shadow border-0 h-11 text-xs font-normal"
                >
                  <Bell className="size-4 mr-1.5" />
                  {savedReminder ? "Departure Reminder Saved!" : "Notify When Queue Surges"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
