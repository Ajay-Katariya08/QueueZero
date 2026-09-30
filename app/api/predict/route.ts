import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Venue } from "@/models/venue";
import { ServicePointDoc } from "@/models/service-point";

export type PredictionRequest = {
  venueSlug: string;
  selectedServices: string[];
  targetMaxMinutes: number;
};

export async function POST(request: Request) {
  try {
    const body: PredictionRequest = await request.json();
    const { venueSlug, selectedServices, targetMaxMinutes } = body;

    await connectMongo();
    const venue = await Venue.findOne({ slug: venueSlug })
      .populate("servicePoints")
      .lean();

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const servicePoints = (venue.servicePoints || []) as unknown as ServicePointDoc[];

    const matchedSteps = selectedServices.map((serviceType) => {
      const sp = servicePoints.find(
        (point) => point.type?.toLowerCase() === serviceType.toLowerCase()
      );

      if (sp) {
        return {
          serviceName: sp.name,
          serviceType: sp.type,
          baseMinutes: sp.estimatedWaitMinutes,
          delayMinutes: sp.delayMinutes,
          expectedMinutes: sp.estimatedWaitMinutes + (sp.status === "delayed" ? sp.delayMinutes : 0),
          statusText: sp.status,
        };
      }

      const defaultTime = serviceType === "consultation" ? 25 : serviceType === "lab" ? 15 : 8;
      return {
        serviceName: serviceType.charAt(0).toUpperCase() + serviceType.slice(1),
        serviceType,
        baseMinutes: defaultTime,
        delayMinutes: 0,
        expectedMinutes: defaultTime,
        statusText: "open",
      };
    });

    const totalMinutes = matchedSteps.reduce((sum, s) => sum + s.expectedMinutes, 0);

    let riskLevel: "low" | "medium" | "high" = "low";
    if (totalMinutes > targetMaxMinutes) {
      riskLevel = "high";
    } else if (totalMinutes > targetMaxMinutes * 0.75) {
      riskLevel = "medium";
    }

    const suggestedArrival = "8:30 AM – 10:00 AM (Optimal arrival window for lowest counter queues)";

    return NextResponse.json({
      success: true,
      venueName: venue.name,
      steps: matchedSteps,
      totalExpectedMinutes: totalMinutes,
      targetMaxMinutes,
      marginMinutes: targetMaxMinutes - totalMinutes,
      riskLevel,
      suggestedArrival,
      activeBottleneck:
        matchedSteps.find((s) => s.statusText === "delayed" || s.statusText === "busy")?.serviceName ||
        null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Prediction error" },
      { status: 500 }
    );
  }
}
