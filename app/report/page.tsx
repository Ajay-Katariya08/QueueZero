"use client";

import { useState, useEffect } from "react";
import { type VenueItem } from "@/lib/venue-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Check, Users, Clock, ShieldCheck } from "lucide-react";

export default function ReportPage() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [reportedCount, setReportedCount] = useState(15);
  const [reportedWait, setReportedWait] = useState(25);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadVenues();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlug) return;
    setSubmitting(true);

    try {
      await fetch(`/api/venues/${selectedSlug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedCount,
          reportedWaitMinutes: reportedWait,
          notes: notes || "Crowd reported from premises.",
          isAnonymous: true,
        }),
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setNotes("");
      }, 3000);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 flex flex-col gap-6">
      <div className="text-center flex flex-col items-center gap-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-xs dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
          <ShieldCheck className="size-3.5 text-emerald-700 dark:text-emerald-400" />
          100% Anonymous Citizen Broadcast
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Report Ground Reality
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
          Are you at a clinic, DMV, bank, or visa center right now? Your report updates the live radar for everyone traveling behind you.
        </p>
      </div>

      <Card className="border-border shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold">Observation Details</CardTitle>
          <CardDescription className="text-xs">
            No login or identification required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Select Place</label>
              {loading ? (
                <div className="h-9 w-full rounded-md border border-input bg-muted/40 animate-pulse" />
              ) : (
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  {venues.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.name} ({v.address})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 flex items-center gap-1">
                  <Users className="size-3" /> People in Line
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={reportedCount}
                  onChange={(e) => setReportedCount(Number(e.target.value))}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 flex items-center gap-1">
                  <Clock className="size-3" /> Estimated Wait (min)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={reportedWait}
                  onChange={(e) => setReportedWait(Number(e.target.value))}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">
                Contextual Observations
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Doctor is running 20 mins behind, counter 4 just opened, token system down..."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || submitted || loading || !selectedSlug}
              size="lg"
              className="w-full gap-2 font-semibold text-xs mt-2"
            >
              {submitted ? <Check className="size-4" /> : <Send className="size-4" />}
              {submitting ? "Broadcasting..." : submitted ? "Live Broadcast Sent!" : "Broadcast Observation Live"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
