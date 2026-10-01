"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Check,
  ShieldAlert,
  SlidersHorizontal,
  Compass,
} from "lucide-react";

export function LiveDemo() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [budgetMinutes, setBudgetMinutes] = useState(60);
  const [reported, setReported] = useState(false);
  const [observationCount, setObservationCount] = useState<number>(10);

  useEffect(() => {
    async function loadVenues() {
      try {
        const res = await fetch("/api/venues");
        if (res.ok) {
          const json = await res.json();
          const items: VenueItem[] = json.data || [];
          setVenues(items);
          if (items.length > 0) {
            setSelectedSlug(items[0].slug);
            setObservationCount(items[0].totalWaitingCount || 10);
          }
        }
      } catch {}
    }
    loadVenues();
  }, []);

  const currentVenue = venues.find((v) => v.slug === selectedSlug) || venues[0];

  const steps = currentVenue?.servicePoints?.length
    ? currentVenue.servicePoints.map((sp) => ({
        label: sp.name,
        minutes: sp.estimatedWaitMinutes || 10,
      }))
    : [
        { label: "Token Verification", minutes: 10 },
        { label: "Main Counter Processing", minutes: 20 },
        { label: "Final Confirmation & Clearance", minutes: 10 },
      ];

  const totalPredicted = steps.reduce((sum, s) => sum + s.minutes, 0);
  const risk =
    totalPredicted > budgetMinutes
      ? "High"
      : totalPredicted > budgetMinutes * 0.75
        ? "Medium"
        : "Low";

  const handleReportObservation = async () => {
    if (!currentVenue?.slug) return;
    try {
      await fetch(`/api/venues/${currentVenue.slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedCount: observationCount,
          reportedWaitMinutes: totalPredicted,
          notes: "Live crowd observation from interactive radar testbed.",
          isAnonymous: true,
        }),
      });
      setReported(true);
      setTimeout(() => setReported(false), 2500);
    } catch {}
  };

  return (
    <section className="py-10 sm:py-12 border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-2 max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Interactive Testbed
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
            See the Engine in Action
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Adjust your target time budget and test wait predictions powered by
            live backend telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                  Trip Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-muted-foreground">
                    Select Facility
                  </label>
                  {venues.length > 0 ? (
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                      {venues.map((v) => (
                        <button
                          key={v.slug}
                          type="button"
                          onClick={() => {
                            setSelectedSlug(v.slug);
                            setObservationCount(v.totalWaitingCount || 10);
                          }}
                          className={`py-1.5 px-2.5 rounded-md font-medium text-xs border text-left truncate transition-colors ${
                            selectedSlug === v.slug
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:bg-muted"
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground">
                      <p className="text-xs">No registered facilities yet.</p>
                      <Link
                        href="/dashboard"
                        className="text-primary font-semibold hover:underline block mt-1"
                      >
                        Register your facility →
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-muted-foreground">
                      “I must finish within:”
                    </label>
                    <span className="font-medium text-sm text-primary">
                      {budgetMinutes} minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="5"
                    value={budgetMinutes}
                    onChange={(e) => setBudgetMinutes(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>15m (Rush)</span>
                    <span>60m (Standard)</span>
                    <span>180m (Flexible)</span>
                  </div>
                </div>

                {currentVenue && (
                  <div className="pt-2 border-t border-border">
                    <label className="font-semibold block mb-1.5 text-muted-foreground">
                      Anonymous Quick Observation
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="e.g. 15 people waiting"
                        className="flex-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs"
                        value={observationCount}
                        onChange={(e) =>
                          setObservationCount(Number(e.target.value))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={handleReportObservation}
                        className="gap-1 text-xs"
                      >
                        {reported ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Send className="size-3.5" />
                        )}
                        {reported ? "Broadcasted" : "Submit"}
                      </Button>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Broadcasted to all users viewing this venue in real-time.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-primary/30 shadow-md">
              <CardHeader className="pb-3 border-b border-border/80 flex flex-row items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Output Calculation
                  </span>
                  <CardTitle className="mt-0.5">
                    {currentVenue ? currentVenue.name : "Simulation Pipeline"}
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
                  Risk: {risk}
                </Badge>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Calculated Sequence Duration:
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {steps.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/40"
                      >
                        <span className="text-foreground font-sans font-medium">
                          {s.label}
                        </span>
                        <span className="font-bold">{s.minutes} min</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Total Expected Duration
                    </span>
                    <span className="text-2xl font-medium text-primary">
                      {totalPredicted} min
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">
                      Your Budget
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {budgetMinutes} min (
                      {budgetMinutes - totalPredicted >= 0
                        ? `+${budgetMinutes - totalPredicted}m safety`
                        : `${totalPredicted - budgetMinutes}m overdue`}
                      )
                    </span>
                  </div>
                </div>

                <div className="rounded-md bg-muted/50 p-3 text-xs flex items-start gap-2">
                  <ShieldAlert className="size-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Recommendation:</strong>{" "}
                    {risk === "High"
                      ? `Expected wait is ${totalPredicted} min, exceeding your ${budgetMinutes} min limit. Consider visiting during off-peak throughput windows.`
                      : risk === "Medium"
                        ? `Expected wait is ${totalPredicted} min against ${budgetMinutes} min budget. Manageable with slight buffer.`
                        : `Clear operational runway. Your trip is well within limits (${totalPredicted} min vs ${budgetMinutes} min budget).`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
