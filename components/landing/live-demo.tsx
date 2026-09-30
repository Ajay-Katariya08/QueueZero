"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Send,
  Check,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

export function LiveDemo() {
  const [selectedVenue, setSelectedVenue] = useState<
    "clinic" | "passport" | "bank"
  >("clinic");
  const [budgetMinutes, setBudgetMinutes] = useState(90);
  const [reported, setReported] = useState(false);

  const venueConfigs = {
    clinic: {
      name: "Metro Health PolyClinic",
      steps: [
        { label: "Registration", minutes: 8 },
        { label: "Doctor Consult", minutes: 31 },
        { label: "Blood Test", minutes: 14 },
        { label: "Payment & Meds", minutes: 5 },
      ],
      currentCount: 32,
    },
    passport: {
      name: "Regional Passport Seva Kendra",
      steps: [
        { label: "Token Gate", minutes: 15 },
        { label: "Verification A", minutes: 32 },
        { label: "Biometrics B", minutes: 40 },
        { label: "Interview C", minutes: 12 },
      ],
      currentCount: 84,
    },
    bank: {
      name: "Commercial Bank Downtown",
      steps: [
        { label: "Cashier Window", minutes: 6 },
        { label: "Forex Advisory", minutes: 15 },
      ],
      currentCount: 16,
    },
  };

  const current = venueConfigs[selectedVenue];
  const totalPredicted = current.steps.reduce((sum, s) => sum + s.minutes, 0);
  const risk =
    totalPredicted > budgetMinutes
      ? "High"
      : totalPredicted > budgetMinutes * 0.75
        ? "Medium"
        : "Low";

  return (
    <section className="py-10 sm:py-12 border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-2 max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Interactive Testbed
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight">
            See the AI Engine in Action
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Adjust your target time budget and pick an operational hub. Watch
            QueueZero break down the timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                  Your Trip Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-muted-foreground">
                    Select Destination
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["clinic", "passport", "bank"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedVenue(key)}
                        className={`py-1.5 px-2 rounded-md font-medium text-xs border transition-colors capitalize ${
                          selectedVenue === key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
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
                    min="30"
                    max="180"
                    step="5"
                    value={budgetMinutes}
                    onChange={(e) => setBudgetMinutes(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>30m (Rush)</span>
                    <span>90m (Standard)</span>
                    <span>180m (Flexible)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <label className="font-semibold block mb-1.5 text-muted-foreground">
                    Anonymous Quick Observation
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 35 people waiting"
                      className="flex-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs"
                      defaultValue={current.currentCount}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        setReported(true);
                        setTimeout(() => setReported(false), 2500);
                      }}
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
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-primary/30 shadow-md">
              <CardHeader className="pb-3 border-b border-border/80 flex flex-row items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    AI Output Calculation
                  </span>
                  <CardTitle className="mt-0.5">{current.name}</CardTitle>
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
                    {current.steps.map((s, i) => (
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
                      ? "You are very likely to exceed your 90-minute limit right now. We suggest arriving after 1:30 PM when the consultation rush drops by 60%."
                      : risk === "Medium"
                        ? "Expected wait is 58 min against your 90 min budget. Doctor is running 18 min late. Safe to proceed if you leave within 10 minutes."
                        : "Clear operational runway. Your trip is well within limits."}
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
