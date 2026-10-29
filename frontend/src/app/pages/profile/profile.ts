import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { rangeValidators } from '../../core/models/number-fields';
import { NumberInput } from '../../shared/number-input/number-input';
import { GenderToggle } from '../../shared/gender-toggle/gender-toggle';
import { PlanBadge } from '../../shared/plan-badge/plan-badge';
import { Gender } from '../../core/models/prediction.model';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, NumberInput, GenderToggle, PlanBadge],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  auth = inject(AuthService);

  readonly statFields = ['age', 'height', 'weight'] as const;

  saved = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  private user = this.auth.currentUser();
  private defaults = this.user?.defaultStats;

  form = this.fb.group({
    gender: this.fb.nonNullable.control<Gender>(this.defaults?.gender ?? 'male'),
    age: [this.defaults?.age ?? null, rangeValidators('age')],
    height: [this.defaults?.height ?? null, rangeValidators('height')],
    weight: [this.defaults?.weight ?? null, rangeValidators('weight')],
    weeklyGoal: this.fb.nonNullable.control(this.user?.weeklyGoal ?? 2000, [
      Validators.required,
      ...rangeValidators('weeklyGoal'),
    ]),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);

    this.profileService.update(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.auth.setUser(res.user);
        this.saving.set(false);
        this.saved.set(true);
        this.form.markAsPristine();
      },
      error: () => {
        this.saving.set(false);
        this.error.set("We couldn't save your changes. Please try again.");
      },
    });
  }
}
