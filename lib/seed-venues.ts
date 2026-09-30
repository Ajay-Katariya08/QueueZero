import { Venue } from "@/models/venue";
import { ServicePoint } from "@/models/service-point";

const INITIAL_VENUES = [
  {
    name: "Metro Health PolyClinic & Diagnostics",
    slug: "metro-health-clinic",
    category: "clinic" as const,
    address: "420 Healthway Boulevard, Sector 4",
    city: "Mumbai",
    location: {
      type: "Point" as const,
      coordinates: [72.8777, 19.076],
    },
    businessPhone: "+91 98200 12345",
    gstNumber: "27AAPFU0939L1ZV",
    isVerified: true,
    isPublished: true,
    statusText: "Doctor running 18m behind schedule",
    totalWaitingCount: 32,
    averageWaitMinutes: 47,
    counters: [
      { name: "Patient Registration Desk", type: "registration", count: 6, wait: 8, status: "open", delay: 0 },
      { name: "General Physician (Dr. Reynolds)", type: "consultation", count: 14, wait: 31, status: "delayed", delay: 18 },
      { name: "Blood Test & Pathology Lab", type: "lab", count: 8, wait: 14, status: "busy", delay: 4 },
      { name: "Billing & Pharmacy Counter", type: "payment", count: 4, wait: 5, status: "open", delay: 0 },
    ],
  },
  {
    name: "Regional Passport Seva Kendra",
    slug: "passport-seva-kendra",
    category: "passport" as const,
    address: "Trade Center, BKC Ground Floor",
    city: "Mumbai",
    location: {
      type: "Point" as const,
      coordinates: [72.8656, 19.0657],
    },
    businessPhone: "+91 22 2654 8900",
    gstNumber: "27AAAGP1234F1Z9",
    isVerified: true,
    isPublished: true,
    statusText: "Biometrics scanner server restored",
    totalWaitingCount: 68,
    averageWaitMinutes: 52,
    counters: [
      { name: "Token Verification (Counter A)", type: "counter", count: 18, wait: 12, status: "open", delay: 0 },
      { name: "Biometric & Photograph (Counter B)", type: "window", count: 32, wait: 28, status: "delayed", delay: 10 },
      { name: "Granting Officer Interview (Counter C)", type: "consultation", count: 18, wait: 16, status: "open", delay: 0 },
    ],
  },
  {
    name: "Central State Bank - Main Branch",
    slug: "state-bank-main-branch",
    category: "bank" as const,
    address: "12 Nariman Point Financial Plaza",
    city: "Mumbai",
    location: {
      type: "Point" as const,
      coordinates: [72.8238, 18.9256],
    },
    businessPhone: "+91 22 6655 4400",
    gstNumber: "27AAACS0001B1Z3",
    isVerified: true,
    isPublished: true,
    statusText: "Normal operations across all cash windows",
    totalWaitingCount: 19,
    averageWaitMinutes: 18,
    counters: [
      { name: "Cash Deposit & Withdrawal", type: "payment", count: 8, wait: 10, status: "open", delay: 0 },
      { name: "Account Opening & KYC Desk", type: "registration", count: 7, wait: 14, status: "open", delay: 0 },
      { name: "Loan & Forex Officer Desk", type: "consultation", count: 4, wait: 8, status: "open", delay: 0 },
    ],
  },
];

export async function ensureSeededVenues() {
  const count = await Venue.countDocuments();
  if (count > 0) return;

  for (const item of INITIAL_VENUES) {
    const { counters, ...venueData } = item;
    const venue = await Venue.create({
      ...venueData,
      servicePoints: [],
    });

    const spDocs = await Promise.all(
      counters.map((c) =>
        ServicePoint.create({
          venueId: venue._id,
          name: c.name,
          type: c.type,
          currentQueueCount: c.count,
          estimatedWaitMinutes: c.wait,
          status: c.status,
          delayMinutes: c.delay,
        })
      )
    );

    venue.servicePoints = spDocs.map((sp) => sp._id);
    await venue.save();
  }
}
