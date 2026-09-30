import mongoose, { Schema, type Model } from "mongoose";

export type VenueStatDoc = {
  venueId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  hour: number;
  avgWaitMinutes: number;
  avgQueueCount: number;
  sampleCount: number;
};

const VenueStatSchema = new Schema<VenueStatDoc>({
  venueId: { type: Schema.Types.ObjectId, ref: "Venue", required: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  hour: { type: Number, required: true, min: 0, max: 23 },
  avgWaitMinutes: { type: Number, default: 0 },
  avgQueueCount: { type: Number, default: 0 },
  sampleCount: { type: Number, default: 1 },
});

VenueStatSchema.index({ venueId: 1, dayOfWeek: 1, hour: 1 }, { unique: true });

export const VenueStat: Model<VenueStatDoc> =
  mongoose.models.VenueStat || mongoose.model<VenueStatDoc>("VenueStat", VenueStatSchema);
