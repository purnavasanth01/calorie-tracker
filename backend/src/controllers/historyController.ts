import { Request, Response } from "express";
import { Types } from "mongoose";
import { Prediction } from "../models/Prediction";
import { DAY_MS, localDay, localMidnight, parseTzOffset } from "../utils/time";

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

const SUMMARY_DAYS = 7;

const round1 = (n: number) => Math.round(n * 10) / 10;

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const tzOffset = parseTzOffset(req.query.tz);

  const today = localDay(new Date(), tzOffset);
  const days = Array.from({ length: SUMMARY_DAYS }, (_, i) =>
    new Date(Date.parse(today) - (SUMMARY_DAYS - 1 - i) * DAY_MS).toISOString().slice(0, 10)
  );
  const windowStart = localMidnight(days[0], tzOffset);

  const recent = await Prediction.find({ user: user._id, createdAt: { $gte: windowStart } });

  const totals = new Map(days.map((day) => [day, 0]));
  for (const p of recent) {
    const day = localDay(p.createdAt, tzOffset);
    totals.set(day, (totals.get(day) ?? 0) + p.caloriesBurnt);
  }

  const weeklyTotal = round1(recent.reduce((sum, p) => sum + p.caloriesBurnt, 0));
  const progressPercent = user.weeklyGoal > 0 ? Math.min(100, Math.round((weeklyTotal / user.weeklyGoal) * 100)) : 0;

  res.json({
    weeklyTotal,
    weeklyGoal: user.weeklyGoal,
    progressPercent,
    sessionsThisWeek: recent.length,
    daily: days.map((date) => ({ date, calories: round1(totals.get(date) ?? 0) })),
  });
}

export async function deletePrediction(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const deleted = Types.ObjectId.isValid(id) && (await Prediction.findOneAndDelete({ _id: id, user: req.user!._id }));
  if (!deleted) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }
  res.status(204).end();
}
