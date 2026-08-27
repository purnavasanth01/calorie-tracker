import { Schema, model, Document, Types } from "mongoose";

export interface DefaultStats {
  age?: number;
  height?: number;
  weight?: number;
  gender?: "male" | "female";
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isPremium: boolean;
  defaultStats: DefaultStats;
  weeklyGoal: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  isPremium: { type: Boolean, default: false },
  defaultStats: {
    age: Number,
    height: Number,
    weight: Number,
    gender: { type: String, enum: ["male", "female"] },
  },
  weeklyGoal: { type: Number, default: 2000 },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", userSchema);
