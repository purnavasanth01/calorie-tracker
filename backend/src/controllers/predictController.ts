import { Request, Response } from "express";
import { predictCalories } from "../services/mlService";
import { Prediction } from "../models/Prediction";

export async function createPrediction(req: Request, res: Response): Promise<void> {
  const { gender, age, height, weight, duration, heartRate, bodyTemp } = req.body;

  if (
    !gender ||
    [age, height, weight, duration, heartRate, bodyTemp].some(
      (v) => v === undefined || v === null || Number.isNaN(Number(v))
    )
  ) {
    res.status(400).json({ error: "Missing or invalid input fields" });
    return;
  }

  try {
    const caloriesBurnt = await predictCalories({
      gender,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      duration: Number(duration),
      heartRate: Number(heartRate),
      bodyTemp: Number(bodyTemp),
    });

    const prediction = await Prediction.create({
      user: req.user!._id,
      gender,
      age,
      height,
      weight,
      duration,
      heartRate,
      bodyTemp,
      caloriesBurnt,
    });

    res.status(201).json({ prediction });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
