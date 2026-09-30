import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectMongo } from "@/lib/mongodb";
import { Venue } from "@/models/venue";
import { ServicePoint } from "@/models/service-point";
import { ensureSeededVenues } from "@/lib/seed-venues";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");
  const ownerId = searchParams.get("ownerId");

  try {
    await connectMongo();
    await ensureSeededVenues();

    const filter: Record<string, unknown> = {};

    if (ownerId) {
      filter.ownerId = ownerId;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ];
    }

    const venues = await Venue.find(filter)
      .populate("servicePoints")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: venues, source: "database" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch venues", data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const {
      name,
      category,
      address,
      city,
      gstNumber,
      businessPhone,
      counters,
      latitude,
      longitude,
    } = body;

    if (!name || !category || !address || !city) {
      return NextResponse.json(
        { error: "Name, category, address, and city are required." },
        { status: 400 }
      );
    }

    const normalizedGst = (gstNumber || "").trim().toUpperCase();
    if (normalizedGst && !GST_REGEX.test(normalizedGst)) {
      return NextResponse.json(
        { error: "Invalid 15-character GSTIN format. Example: 27AAPFU0939L1ZV" },
        { status: 400 }
      );
    }

    await connectMongo();

    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Venue.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newVenue = await Venue.create({
      name,
      slug,
      category,
      address,
      city,
      location: {
        type: "Point",
        coordinates: [
          Number(longitude) || 72.8777,
          Number(latitude) || 19.076,
        ],
      },
      phone: businessPhone,
      businessPhone,
      gstNumber: normalizedGst || undefined,
      ownerId: userId || undefined,
      isVerified: Boolean(normalizedGst),
      isPublished: true,
      totalWaitingCount: 0,
      averageWaitMinutes: 0,
      servicePoints: [],
    });

    const initialCounters: string[] =
      Array.isArray(counters) && counters.length > 0
        ? counters
        : ["General Desk", "Processing Counter", "Payment & Billing"];

    const createdPoints = await Promise.all(
      initialCounters.map((pointName) =>
        ServicePoint.create({
          venueId: newVenue._id,
          name: pointName,
          type: "counter",
          currentQueueCount: 0,
          estimatedWaitMinutes: 0,
          status: "open",
          delayMinutes: 0,
        })
      )
    );

    newVenue.servicePoints = createdPoints.map((p) => p._id);
    await newVenue.save();

    const populated = await Venue.findById(newVenue._id)
      .populate("servicePoints")
      .lean();

    return NextResponse.json(
      { success: true, data: populated },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create venue" },
      { status: 500 }
    );
  }
}
