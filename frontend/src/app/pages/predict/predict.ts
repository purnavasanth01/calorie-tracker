import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PredictionService } from '../../core/services/prediction.service';
import { AuthService } from '../../core/services/auth.service';
import { Prediction } from '../../core/models/prediction.model';

@Component({
  selector: 'app-predict',
  imports: [ReactiveFormsModule],
  templateUrl: './predict.html',
  styleUrl: './predict.scss',
})
export class Predict {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);
  private auth = inject(AuthService);

  submitting = signal(false);
  error = signal<string | null>(null);
  result = signal<Prediction | null>(null);

  private defaults = this.auth.currentUser()?.defaultStats;

  form = this.fb.nonNullable.group({
    gender: [this.defaults?.gender ?? 'male', Validators.required],
    age: [this.defaults?.age ?? 25, [Validators.required, Validators.min(10), Validators.max(100)]],
    height: [this.defaults?.height ?? 170, [Validators.required, Validators.min(100), Validators.max(250)]],
    weight: [this.defaults?.weight ?? 70, [Validators.required, Validators.min(30), Validators.max(200)]],
    duration: [15, [Validators.required, Validators.min(1), Validators.max(120)]],
    heartRate: [95, [Validators.required, Validators.min(60), Validators.max(200)]],
    bodyTemp: [40.0, [Validators.required, Validators.min(35), Validators.max(43)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please check the highlighted fields: age 10-100, height 100-250cm, weight 30-200kg, duration 1-120min, heart rate 60-200bpm, body temp 35-43°C.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.result.set(null);

    this.predictionService.predict(this.form.getRawValue() as any).subscribe({
      next: (res) => {
        this.result.set(res.prediction);
        this.submitting.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Something went wrong. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  logAnother(): void {
    this.result.set(null);
  }
}
