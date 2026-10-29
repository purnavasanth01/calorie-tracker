import { ValidatorFn, Validators } from '@angular/forms';

export interface NumberFieldConfig {
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
}

export const NUMBER_FIELDS = {
  age: { label: 'Age', unit: 'years', min: 20, max: 79 },
  height: { label: 'Height', unit: 'cm', min: 123, max: 222 },
  weight: { label: 'Weight', unit: 'kg', min: 36, max: 132 },
  duration: { label: 'Duration', unit: 'min', min: 1, max: 30 },
  heartRate: { label: 'Heart rate', unit: 'bpm', min: 67, max: 128 },
  bodyTemp: { label: 'Body temperature', unit: '°C', min: 37.1, max: 41.5, step: 0.1 },
  weeklyGoal: { label: 'Calories per week', unit: 'kcal', min: 100, max: 20000, step: 50 },
} satisfies Record<string, NumberFieldConfig>;

export type NumberField = keyof typeof NUMBER_FIELDS;

export function rangeValidators(field: NumberField): ValidatorFn[] {
  const { min, max } = NUMBER_FIELDS[field];
  return [Validators.min(min), Validators.max(max)];
}
