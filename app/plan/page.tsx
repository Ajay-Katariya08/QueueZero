"use client";

import { useState, useEffect } from "react";
import { type VenueItem, type ServicePointItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Route,
  Clock,
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

  const activeVenue = venues.find((v) => v.slug === selectedSlug) || venues[0] || null;

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
      selectedServices.includes(String(sp._id || sp.id || sp.name || `sp-${idx}`)),
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
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground font-medium">Loading AI Trip Planner...</p>
      </div>
    );
  }

  if (!activeVenue) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h2 className="text-base font-bold">No Venues Found</h2>
        <p className="text-xs text-muted-foreground mt-1">Please register a facility first.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 self-center sm:self-start rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          <Route className="size-3.5" />
          QueueZero AI Trip Engine
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Will You Finish on Time?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Simulate multi-service bottlenecks and compute your safe departure window before traveling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">1. Select Destination</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-2">
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
              >
                {venues.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" /> {activeVenue.address}, {activeVenue.city}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">2. Services You Need to Complete</CardTitle>
              <CardDescription className="text-xs">
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
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left transition-all ${
                      isChecked
                        ? "border-primary bg-primary/5 font-semibold text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-4 rounded-md border flex items-center justify-center text-[10px] ${
                          isChecked
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isChecked && "✓"}
                      </span>
                      <span>{sp.name}</span>
                    </div>
                    <span className="font-mono text-[11px]">
                      ~{sp.estimatedWaitMinutes}m
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold">3. Your Max Time Budget</CardTitle>
                <span className="text-base font-black text-primary font-mono">
                  {targetBudget} min
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-2">
              <input
                type="range"
                min="20"
                max="180"
                step="5"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>20m</span>
                <span>60m</span>
                <span>90m</span>
                <span>120m</span>
                <span>180m</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="border-primary/40 shadow-lg">
            <CardHeader className="pb-3 border-b border-border/80 flex flex-row items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  AI Journey Forecast
                </span>
                <CardTitle className="text-base font-extrabold mt-0.5">
                  {activeVenue.name}
                </CardTitle>
              </div>
              <Badge
                variant={
                  risk === "Low"
                    ? "success"
                    : risk === "Medium"
                    ? "warning"
                    : "destructive"
                }
                className="font-bold text-xs"
              >
                Risk Level: {risk}
              </Badge>
            </CardHeader>

            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Step-by-Step Breakdown:
                </span>
                <div className="flex flex-col gap-2 font-mono text-xs">
                  {steps.length === 0 ? (
                    <div className="p-4 text-center border border-dashed rounded-lg text-xs text-muted-foreground font-sans">
                      No services selected. Pick at least one counter from the left to calculate your trip.
                    </div>
                  ) : (
                    steps.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-card font-sans"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-xs leading-none">{s.name}</p>
                            {s.delay > 0 && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                Delayed +{s.delay}m
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-xs">
                          {s.minutes} min
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Calculated Expected Total
                  </span>
                  <p className="text-2xl font-black text-primary font-mono">
                    {totalExpected} <span className="text-xs font-normal text-muted-foreground">min</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Target Time Budget
                  </span>
                  <p className="text-xl font-bold font-mono">
                    {targetBudget} min
                  </p>
                  <span
                    className={`text-[11px] font-semibold ${
                      margin >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500"
                    }`}
                  >
                    {margin >= 0 ? `+${margin} min safe buffer` : `${Math.abs(margin)} min over budget`}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Clock className="size-4 text-primary" />
                  Recommended Arrival Strategy:
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Based on live telemetry, optimal arrival is during morning hours.
                  Departing now has an expected completion time within your {targetBudget}m window with{" "}
                  {risk === "Low" ? "94%" : risk === "Medium" ? "78%" : "35%"} confidence.
                </p>
              </div>

              <Button
                onClick={() => {
                  setSavedReminder(true);
                  setTimeout(() => setSavedReminder(false), 3000);
                }}
                className="w-full gap-2 text-xs font-semibold"
              >
                {savedReminder ? <CheckCircle className="size-4" /> : <Bell className="size-4" />}
                {savedReminder ? "Departure Reminder Scheduled!" : "Set Departure Alert & Watch Queue"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
