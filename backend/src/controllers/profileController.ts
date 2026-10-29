import { Request, Response } from "express";
import { User } from "../models/User";
import { RangedField, invalidInput, isGender, isInRange, rangeMessage } from "../validation/workoutRanges";

const STAT_FIELDS: RangedField[] = ["age", "height", "weight"];

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { gender, weeklyGoal } = req.body ?? {};
  const update: Record<string, unknown> = {};
  const problems: string[] = [];

  for (const field of STAT_FIELDS) {
    const value = req.body?.[field];
    if (value === undefined) continue;
    if (value === null || isInRange(field, value)) update[`defaultStats.${field}`] = value;
    else problems.push(rangeMessage(field));
  }

  if (gender !== undefined) {
    if (isGender(gender)) update["defaultStats.gender"] = gender;
    else problems.push("gender must be male or female");
  }

  if (weeklyGoal !== undefined) {
    if (isInRange("weeklyGoal", weeklyGoal)) update["weeklyGoal"] = weeklyGoal;
    else problems.push(rangeMessage("weeklyGoal"));
  }

  if (problems.length > 0) {
    res.status(400).json(invalidInput(problems));
    return;
  }

  const user = await User.findByIdAndUpdate(req.user!._id, { $set: update }, { new: true, runValidators: true });
  res.json({ user });
}
