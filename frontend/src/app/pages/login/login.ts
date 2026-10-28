import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Mode = 'login' | 'signup';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  mode = signal<Mode>('login');
  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: [{ value: '', disabled: true }, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  setMode(mode: Mode): void {
    this.mode.set(mode);
    this.error.set(null);
    const name = this.form.controls.name;
    if (mode === 'signup') {
      name.enable();
    } else {
      name.disable();
    }
  }

  isInvalid(field: 'name' | 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    const { name, email, password } = this.form.getRawValue();

    try {
      if (this.mode() === 'signup') {
        await this.auth.signup(name, email, password);
      } else {
        await this.auth.login(email, password);
      }
      await this.router.navigateByUrl('/dashboard');
    } catch (err) {
      this.error.set((err as HttpErrorResponse).error?.error ?? 'Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
