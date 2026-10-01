"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  Check,
  ShieldAlert,
  SlidersHorizontal,
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
    <section className="py-8 sm:py-10 bg-cream">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-2 max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="eyebrow">
            INTERACTIVE RADAR
          </span>
          <h2 className="font-serif font-light text-3xl sm:text-5xl text-forest leading-tight">
            See the calculation engine in action
          </h2>
          <p className="text-sm sm:text-base text-charcoal/80 leading-relaxed font-normal">
            Adjust your target time budget and test wait predictions powered by live backend telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-[14px] bg-keylime shadow-none border-0 p-6">
              <div className="pb-4 mb-4 border-b border-forest/10 flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-forest" />
                <h3 className="font-serif font-light text-xl text-forest">
                  Trip Parameters
                </h3>
              </div>
              <div className="flex flex-col gap-5 text-xs">
                <div>
                  <label className="font-medium block mb-2 text-forest">
                    Select Facility
                  </label>
                  {venues.length > 0 ? (
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                      {venues.map((v) => (
                        <button
                          key={v.slug}
                          type="button"
                          onClick={() => {
                            setSelectedSlug(v.slug);
                            setObservationCount(v.totalWaitingCount || 10);
                          }}
                          className={`py-2 px-3.5 rounded-[14px] font-normal text-xs text-left truncate transition-colors ${
                            selectedSlug === v.slug
                              ? "bg-forest text-cream"
                              : "bg-cream text-forest hover:bg-mint"
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-[14px] bg-cream text-center text-charcoal/70">
                      <p className="text-xs">No registered facilities yet.</p>
                      <Link
                        href="/dashboard"
                        className="text-forest font-medium hover:underline block mt-1.5"
                      >
                        Register your facility →
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-medium text-forest">
                      “I must finish within:”
                    </label>
                    <span className="font-serif text-lg font-light text-forest">
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
                    className="w-full accent-forest h-2 bg-cream rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-charcoal/60 mt-1.5">
                    <span>15m (Rush)</span>
                    <span>60m (Standard)</span>
                    <span>180m (Flexible)</span>
                  </div>
                </div>

                {currentVenue && (
                  <div className="pt-4 border-t border-forest/10">
                    <label className="font-medium block mb-2 text-forest">
                      Anonymous Quick Observation
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="e.g. 15 people waiting"
                        className="flex-1 rounded-[14px] bg-cream border border-border-mist px-4 py-2 text-xs text-charcoal focus:outline-none"
                        value={observationCount}
                        onChange={(e) =>
                          setObservationCount(Number(e.target.value))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={handleReportObservation}
                        className="rounded-[14px] bg-forest text-cream hover:bg-forest-shadow border-0 px-5 text-xs font-medium"
                      >
                        {reported ? (
                          <Check className="size-3.5 mr-1" />
                        ) : (
                          <Send className="size-3.5 mr-1" />
                        )}
                        {reported ? "Broadcasted" : "Submit"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[14px] bg-slate-hush shadow-none border-0 p-6 text-charcoal">
              <div className="pb-4 border-b border-cream/30 flex flex-row items-center justify-between">
                <div>
                  <span className="eyebrow text-forest/70">
                    OUTPUT CALCULATION
                  </span>
                  <h3 className="font-serif font-light text-2xl mt-1 text-forest">
                    {currentVenue ? currentVenue.name : "Simulation Pipeline"}
                  </h3>
                </div>
                <span className="px-3.5 py-1 text-xs font-normal rounded-full bg-cream text-forest border border-border-mist">
                  Risk Level: {risk}
                </span>
              </div>
              <div className="pt-6 flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-medium text-forest uppercase tracking-wider">
                    Calculated Sequence Duration
                  </span>
                  <div className="space-y-2 text-xs">
                    {steps.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-[14px] bg-cream"
                      >
                        <span className="text-forest font-normal">
                          {s.label}
                        </span>
                        <span className="font-medium text-forest font-mono">
                          {s.minutes} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-[14px] bg-cream">
                  <div>
                    <span className="text-xs text-charcoal/70 block font-normal">
                      Total Expected Duration
                    </span>
                    <span className="font-serif text-3xl font-light text-forest">
                      {totalPredicted} min
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-charcoal/70 block font-normal">
                      Your Budget
                    </span>
                    <span className="text-sm font-medium text-forest">
                      {budgetMinutes} min (
                      {budgetMinutes - totalPredicted >= 0
                        ? `+${budgetMinutes - totalPredicted}m buffer`
                        : `${totalPredicted - budgetMinutes}m overdue`}
                      )
                    </span>
                  </div>
                </div>

                <div className="rounded-[14px] bg-keylime p-4 text-xs flex items-start gap-3">
                  <ShieldAlert className="size-5 text-forest shrink-0 mt-0.5" />
                  <p className="text-charcoal/80 leading-relaxed">
                    <strong className="text-forest">Recommendation:</strong>{" "}
                    {risk === "High"
                      ? `Expected wait is ${totalPredicted} min, exceeding your ${budgetMinutes} min limit. Consider arriving at an off-peak window.`
                      : risk === "Medium"
                        ? `Expected wait is ${totalPredicted} min against your ${budgetMinutes} min budget. Manageable with slight buffer.`
                        : `Clear operational runway. Your trip is well within limits (${totalPredicted} min vs ${budgetMinutes} min budget).`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
