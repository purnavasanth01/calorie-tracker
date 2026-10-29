export type Gender = 'male' | 'female';

export interface PredictionInput {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  duration: number;
  heartRate: number;
  bodyTemp: number;
}

export interface Prediction extends PredictionInput {
  _id: string;
  caloriesBurnt: number;
  createdAt: string;
}

export interface DailyTotal {
  date: string;
  calories: number;
}

export interface DashboardSummary {
  weeklyTotal: number;
  weeklyGoal: number;
  progressPercent: number;
  sessionsThisWeek: number;
  daily: DailyTotal[];
}
