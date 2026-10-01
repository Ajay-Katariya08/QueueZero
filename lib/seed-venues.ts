import { Venue } from "@/models/venue";
import { ServicePoint } from "@/models/service-point";
import type { VenueItem } from "@/lib/venue-types";

export const DUMMY_SLUGS = [
  "metro-health-clinic",
  "passport-seva-kendra",
  "state-bank-main-branch",
];

export const INITIAL_VENUES: any[] = [];

export function getFallbackVenues(
  _category?: string | null,
  _query?: string | null,
): VenueItem[] {
  return [];
}

export async function cleanupDummyVenues(): Promise<void> {
  try {
    const dummyVenues = await Venue.find({
      slug: { $in: DUMMY_SLUGS },
    }).lean();

    if (dummyVenues.length > 0) {
      const dummyIds = dummyVenues.map((v) => v._id);
      await ServicePoint.deleteMany({ venueId: { $in: dummyIds } });
      await Venue.deleteMany({ _id: { $in: dummyIds } });
    }
  } catch {}
}

export async function ensureSeededVenues(): Promise<void> {
  await cleanupDummyVenues();
}
