import mongoose, { Schema, type Model } from "mongoose";

export type QueueReportDoc = {
  venueId: mongoose.Types.ObjectId;
  servicePointId?: mongoose.Types.ObjectId;
  userId?: string;
  isAnonymous: boolean;
  reportedCount: number;
  reportedWaitMinutes: number;
  notes?: string;
  reliabilityScore: number;
  createdAt: Date;
};

const QueueReportSchema = new Schema<QueueReportDoc>({
  venueId: { type: Schema.Types.ObjectId, ref: "Venue", required: true, index: true },
  servicePointId: { type: Schema.Types.ObjectId, ref: "ServicePoint" },
  userId: { type: String, index: true },
  isAnonymous: { type: Boolean, default: true },
  reportedCount: { type: Number, required: true },
  reportedWaitMinutes: { type: Number, required: true },
  notes: String,
  reliabilityScore: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const QueueReport: Model<QueueReportDoc> =
  mongoose.models.QueueReport || mongoose.model<QueueReportDoc>("QueueReport", QueueReportSchema);
