import { Schema, model, Document, Types } from "mongoose";

export interface IPrediction extends Document {
  user: Types.ObjectId;
  gender: "male" | "female";
  age: number;
  height: number;
  weight: number;
  duration: number;
  heartRate: number;
  bodyTemp: number;
  caloriesBurnt: number;
  createdAt: Date;
}

const predictionSchema = new Schema<IPrediction>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  duration: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  bodyTemp: { type: Number, required: true },
  caloriesBurnt: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Prediction = model<IPrediction>("Prediction", predictionSchema);
