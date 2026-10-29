export const RANGES = {
  age: [10, 100],
  height: [100, 250],
  weight: [30, 200],
  duration: [1, 120],
  heartRate: [60, 200],
  bodyTemp: [35, 43],
  weeklyGoal: [100, 20000],
} as const;

export type RangedField = keyof typeof RANGES;

export const GENDERS = ["male", "female"] as const;

export function isGender(value: unknown): value is (typeof GENDERS)[number] {
  return GENDERS.includes(value as (typeof GENDERS)[number]);
}

export function isInRange(field: RangedField, value: unknown): value is number {
  const [min, max] = RANGES[field];
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function rangeMessage(field: RangedField): string {
  const [min, max] = RANGES[field];
  return `${field} must be a number between ${min} and ${max}`;
}

export function invalidInput(problems: string[]): { error: string } {
  return { error: `Please check your inputs: ${problems.join("; ")}.` };
}
