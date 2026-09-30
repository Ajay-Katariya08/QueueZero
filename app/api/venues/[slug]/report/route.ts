import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { QueueReport } from "@/models/queue-report";
import { Venue } from "@/models/venue";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const { reportedCount, reportedWaitMinutes, notes, isAnonymous } = body;

    await connectMongo();
    const venue = await Venue.findOne({ slug });

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const countNum = Math.max(0, Number(reportedCount) || 0);
    const waitNum = Math.max(0, Number(reportedWaitMinutes) || 0);

    const report = await QueueReport.create({
      venueId: venue._id,
      reportedCount: countNum,
      reportedWaitMinutes: waitNum,
      notes: notes || "Crowd reported from premises.",
      isAnonymous: isAnonymous ?? true,
    });

    const newWaiting = Math.round(((venue.totalWaitingCount || 0) + countNum) / 2);
    const newWaitMin = Math.round(((venue.averageWaitMinutes || 0) + waitNum) / 2);

    await Venue.findByIdAndUpdate(venue._id, {
      totalWaitingCount: newWaiting,
      averageWaitMinutes: newWaitMin,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: String(report._id),
          _id: String(report._id),
          reportedCount: report.reportedCount,
          reportedWaitMinutes: report.reportedWaitMinutes,
          servicePointName: "Live Citizen Observation",
          notes: report.notes,
          timeAgo: "Just now",
          isAnonymous: report.isAnonymous,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to submit observation" },
      { status: 500 },
    );
  }
}
