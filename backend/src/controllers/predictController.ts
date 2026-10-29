import { Request, Response } from "express";
import { predictCalories, PredictionInput } from "../services/mlService";
import { Prediction } from "../models/Prediction";
import { RangedField, invalidInput, isGender, isInRange, rangeMessage } from "../validation/workoutRanges";

const NUMBER_FIELDS: RangedField[] = ["age", "height", "weight", "duration", "heartRate", "bodyTemp"];

export async function createPrediction(req: Request, res: Response): Promise<void> {
  const body = req.body ?? {};

  const problems = NUMBER_FIELDS.filter((field) => !isInRange(field, body[field])).map(rangeMessage);
  if (!isGender(body.gender)) problems.unshift("gender must be male or female");
  if (problems.length > 0) {
    res.status(400).json(invalidInput(problems));
    return;
  }

  const input: PredictionInput = {
    gender: body.gender,
    age: body.age,
    height: body.height,
    weight: body.weight,
    duration: body.duration,
    heartRate: body.heartRate,
    bodyTemp: body.bodyTemp,
  };

  const caloriesBurnt = await predictCalories(input);
  const prediction = await Prediction.create({ ...input, user: req.user!._id, caloriesBurnt });

  res.status(201).json({ prediction });
}
