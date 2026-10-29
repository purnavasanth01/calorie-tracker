import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User";
import { Prediction } from "../models/Prediction";

const DEMO_TTL_MS = 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const DEMO_PROFILE = { gender: "male", age: 29, height: 178, weight: 74 } as const;

const SAMPLE_SESSIONS = [
  { daysAgo: 0, hour: 7, duration: 28, heartRate: 112, bodyTemp: 40.4, caloriesBurnt: 185.0 },
  { daysAgo: 1, hour: 18, duration: 22, heartRate: 105, bodyTemp: 40.1, caloriesBurnt: 122.4 },
  { daysAgo: 2, hour: 7, duration: 15, heartRate: 96, bodyTemp: 39.6, caloriesBurnt: 63.6 },
  { daysAgo: 4, hour: 19, duration: 30, heartRate: 118, bodyTemp: 40.7, caloriesBurnt: 221.5 },
  { daysAgo: 5, hour: 7, duration: 18, heartRate: 99, bodyTemp: 39.9, caloriesBurnt: 85.4 },
  { daysAgo: 6, hour: 12, duration: 25, heartRate: 110, bodyTemp: 40.3, caloriesBurnt: 162.2 },
  { daysAgo: 8, hour: 7, duration: 26, heartRate: 108, bodyTemp: 40.3, caloriesBurnt: 158.7 },
  { daysAgo: 9, hour: 18, duration: 20, heartRate: 102, bodyTemp: 40.0, caloriesBurnt: 102.5 },
  { daysAgo: 11, hour: 7, duration: 12, heartRate: 92, bodyTemp: 39.4, caloriesBurnt: 43.7 },
  { daysAgo: 13, hour: 18, duration: 24, heartRate: 107, bodyTemp: 40.2, caloriesBurnt: 142.6 },
];

function daysAgoAt(daysAgo: number, hour: number): Date {
  const date = new Date(Date.now() - daysAgo * DAY_MS);
  date.setHours(hour, 0, 0, 0);
  return date.getTime() > Date.now() ? new Date(Date.now() - 60 * 60 * 1000) : date;
}

async function removeExpiredDemoUsers(): Promise<void> {
  const cutoff = new Date(Date.now() - DEMO_TTL_MS);
  const expired = await User.find({ isDemo: true, createdAt: { $lt: cutoff } }, "_id");
  const ids = expired.map((user) => user._id);
  if (ids.length === 0) return;

  await Prediction.deleteMany({ user: { $in: ids } });
  await User.deleteMany({ _id: { $in: ids } });
}

export async function createDemoUser(): Promise<IUser> {
  await removeExpiredDemoUsers();

  const user = await User.create({
    name: "Alex Morgan",
    email: `demo-${randomUUID()}@demo.caltrack.app`,
    passwordHash: await bcrypt.hash(randomUUID(), 10),
    isDemo: true,
    isPremium: true,
    defaultStats: DEMO_PROFILE,
    weeklyGoal: 1200,
  });

  await Prediction.insertMany(
    SAMPLE_SESSIONS.map(({ daysAgo, hour, ...session }) => ({
      ...session,
      ...DEMO_PROFILE,
      user: user._id,
      createdAt: daysAgoAt(daysAgo, hour),
    }))
  );

  return user;
}
