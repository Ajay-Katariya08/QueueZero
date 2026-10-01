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
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10 sm:py-14 flex flex-col gap-8 bg-cream">
      <div className="text-center flex flex-col items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest rounded-full bg-cream border border-border-mist px-3.5 py-1">
          100% ANONYMOUS CITIZEN BROADCAST
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-[-0.03em] text-forest">
          Report Ground Reality
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/75 max-w-md leading-relaxed">
          Are you at a clinic, DMV, bank, or visa center right now? Your report
          updates the live radar for everyone traveling behind you.
        </p>
      </div>

      <Card className="rounded-[14px] bg-keylime border-0 shadow-none p-4">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-2xl font-light text-forest">
            Observation Details
          </CardTitle>
          <CardDescription className="text-xs text-charcoal/70">
            No login or identification required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
            <div>
              <label className="font-normal block mb-1.5 text-forest">Select Place</label>
              {loading ? (
                <div className="h-11 w-full rounded-[14px] bg-mint animate-pulse" />
              ) : venues.length === 0 ? (
                <div className="rounded-[14px] bg-cream p-4 text-center text-charcoal/70 text-xs">
                  No registered facilities available to report yet.
                </div>
              ) : (
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full h-11 rounded-[14px] border border-border-mist bg-cream px-4 text-xs font-normal text-forest focus:outline-none"
                >
                  {venues.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.name} ({v.address})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-normal block mb-1.5 flex items-center gap-1.5 text-forest">
                  <Users className="size-3.5 text-forest" /> People in Line
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={reportedCount}
                  onChange={(e) => setReportedCount(Number(e.target.value))}
                  className="w-full h-11 rounded-[14px] border border-border-mist bg-cream px-4 font-mono text-sm text-forest focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-normal block mb-1.5 flex items-center gap-1.5 text-forest">
                  <Clock className="size-3.5 text-forest" /> Estimated Wait (min)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={reportedWait}
                  onChange={(e) => setReportedWait(Number(e.target.value))}
                  className="w-full h-11 rounded-[14px] border border-border-mist bg-cream px-4 font-mono text-sm text-forest focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-normal block mb-1.5 text-forest">
                Contextual Observations
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Doctor is running 20 mins behind, counter 4 just opened, token system down..."
                className="w-full rounded-[14px] border border-border-mist bg-cream p-3 text-xs leading-relaxed text-charcoal focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || submitted || loading || !selectedSlug}
              size="lg"
              className="w-full gap-2 font-normal text-xs mt-2 rounded-[14px] bg-forest text-cream hover:bg-forest-shadow border-0 h-11"
            >
              {submitted ? (
                <Check className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {submitting
                ? "Broadcasting..."
                : submitted
                  ? "Live Broadcast Sent!"
                  : "Broadcast Observation Live"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
