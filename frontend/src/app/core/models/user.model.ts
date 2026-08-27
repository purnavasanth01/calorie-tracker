export interface DefaultStats {
  age?: number;
  height?: number;
  weight?: number;
  gender?: 'male' | 'female';
}

export interface User {
  _id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isPremium: boolean;
  defaultStats: DefaultStats;
  weeklyGoal: number;
}
