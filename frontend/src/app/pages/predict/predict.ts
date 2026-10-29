import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, map, timer } from 'rxjs';
import { PredictionService } from '../../core/services/prediction.service';
import { AuthService } from '../../core/services/auth.service';
import { Gender, Prediction } from '../../core/models/prediction.model';
import { rangeValidators } from '../../core/models/number-fields';
import { NumberInput } from '../../shared/number-input/number-input';
import { CountUp } from '../../shared/motion/count-up';
import { Tilt } from '../../shared/motion/tilt';
import { Logo } from '../../shared/logo/logo';
import { Ecg } from '../../shared/ecg/ecg';
import { GenderToggle } from '../../shared/gender-toggle/gender-toggle';

const CALCULATING_STAGES = ['Reading your session', 'Running the model', 'Estimating calories'];
const STAGE_MS = 450;
const MIN_CALCULATING_MS = 1200;

@Component({
  selector: 'app-predict',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, NumberInput, CountUp, Tilt, Logo, Ecg, GenderToggle],
  templateUrl: './predict.html',
  styleUrl: './predict.scss',
})
export class Predict {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);
  private auth = inject(AuthService);

  readonly aboutYouFields = ['age', 'height', 'weight'] as const;
  readonly sessionFields = ['duration', 'heartRate', 'bodyTemp'] as const;

  submitting = signal(false);
  stage = signal(CALCULATING_STAGES[0]);
  error = signal<string | null>(null);
  result = signal<Prediction | null>(null);

  private stageTimer?: ReturnType<typeof setInterval>;

  private defaults = this.auth.currentUser()?.defaultStats;
  readonly hasProfileDefaults = Boolean(this.defaults?.age || this.defaults?.height || this.defaults?.weight);

  form = this.fb.nonNullable.group({
    gender: [(this.defaults?.gender ?? 'male') as Gender, Validators.required],
    age: [this.defaults?.age ?? 25, [Validators.required, ...rangeValidators('age')]],
    height: [this.defaults?.height ?? 170, [Validators.required, ...rangeValidators('height')]],
    weight: [this.defaults?.weight ?? 70, [Validators.required, ...rangeValidators('weight')]],
    duration: [15, [Validators.required, ...rangeValidators('duration')]],
    heartRate: [95, [Validators.required, ...rangeValidators('heartRate')]],
    bodyTemp: [40, [Validators.required, ...rangeValidators('bodyTemp')]],
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopStages());
  }

  submit(): void {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.startStages();

    const prediction$ = this.predictionService.predict(this.form.getRawValue());
    combineLatest([prediction$, timer(MIN_CALCULATING_MS)])
      .pipe(map(([res]) => res.prediction))
      .subscribe({
        next: (prediction) => {
          this.result.set(prediction);
          this.finishCalculating();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(err.error?.error ?? 'Something went wrong. Please try again.');
          this.finishCalculating();
        },
      });
  }

  private startStages(): void {
    let index = 0;
    this.stage.set(CALCULATING_STAGES[0]);
    this.stageTimer = setInterval(() => {
      index = Math.min(index + 1, CALCULATING_STAGES.length - 1);
      this.stage.set(CALCULATING_STAGES[index]);
    }, STAGE_MS);
  }

  private stopStages(): void {
    clearInterval(this.stageTimer);
  }

  private finishCalculating(): void {
    this.stopStages();
    this.submitting.set(false);
  }

  logAnother(): void {
    this.result.set(null);
  }
}
