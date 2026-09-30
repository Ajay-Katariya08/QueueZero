import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectMongo } from "@/lib/mongodb";
import { Venue } from "@/models/venue";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to claim facility" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { gstNumber, businessPhone } = body;

    const normalizedGst = (gstNumber || "").trim().toUpperCase();
    if (!normalizedGst || !GST_REGEX.test(normalizedGst)) {
      return NextResponse.json(
        { error: "Valid 15-character GSTIN number is required (e.g. 27AAPFU0939L1ZV)." },
        { status: 400 }
      );
    }

    await connectMongo();

    const venue = await Venue.findOne({ slug });

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    if (venue.ownerId && venue.ownerId !== userId) {
      return NextResponse.json(
        { error: "This facility is already claimed by another verified operator." },
        { status: 409 }
      );
    }

    venue.ownerId = userId;
    venue.gstNumber = normalizedGst;
    if (businessPhone) venue.businessPhone = businessPhone;
    venue.isVerified = true;
    venue.isPublished = true;
    await venue.save();

    const updated = await Venue.findById(venue._id)
      .populate("servicePoints")
      .lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Claim failed" },
      { status: 500 }
    );
  }
}
