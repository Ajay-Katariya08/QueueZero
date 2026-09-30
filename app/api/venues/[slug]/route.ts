import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongodb";
import { Venue } from "@/models/venue";
import { ServicePoint } from "@/models/service-point";
import { QueueReport } from "@/models/queue-report";
import { getFallbackVenues } from "@/lib/seed-venues";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    await connectMongo();
    const venue = await Venue.findOne({ slug })
      .populate("servicePoints")
      .lean();

    if (venue) {
      const reports = await QueueReport.find({ venueId: venue._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const recentReports = reports.map((r) => {
        const diffMs = Date.now() - new Date(r.createdAt).getTime();
        const diffMin = Math.floor(diffMs / 60000);
        let timeAgo = "Just now";
        if (diffMin >= 60) {
          const hours = Math.floor(diffMin / 60);
          timeAgo = `${hours}h ago`;
        } else if (diffMin > 0) {
          timeAgo = `${diffMin}m ago`;
        }

        return {
          id: String(r._id),
          _id: String(r._id),
          reportedCount: r.reportedCount,
          reportedWaitMinutes: r.reportedWaitMinutes,
          servicePointName: "Live Citizen Observation",
          notes: r.notes || "Crowd reported from premises.",
          timeAgo,
          isAnonymous: r.isAnonymous,
        };
      });

      const sanitized = JSON.parse(
        JSON.stringify({
          ...venue,
          id: String(venue._id),
          servicePoints: Array.isArray(venue.servicePoints)
            ? venue.servicePoints.filter(Boolean).map((sp: any) => ({
                ...sp,
                id: String(sp._id || sp.id),
              }))
            : [],
          recentReports,
        })
      );

      return NextResponse.json({
        success: true,
        data: sanitized,
        source: "database",
      });
    }
  } catch {}

  const fallback = getFallbackVenues().find((v) => v.slug === slug);
  if (fallback) {
    return NextResponse.json({
      success: true,
      data: fallback,
      source: "fallback",
    });
  }

  return NextResponse.json({ error: "Venue not found" }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const { userId } = await auth();
    const updates = await request.json();
    await connectMongo();

    const existing = await Venue.findOne({ slug });
    if (!existing) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    if (existing.ownerId && existing.ownerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: only the registered operator can publish changes." },
        { status: 403 },
      );
    }

    if (updates.servicePoints && Array.isArray(updates.servicePoints)) {
      const activeIds: mongoose.Types.ObjectId[] = [];
      for (const sp of updates.servicePoints) {
        const targetId = sp._id || sp.id;
        if (targetId && mongoose.isValidObjectId(targetId)) {
          await ServicePoint.findByIdAndUpdate(targetId, {
            name: sp.name,
            type: sp.type || "counter",
            currentQueueCount: sp.currentQueueCount,
            estimatedWaitMinutes: sp.estimatedWaitMinutes,
            status: sp.status,
            delayMinutes: sp.delayMinutes,
            lastUpdated: new Date(),
          });
          activeIds.push(new mongoose.Types.ObjectId(targetId));
        } else {
          const created = await ServicePoint.create({
            venueId: existing._id,
            name: sp.name,
            type: sp.type || "counter",
            currentQueueCount: sp.currentQueueCount || 0,
            estimatedWaitMinutes: sp.estimatedWaitMinutes || 0,
            status: sp.status || "open",
            delayMinutes: sp.delayMinutes || 0,
            lastUpdated: new Date(),
          });
          activeIds.push(created._id);
        }
      }

      await ServicePoint.deleteMany({
        venueId: existing._id,
        _id: { $nin: activeIds },
      });

      updates.servicePoints = activeIds;
    }

    const updated = await Venue.findOneAndUpdate({ slug }, updates, {
      new: true,
    })
      .populate("servicePoints")
      .lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Update failed" },
      { status: 500 },
    );
  }
}
