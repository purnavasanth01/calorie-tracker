import { Schema, model, Document, Types } from "mongoose";

export interface DefaultStats {
  age?: number;
  height?: number;
  weight?: number;
  gender?: "male" | "female";
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  isPremium: boolean;
  defaultStats: DefaultStats;
  weeklyGoal: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
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

userSchema.set("toJSON", {
  transform: (_doc, { passwordHash, ...user }) => user,
});

export const User = model<IUser>("User", userSchema);
