import mongoose from "mongoose";
import { User } from "../models/User";
import { Prediction } from "../models/Prediction";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment");
  }

  await mongoose.connect(uri);
  await Promise.all([User.syncIndexes(), Prediction.syncIndexes()]);
  console.log("MongoDB connected");
}
