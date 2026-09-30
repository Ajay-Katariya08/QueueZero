"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
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
  User as UserIcon,
  Award,
  Bell,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();
  const [watchedVenues, setWatchedVenues] = useState<VenueItem[]>([]);

  useEffect(() => {
    async function loadWatched() {
      try {
        const res = await fetch("/api/venues");
        if (res.ok) {
          const json = await res.json();
          const items: VenueItem[] = json.data || [];
          setWatchedVenues(items.slice(0, 2));
        }
      } catch {}
    }
    loadWatched();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-border text-center sm:text-left">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
          {user?.firstName ? (
            user.firstName[0]
          ) : (
            <UserIcon className="size-8" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-medium">
              {user?.fullName || "Citizen Contributor"}
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] text-emerald-800 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
            >
              <ShieldCheck className="size-3 mr-1" /> Level 2 Verified Reporter
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user?.primaryEmailAddress?.emailAddress ||
              "citizen@queuezero.local"}
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="sm" variant="outline" className="text-xs font-semibold">
            Operator Console
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-xl font-medium">94</p>
              <p className="text-[11px] text-muted-foreground">
                Reputation Score
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Compass className="size-5" />
            </div>
            <div>
              <p className="text-xl font-medium">{watchedVenues.length}</p>
              <p className="text-[11px] text-muted-foreground">
                Monitored Facilities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xl font-medium">28m</p>
              <p className="text-[11px] text-muted-foreground">
                Time Saved by QueueZero
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              Frequently Watched Facilities
            </CardTitle>
            <Link href="/explore">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-primary"
              >
                Browse All
              </Button>
            </Link>
          </div>
          <CardDescription className="text-xs">
            Live queue streams for your saved places.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col gap-2">
          {watchedVenues.map((v, idx) => (
            <div
              key={v.slug || v._id || v.id || idx}
              className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20 hover:border-primary/40 transition-colors"
            >
              <div>
                <p className="font-bold text-xs">{v.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {v.address}, {v.city} · {v.totalWaitingCount} waiting
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary">
                  {v.averageWaitMinutes}m wait
                </span>
                <Link href={`/venue/${v.slug}`}>
                  <Button size="sm" variant="ghost" className="size-8 p-0">
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
