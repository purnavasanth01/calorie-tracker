export interface PredictionInput {
  gender: 'male' | 'female';
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

export interface DashboardSummary {
  weeklyTotal: number;
  weeklyGoal: number;
  progressPercent: number;
  sessionsThisWeek: number;
}
