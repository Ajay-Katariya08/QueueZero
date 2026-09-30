import mongoose, { Schema, type Model } from "mongoose";

export type UserDoc = {
  clerkId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  reputationScore: number;
  watchedVenues: mongoose.Types.ObjectId[];
  createdAt: Date;
};

const UserSchema = new Schema<UserDoc>({
  clerkId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true },
  name: String,
  avatarUrl: String,
  reputationScore: { type: Number, default: 0 },
  watchedVenues: [{ type: Schema.Types.ObjectId, ref: "Venue" }],
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<UserDoc> =
  mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);
