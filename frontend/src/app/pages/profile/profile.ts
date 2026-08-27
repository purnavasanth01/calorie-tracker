import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  auth = inject(AuthService);

  saved = signal(false);
  saving = signal(false);

  private user = this.auth.currentUser();
  private defaults = this.user?.defaultStats;

  form = this.fb.nonNullable.group({
    gender: [this.defaults?.gender ?? 'male', Validators.required],
    age: [this.defaults?.age ?? null],
    height: [this.defaults?.height ?? null],
    weight: [this.defaults?.weight ?? null],
    weeklyGoal: [this.user?.weeklyGoal ?? 2000, [Validators.required, Validators.min(100)]],
  });

  submit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.saved.set(false);

    this.profileService.update(this.form.getRawValue() as any).subscribe((res) => {
      this.auth.setUser(res.user);
      this.saving.set(false);
      this.saved.set(true);
    });
  }
}
