import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { VenueStat } from "@/models/venue-stat";
import { Venue } from "@/models/venue";
import { DUMMY_SLUGS } from "@/lib/seed-venues";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (DUMMY_SLUGS.includes(slug)) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  try {
    await connectMongo();
    const venue = await Venue.findOne({ slug }).lean();

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const stats = await VenueStat.find({ venueId: venue._id })
      .sort({ hour: 1 })
      .lean();

    if (stats && stats.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          venueName: venue.name,
          hourlyStats: stats,
          bestVisitingTime: "11:00 AM – 1:30 PM",
          totalWaitingNow: venue.totalWaitingCount,
          averageWaitMinutes: venue.averageWaitMinutes,
        },
      });
    }

    const baseWait = venue.averageWaitMinutes || 20;
    const computedHourly = [
      { hour: 8, label: "8:00 AM", waitMinutes: Math.round(baseWait * 0.4), busyness: "low" as const },
      { hour: 9, label: "9:00 AM", waitMinutes: Math.round(baseWait * 0.9), busyness: "medium" as const },
      { hour: 10, label: "10:00 AM", waitMinutes: Math.round(baseWait * 1.4), busyness: "peak" as const },
      { hour: 11, label: "11:00 AM", waitMinutes: Math.round(baseWait * 1.6), busyness: "peak" as const },
      { hour: 12, label: "12:00 PM", waitMinutes: Math.round(baseWait * 1.1), busyness: "high" as const },
      { hour: 13, label: "1:00 PM", waitMinutes: Math.round(baseWait * 0.6), busyness: "low" as const },
      { hour: 14, label: "2:00 PM", waitMinutes: Math.round(baseWait * 0.8), busyness: "medium" as const },
      { hour: 15, label: "3:00 PM", waitMinutes: Math.round(baseWait * 1.2), busyness: "high" as const },
      { hour: 16, label: "4:00 PM", waitMinutes: Math.round(baseWait * 1.3), busyness: "high" as const },
      { hour: 17, label: "5:00 PM", waitMinutes: Math.round(baseWait * 0.5), busyness: "low" as const },
    ];

    return NextResponse.json({
      success: true,
      data: {
        venueName: venue.name,
        hourlyStats: computedHourly,
        bestVisitingTime: "8:00 AM – 9:00 AM (Avg wait: " + Math.round(baseWait * 0.4) + " min)",
        totalWaitingNow: venue.totalWaitingCount,
        averageWaitMinutes: venue.averageWaitMinutes,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 },
    );
  }
}
