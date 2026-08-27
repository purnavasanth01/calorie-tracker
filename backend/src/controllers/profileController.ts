import { Request, Response } from "express";
import { User } from "../models/User";

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { age, height, weight, gender, weeklyGoal } = req.body;

  const update: Record<string, unknown> = {};
  if (age !== undefined) update["defaultStats.age"] = age;
  if (height !== undefined) update["defaultStats.height"] = height;
  if (weight !== undefined) update["defaultStats.weight"] = weight;
  if (gender !== undefined) update["defaultStats.gender"] = gender;
  if (weeklyGoal !== undefined) update["weeklyGoal"] = weeklyGoal;

  const user = await User.findByIdAndUpdate(req.user!._id, { $set: update }, { new: true });
  res.json({ user });
}
