import { Request, Response } from "express";
import { Prediction } from "../models/Prediction";

const FREE_TIER_LIMIT = 5;

export async function listHistory(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const query = Prediction.find({ user: user._id }).sort({ createdAt: -1 });

  if (!user.isPremium) {
    query.limit(FREE_TIER_LIMIT);
  }

  const predictions = await query.exec();
  res.json({ predictions, limited: !user.isPremium, limit: FREE_TIER_LIMIT });
}

export async function exportHistory(req: Request, res: Response): Promise<void> {
  const user = req.user!;

  if (!user.isPremium) {
    res.status(403).json({ error: "Premium required to export history" });
    return;
  }

  const predictions = await Prediction.find({ user: user._id }).sort({ createdAt: -1 });

  const header = "Date,Gender,Age,Height,Weight,Duration,HeartRate,BodyTemp,CaloriesBurnt\n";
  const rows = predictions
    .map((p) =>
      [
        p.createdAt.toISOString(),
        p.gender,
        p.age,
        p.height,
        p.weight,
        p.duration,
        p.heartRate,
        p.bodyTemp,
        p.caloriesBurnt,
      ].join(",")
    )
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=calorie-history.csv");
  res.send(header + rows);
}

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  const user = req.user!;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recent = await Prediction.find({
    user: user._id,
    createdAt: { $gte: oneWeekAgo },
  });

  const weeklyTotal = recent.reduce((sum, p) => sum + p.caloriesBurnt, 0);

  res.json({
    weeklyTotal,
    weeklyGoal: user.weeklyGoal,
    progressPercent: Math.min(100, Math.round((weeklyTotal / user.weeklyGoal) * 100)),
    sessionsThisWeek: recent.length,
  });
}
