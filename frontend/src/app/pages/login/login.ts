import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Logo } from '../../shared/logo/logo';

type Mode = 'login' | 'signup';
type Field = 'name' | 'email' | 'password';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const MAX_NAME_LENGTH = 80;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  readonly maxPasswordLength = MAX_PASSWORD_LENGTH;
  readonly maxNameLength = MAX_NAME_LENGTH;

  mode = signal<Mode>('login');
  showPassword = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_NAME_LENGTH)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', Validators.required],
  });

  constructor() {
    if (inject(ActivatedRoute).snapshot.queryParamMap.get('mode') === 'signup') {
      this.setMode('signup');
    }
  }

  setMode(mode: Mode): void {
    if (mode === this.mode()) return;

    this.mode.set(mode);
    this.error.set(null);

    const { name, password } = this.form.controls;
    if (mode === 'signup') {
      name.enable();
      password.setValidators([
        Validators.required,
        Validators.minLength(MIN_PASSWORD_LENGTH),
        Validators.maxLength(MAX_PASSWORD_LENGTH),
      ]);
    } else {
      name.disable();
      password.setValidators(Validators.required);
    }
    password.updateValueAndValidity();
  }

  isInvalid(field: Field): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  async tryDemo(): Promise<void> {
    this.submitting.set(true);
    this.error.set(await this.auth.openDemo());
    this.submitting.set(false);
  }

  async submit(): Promise<void> {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    const { name, email, password } = this.form.getRawValue();

    try {
      if (this.mode() === 'signup') {
        await this.auth.signup(name.trim(), email.trim(), password);
      } else {
        await this.auth.login(email.trim(), password);
      }
      await this.router.navigateByUrl('/dashboard');
    } catch (err) {
      this.error.set((err as HttpErrorResponse).error?.error ?? 'Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
