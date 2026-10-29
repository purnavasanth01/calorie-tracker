import { Gender } from './prediction.model';

export interface DefaultStats {
  age?: number;
  height?: number;
  weight?: number;
  gender?: Gender;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isDemo?: boolean;
  defaultStats: DefaultStats;
  weeklyGoal: number;
}
