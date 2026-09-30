import mongoose, { Schema, type Model } from "mongoose";

export type TripStep = {
  serviceName: string;
  serviceType: string;
  expectedMinutes: number;
  status: "pending" | "current" | "done";
};

export type UserTripDoc = {
  userId?: string;
  venueId: mongoose.Types.ObjectId;
  targetMaxMinutes: number;
  calculatedExpectedMinutes: number;
  riskLevel: "low" | "medium" | "high";
  steps: TripStep[];
  suggestedArrivalWindow: string;
  createdAt: Date;
};

const UserTripSchema = new Schema<UserTripDoc>({
  userId: { type: String, index: true },
  venueId: { type: Schema.Types.ObjectId, ref: "Venue", required: true },
  targetMaxMinutes: { type: Number, required: true },
  calculatedExpectedMinutes: { type: Number, required: true },
  riskLevel: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  steps: [
    {
      serviceName: String,
      serviceType: String,
      expectedMinutes: Number,
      status: {
        type: String,
        enum: ["pending", "current", "done"],
        default: "pending",
      },
    },
  ],
  suggestedArrivalWindow: String,
  createdAt: { type: Date, default: Date.now },
});

export const UserTrip: Model<UserTripDoc> =
  mongoose.models.UserTrip || mongoose.model<UserTripDoc>("UserTrip", UserTripSchema);
