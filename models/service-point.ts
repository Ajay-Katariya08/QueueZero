import mongoose, { Schema, type Model } from "mongoose";

export type ServicePointDoc = {
  venueId: mongoose.Types.ObjectId;
  name: string;
  type: "registration" | "consultation" | "lab" | "payment" | "counter" | "window" | "general";
  currentQueueCount: number;
  estimatedWaitMinutes: number;
  status: "open" | "closed" | "busy" | "delayed";
  delayMinutes: number;
  lastUpdated: Date;
};

const ServicePointSchema = new Schema<ServicePointDoc>({
  venueId: { type: Schema.Types.ObjectId, ref: "Venue", required: true, index: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["registration", "consultation", "lab", "payment", "counter", "window", "general"],
    default: "general",
  },
  currentQueueCount: { type: Number, default: 0 },
  estimatedWaitMinutes: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["open", "closed", "busy", "delayed"],
    default: "open",
  },
  delayMinutes: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

export const ServicePoint: Model<ServicePointDoc> =
  mongoose.models.ServicePoint || mongoose.model<ServicePointDoc>("ServicePoint", ServicePointSchema);
