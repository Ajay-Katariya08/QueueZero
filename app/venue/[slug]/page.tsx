"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { type VenueItem, type ServicePointItem, type QueueReportItem, type HourlyStatItem } from "@/lib/venue-types";
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
        setVenue((prev) =>
          prev
            ? {
                ...prev,
                totalWaitingCount: Math.round(((prev.totalWaitingCount || 0) + Number(reportCount)) / 2),
                averageWaitMinutes: Math.round(((prev.averageWaitMinutes || 0) + Number(reportWait)) / 2),
              }
            : null,
        );
      }
    } catch {
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDialogOpen(false);
        setReportNotes("");
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground font-medium">Connecting to facility live radar...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h2 className="text-lg font-bold">Facility Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          This venue may have been removed or is not yet registered.
        </p>
        <Link href="/explore">
          <Button size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" /> Back to Radar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">
              {venue.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Radio className="size-2.5 animate-pulse text-emerald-600 dark:text-emerald-400" />
              Live Socket.IO Stream
            </span>
            {venue.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                <ShieldCheck className="size-3" />
                GST Verified {venue.gstNumber ? `(${venue.gstNumber})` : ""}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{venue.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="size-3.5" />
            {venue.address}, {venue.city}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-semibold h-8 px-3 bg-primary text-white shadow-xs hover:bg-primary/90 transition-colors cursor-pointer">
              <PlusCircle className="size-3.5" />
              Report Observation
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Anonymous Live Queue Observation</DialogTitle>
                <DialogDescription className="text-xs">
                  Help others know before they go. Your report updates the live radar instantly.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2 text-xs">
                <div>
                  <label className="font-semibold block mb-1">
                    How many people waiting in your line?
                  </label>
                  <input
                    type="number"
                    value={reportCount}
                    onChange={(e) => setReportCount(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Estimated wait from your observation (minutes):
                  </label>
                  <input
                    type="number"
                    value={reportWait}
                    onChange={(e) => setReportWait(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Optional notes (e.g. Doctor arrived late, counter 2 closed):
                  </label>
                  <textarea
                    rows={2}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Describe current ground conditions..."
                    className="w-full rounded-md border border-input bg-background p-2 text-xs"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleReportSubmit}
                  disabled={submitting || submitted}
                  className="w-full gap-2 text-xs font-semibold"
                >
                  {submitted ? <Check className="size-4" /> : <Send className="size-4" />}
                  {submitting ? "Broadcasting..." : submitted ? "Broadcasted Live!" : "Submit Anonymous Observation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href={`/plan?venue=${venue.slug}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <Route className="size-3.5 text-primary" />
              AI Trip Planner
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Users className="size-3.5" /> Total Waiting Now
              </span>
              <p className="text-2xl font-black mt-0.5">
                {latestUpdate ? latestUpdate.newQueueCount : venue.totalWaitingCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">citizens</span>
              </p>
            </div>
            <span className="size-3 rounded-full bg-emerald-500 animate-ping" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="size-3.5" /> Average Visit Wait
              </span>
              <p className="text-2xl font-black mt-0.5 text-amber-600 dark:text-amber-400">
                {latestUpdate ? latestUpdate.newEstimatedMinutes : venue.averageWaitMinutes}{" "}
                <span className="text-xs font-normal text-muted-foreground">min</span>
              </p>
            </div>
            <QueueBadge waitMinutes={venue.averageWaitMinutes} />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <AlertTriangle className="size-3.5 text-amber-500" /> Active Alert
            </span>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1 truncate">
              {venue.statusText || "All counters operating normally"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {venue.bestVisitingTime || "Best window: 8:30 AM – 10:30 AM"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Individual Service Point Health</h2>
          <span className="text-xs text-muted-foreground">
            Updated in real-time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(venue.servicePoints || []).map((sp: ServicePointItem, idx: number) => (
            <Card key={sp._id || sp.id || sp.name || idx} className="border-border/80">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{sp.name}</h3>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      Type: {sp.type}
                    </span>
                  </div>
                  <Badge
                    variant={
                      sp.status === "open"
                        ? "success"
                        : sp.status === "delayed"
                        ? "warning"
                        : "destructive"
                    }
                    className="capitalize text-[10px]"
                  >
                    {sp.status === "delayed"
                      ? `Delayed +${sp.delayMinutes}m`
                      : sp.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">
                      Queue Length
                    </span>
                    <strong className="text-sm font-black">{sp.currentQueueCount} people</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">
                      Expected Wait
                    </span>
                    <strong className="text-sm font-black text-primary">
                      {sp.estimatedWaitMinutes} min
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <TrendingDown className="size-4 text-primary" />
                  Historical Hourly Wait Heatmap
                </CardTitle>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Dynamic throughput curve
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-end gap-1.5 h-36 pt-4 border-b border-border pb-2">
                {stats.map((stat, i) => {
                  const heightPercent = Math.min(100, Math.max(15, (stat.waitMinutes / 80) * 100));
                  const isLow = stat.busyness === "low";
                  const isPeak = stat.busyness === "peak";

                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative"
                    >
                      <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                        {stat.waitMinutes}m
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          isPeak
                            ? "bg-red-500/80 group-hover:bg-red-500"
                            : isLow
                            ? "bg-emerald-500/80 group-hover:bg-emerald-500"
                            : "bg-primary/70 group-hover:bg-primary"
                        }`}
                      />
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                        {stat.label.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-xs bg-emerald-500" /> Low Rush (Best time)
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-xs bg-primary" /> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-xs bg-red-500" /> Peak Surge
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Users className="size-4 text-primary" />
                Crowd Observations
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {reportsList.length} submitted
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col gap-2 max-h-56 overflow-y-auto">
              {reportsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No citizen observations submitted recently. Be the first to report!
                </div>
              ) : (
                reportsList.map((rep, idx) => (
                  <div
                    key={rep._id || rep.id || idx}
                    className="rounded-lg border border-border/80 bg-muted/20 p-2.5 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {rep.servicePointName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {rep.timeAgo}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      “{rep.notes}”
                    </p>
                    <div className="flex gap-2 text-[10px] font-semibold text-foreground/80 mt-0.5">
                      <span>Saw: {rep.reportedCount} waiting</span>
                      <span>·</span>
                      <span className="text-primary">Est: {rep.reportedWaitMinutes}m</span>
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
