import mongoose, { Schema, type Model } from "mongoose";
import "@/models/service-point";

export type VenueCategory =
  | "hospital"
  | "clinic"
  | "government"
  | "bank"
  | "salon"
  | "repair"
  | "restaurant"
  | "university"
  | "passport";

export type VenueDoc = {
  name: string;
  slug: string;
  category: VenueCategory;
  address: string;
  city: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  phone?: string;
  businessPhone?: string;
  gstNumber?: string;
  isPublished?: boolean;
  imageUrl?: string;
  operatingHours?: Record<string, string>;
  ownerId?: string;
  isVerified: boolean;
  statusText?: string;
  totalWaitingCount: number;
  averageWaitMinutes: number;
  servicePoints: mongoose.Types.ObjectId[];
  createdAt: Date;
};

const VenueSchema = new Schema<VenueDoc>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: {
    type: String,
    enum: [
      "hospital",
      "clinic",
      "government",
      "bank",
      "salon",
      "repair",
      "restaurant",
      "university",
      "passport",
    ],
    required: true,
    index: true,
  },
  address: { type: String, required: true },
  city: { type: String, required: true, index: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  phone: String,
  businessPhone: { type: String, trim: true },
  gstNumber: { type: String, sparse: true, uppercase: true, trim: true },
  isPublished: { type: Boolean, default: true },
  statusText: { type: String, default: "Operational" },
  imageUrl: String,
  operatingHours: Schema.Types.Mixed,
  ownerId: { type: String, index: true },
  isVerified: { type: Boolean, default: false },
  totalWaitingCount: { type: Number, default: 0 },
  averageWaitMinutes: { type: Number, default: 0 },
  servicePoints: [{ type: Schema.Types.ObjectId, ref: "ServicePoint" }],
  createdAt: { type: Date, default: Date.now },
});

VenueSchema.index({ location: "2dsphere" });

export const Venue: Model<VenueDoc> =
  mongoose.models.Venue || mongoose.model<VenueDoc>("Venue", VenueSchema);
