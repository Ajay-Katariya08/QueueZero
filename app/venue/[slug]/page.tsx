"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  type VenueItem,
  type ServicePointItem,
  type QueueReportItem,
  type HourlyStatItem,
} from "@/lib/venue-types";
import { useLiveQueue } from "@/lib/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QueueBadge } from "@/components/shared/queue-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  PlusCircle,
  Route,
  Send,
  Check,
  TrendingDown,
  Radio,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [venue, setVenue] = useState<VenueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HourlyStatItem[]>([]);
  const { latestUpdate } = useLiveQueue(slug);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportCount, setReportCount] = useState(10);
  const [reportWait, setReportWait] = useState(15);
  const [reportNotes, setReportNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportsList, setReportsList] = useState<QueueReportItem[]>([]);

  useEffect(() => {
    async function loadVenueData() {
      try {
        setLoading(true);
        const [venueRes, statsRes] = await Promise.all([
          fetch(`/api/venues/${slug}`),
          fetch(`/api/venues/${slug}/stats`),
        ]);

        if (venueRes.ok) {
          const json = await venueRes.json();
          const v: VenueItem = json.data;
          setVenue(v);
          setReportCount(v.totalWaitingCount || 10);
          setReportWait(v.averageWaitMinutes || 15);
          if (Array.isArray(v.recentReports)) {
            setReportsList(v.recentReports);
          }
        }

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.data?.hourlyStats) {
            setStats(statsJson.data.hourlyStats);
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadVenueData();
  }, [slug]);

  const handleReportSubmit = async () => {
    if (!venue) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/venues/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedCount: Number(reportCount),
          reportedWaitMinutes: Number(reportWait),
          notes: reportNotes || "Crowd reported from premises.",
          isAnonymous: true,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const createdReport: QueueReportItem = json.data || {
          id: `rep-${Date.now()}`,
          reportedCount: Number(reportCount),
          reportedWaitMinutes: Number(reportWait),
          servicePointName: "Live Citizen Observation",
          notes: reportNotes || "Crowd observed from facility.",
          timeAgo: "Just now",
          isAnonymous: true,
        };

        setReportsList((prev) => [createdReport, ...prev]);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setDialogOpen(false);
          setReportNotes("");
        }, 1500);
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center bg-[#fffefc]">
        <div className="size-8 border-2 border-[#0f3e17] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#222222]/70">
          Connecting to facility live radar...
        </p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center bg-[#fffefc]">
        <div className="rounded-[14px] bg-[#e1f4df] p-8">
          <h2 className="font-serif text-2xl font-light text-[#0f3e17]">Facility Not Found</h2>
          <p className="text-xs text-[#222222]/70 mt-2 mb-5">
            This venue may have been removed or is not yet registered.
          </p>
          <Link href="/explore">
            <Button size="sm" className="rounded-[14px] bg-[#0f3e17] text-[#fffefc] hover:bg-[#0c2f10] gap-1.5 text-xs font-normal border-0">
              <ArrowLeft className="size-3.5" /> Back to Radar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 sm:py-12 flex flex-col gap-8 bg-[#fffefc]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0f3e17] bg-[#fffefc] border border-[#efeeeb] px-3 py-1 rounded-full">
              {venue.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#cfe7d3] px-3 py-1 text-[11px] font-normal text-[#0f3e17]">
              <Radio className="size-3 text-[#0f3e17]" />
              Live Stream
            </span>
            {venue.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e1f4df] px-3 py-1 text-[11px] font-normal text-[#0f3e17]">
                <ShieldCheck className="size-3 text-[#0f3e17]" />
                GST Verified {venue.gstNumber ? `(${venue.gstNumber})` : ""}
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-[-0.03em] text-[#0f3e17]">
            {venue.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#222222]/70 flex items-center gap-1.5 mt-1.5">
            <MapPin className="size-3.5 text-[#0f3e17]" />
            {venue.address}, {venue.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[14px] text-xs font-normal h-11 px-5 bg-[#0f3e17] text-[#fffefc] hover:bg-[#0c2f10] transition-colors cursor-pointer border-0">
              <PlusCircle className="size-4" />
              Report Observation
            </DialogTrigger>
            <DialogContent className="rounded-[14px] bg-[#fffefc] border border-[#efeeeb] p-6">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl font-light text-[#0f3e17]">Anonymous Live Queue Observation</DialogTitle>
                <DialogDescription className="text-xs text-[#222222]/70">
                  Help others know before they go. Your report updates the live radar instantly.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2 text-xs">
                <div>
                  <label className="font-normal block mb-1 text-[#0f3e17]">
                    How many people waiting in your line?
                  </label>
                  <input
                    type="number"
                    value={reportCount}
                    onChange={(e) => setReportCount(Number(e.target.value))}
                    className="w-full h-10 rounded-[14px] border border-[#efeeeb] bg-[#fffefc] px-4 text-xs text-[#222222] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-normal block mb-1 text-[#0f3e17]">
                    Estimated wait from your observation (minutes):
                  </label>
                  <input
                    type="number"
                    value={reportWait}
                    onChange={(e) => setReportWait(Number(e.target.value))}
                    className="w-full h-10 rounded-[14px] border border-[#efeeeb] bg-[#fffefc] px-4 text-xs text-[#222222] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-normal block mb-1 text-[#0f3e17]">
                    Optional notes (e.g. Doctor arrived late, counter 2 closed):
                  </label>
                  <textarea
                    rows={2}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Describe current ground conditions..."
                    className="w-full rounded-[14px] border border-[#efeeeb] bg-[#fffefc] p-3 text-xs text-[#222222] focus:outline-none"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleReportSubmit}
                  disabled={submitting || submitted}
                  className="w-full gap-2 text-xs font-normal rounded-[14px] bg-[#0f3e17] text-[#fffefc] hover:bg-[#0c2f10] border-0 h-11"
                >
                  {submitted ? (
                    <Check className="size-4" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {submitting
                    ? "Broadcasting..."
                    : submitted
                      ? "Broadcasted Live!"
                      : "Submit Anonymous Observation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href={`/plan?venue=${venue.slug}`}>
            <Button
              variant="outline"
              size="default"
              className="gap-1.5 text-xs font-normal rounded-[14px] border border-[#efeeeb] bg-[#fffefc] text-[#0f3e17] hover:bg-[#cfe7d3] h-11 px-5"
            >
              <Route className="size-3.5" />
              Trip Planner
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="rounded-[14px] bg-[#e1f4df] border-0 shadow-none p-2">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#0f3e17] font-normal flex items-center gap-1.5">
                <Users className="size-4" /> Total Waiting Now
              </span>
              <p className="font-serif text-4xl font-light mt-1 text-[#0f3e17]">
                {latestUpdate
                  ? latestUpdate.newQueueCount
                  : venue.totalWaitingCount}{" "}
                <span className="text-xs font-sans text-[#222222]/70">
                  citizens
                </span>
              </p>
            </div>
            <span className="size-3 rounded-full bg-[#0f3e17] animate-pulse" />
          </CardContent>
        </Card>

        <Card className="rounded-[14px] bg-[#cfe7d3] border-0 shadow-none p-2">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#0f3e17] font-normal flex items-center gap-1.5">
                <Clock className="size-4" /> Average Visit Wait
              </span>
              <p className="font-serif text-4xl font-light mt-1 text-[#0f3e17]">
                {latestUpdate
                  ? latestUpdate.newEstimatedMinutes
                  : venue.averageWaitMinutes}{" "}
                <span className="text-xs font-sans text-[#222222]/70">
                  min
                </span>
              </p>
            </div>
            <QueueBadge waitMinutes={venue.averageWaitMinutes} />
          </CardContent>
        </Card>

        <Card className="rounded-[14px] bg-[#b6ced5] border-0 shadow-none p-2">
          <CardContent className="p-6">
            <span className="text-xs text-[#0f3e17] font-normal flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-[#0f3e17]" /> Active Alert
            </span>
            <p className="font-serif text-lg font-light text-[#0f3e17] mt-1 truncate">
              {venue.statusText || "All counters operating normally"}
            </p>
            <p className="text-[11px] text-[#222222]/70 mt-1">
              {venue.bestVisitingTime || "Best window: 8:30 AM – 10:30 AM"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-light text-[#0f3e17]">Individual Service Point Health</h2>
          <span className="text-xs text-[#222222]/70">
            Updated in real-time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(venue.servicePoints || []).map(
            (sp: ServicePointItem, idx: number) => (
              <Card
                key={sp._id || sp.id || sp.name || idx}
                className="rounded-[14px] bg-[#e1f4df] border-0 shadow-none p-2"
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-light text-[#0f3e17]">{sp.name}</h3>
                      <span className="text-[11px] text-[#222222]/70 capitalize">
                        Type: {sp.type}
                      </span>
                    </div>
                    <Badge
                      variant={
                        sp.status === "open"
                          ? "success"
                          : sp.status === "delayed"
                            ? "warning"
                            : "slate"
                      }
                      className="capitalize text-xs font-normal"
                    >
                      {sp.status === "delayed"
                        ? `Delayed +${sp.delayMinutes}m`
                        : sp.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-[14px] bg-[#fffefc] p-3.5 text-xs">
                    <div>
                      <span className="text-[#222222]/70 text-[10px] block font-normal">
                        Queue Length
                      </span>
                      <strong className="text-base font-light font-mono text-[#0f3e17]">
                        {sp.currentQueueCount} people
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#222222]/70 text-[10px] block font-normal">
                        Expected Wait
                      </span>
                      <strong className="text-base font-light font-mono text-[#0f3e17]">
                        {sp.estimatedWaitMinutes} min
                      </strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="rounded-[14px] bg-[#cfe7d3] border-0 shadow-none p-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-lg font-light flex items-center gap-2 text-[#0f3e17]">
                  <TrendingDown className="size-4 text-[#0f3e17]" />
                  Historical Hourly Wait Heatmap
                </CardTitle>
                <span className="text-xs text-[#222222]/70">
                  Dynamic throughput curve
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-end gap-2 h-40 pt-6 border-b border-[#b1dbb8]/40 pb-2">
                {stats.map((stat, i) => {
                  const heightPercent = Math.min(
                    100,
                    Math.max(15, (stat.waitMinutes / 80) * 100),
                  );
                  const isLow = stat.busyness === "low";
                  const isPeak = stat.busyness === "peak";

                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                    >
                      <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 text-[#0f3e17]">
                        {stat.waitMinutes}m
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-[6px] transition-all ${
                          isPeak
                            ? "bg-[#0f3e17]"
                            : isLow
                              ? "bg-[#fffefc]"
                              : "bg-[#b1dbb8]"
                        }`}
                      />
                      <span className="text-[10px] text-[#222222]/70 truncate w-full text-center">
                        {stat.label.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-[#222222]/70 pt-3">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#fffefc] border border-[#efeeeb]" /> Low Rush
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#b1dbb8]" /> Moderate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#0f3e17]" /> Peak Surge
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="rounded-[14px] bg-[#e1f4df] border-0 shadow-none p-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-lg font-light flex items-center gap-2 text-[#0f3e17]">
                <Users className="size-4 text-[#0f3e17]" />
                Crowd Observations
              </CardTitle>
              <Badge variant="default" className="text-xs font-normal">
                {reportsList.length} submitted
              </Badge>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex flex-col gap-2.5 max-h-64 overflow-y-auto">
              {reportsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#222222]/70">
                  No citizen observations submitted recently. Be the first to report!
                </div>
              ) : (
                reportsList.map((rep, idx) => (
                  <div
                    key={rep._id || rep.id || idx}
                    className="rounded-[14px] bg-[#fffefc] p-3 text-xs flex flex-col gap-1 text-[#0f3e17]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-normal text-[#0f3e17]">
                        {rep.servicePointName}
                      </span>
                      <span className="text-[10px] text-[#222222]/60">
                        {rep.timeAgo}
                      </span>
                    </div>
                    <p className="text-[#222222]/80 text-xs leading-relaxed">
                      “{rep.notes}”
                    </p>
                    <div className="flex gap-2 text-[11px] text-[#222222]/70 mt-0.5">
                      <span>Saw: {rep.reportedCount} waiting</span>
                      <span>·</span>
                      <span className="text-[#0f3e17]">
                        Est: {rep.reportedWaitMinutes}m
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
