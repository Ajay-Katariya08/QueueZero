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
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10 sm:py-14 flex flex-col gap-8 bg-[#fffefc]">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-[#efeeeb] text-center sm:text-left">
        <div className="flex size-16 items-center justify-center rounded-[14px] bg-[#0f3e17] text-[#fffefc] text-2xl font-light">
          {user?.firstName ? (
            user.firstName[0]
          ) : (
            <UserIcon className="size-8" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#0f3e17]">
              {user?.fullName || "Citizen Contributor"}
            </h1>
            <Badge
              variant="default"
              className="text-[11px] font-normal"
            >
              <ShieldCheck className="size-3 mr-1" /> Level 2 Verified Reporter
            </Badge>
          </div>
          <p className="text-xs text-[#222222]/70 mt-1">
            {user?.primaryEmailAddress?.emailAddress ||
              "citizen@queuezero.local"}
          </p>
        </div>
        <Link href="/dashboard">
          <Button size="sm" variant="outline" className="text-xs font-normal rounded-[14px] border border-[#efeeeb] bg-[#fffefc] text-[#0f3e17] hover:bg-[#cfe7d3] px-5 py-2">
            Operator Console
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-[14px] bg-[#e1f4df] shadow-none border-0 p-2">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#fffefc] text-[#0f3e17]">
              <Award className="size-5" />
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-[#0f3e17]">94</p>
              <p className="text-xs text-[#222222]/70 font-normal">
                Reputation Score
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[14px] bg-[#cfe7d3] shadow-none border-0 p-2">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#fffefc] text-[#0f3e17]">
              <Compass className="size-5" />
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-[#0f3e17]">{watchedVenues.length}</p>
              <p className="text-xs text-[#222222]/70 font-normal">
                Monitored Facilities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[14px] bg-[#b6ced5] shadow-none border-0 p-2">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#fffefc] text-[#0f3e17]">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="font-serif text-3xl font-light text-[#0f3e17]">28m</p>
              <p className="text-xs text-[#222222]/70 font-normal">
                Time Saved by QueueZero
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[14px] bg-[#e1f4df] border-0 shadow-none p-3">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-xl font-light flex items-center gap-2 text-[#0f3e17]">
              <Bell className="size-4 text-[#0f3e17]" />
              Frequently Watched Facilities
            </CardTitle>
            <Link href="/explore">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-[14px] text-xs px-3 text-[#0f3e17] hover:bg-[#cfe7d3]"
              >
                Browse All
              </Button>
            </Link>
          </div>
          <CardDescription className="text-xs text-[#222222]/70">
            Live queue streams for your saved places.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col gap-3">
          {watchedVenues.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#222222]/70">
              No facilities on your radar yet.{" "}
              <Link href="/explore" className="text-[#0f3e17] underline">
                Explore live venues
              </Link>
              .
            </div>
          ) : (
            watchedVenues.map((v, idx) => (
              <div
                key={v.slug || v._id || v.id || idx}
                className="flex items-center justify-between p-4 rounded-[14px] bg-[#fffefc] hover:bg-[#cfe7d3] transition-colors"
              >
                <div>
                  <p className="font-normal text-xs text-[#0f3e17]">{v.name}</p>
                  <p className="text-[11px] text-[#222222]/70">
                    {v.address}, {v.city} · {v.totalWaitingCount} waiting
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-light text-[#0f3e17]">
                    {v.averageWaitMinutes}m wait
                  </span>
                  <Link href={`/venue/${v.slug}`}>
                    <Button size="sm" variant="ghost" className="size-8 p-0 rounded-[14px] text-[#0f3e17] hover:bg-[#e1f4df]">
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
