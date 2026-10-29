export const RANGES = {
  age: [20, 79],
  height: [123, 222],
  weight: [36, 132],
  duration: [1, 30],
  heartRate: [67, 128],
  bodyTemp: [37.1, 41.5],
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
