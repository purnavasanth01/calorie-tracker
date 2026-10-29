import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, map, timer } from 'rxjs';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { Tilt } from '../../shared/motion/tilt';

const MIN_PROCESSING_MS = 1200;
const DEMO_EXPIRY = `12/${String((new Date().getFullYear() + 3) % 100).padStart(2, '0')}`;

@Component({
  selector: 'app-premium',
  imports: [ReactiveFormsModule, Tilt],
  templateUrl: './premium.html',
  styleUrl: './premium.scss',
})
export class Premium {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private auth = inject(AuthService);
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('checkout');

  isPremium = computed(() => this.auth.currentUser()?.isPremium ?? false);
  paying = signal(false);
  justUpgraded = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: [this.auth.currentUser()?.name ?? '', Validators.required],
    cardNumber: ['4242 4242 4242 4242', [Validators.required, Validators.pattern(/^(\d{4} ?){3}\d{4}$/)]],
    expiry: [DEMO_EXPIRY, [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvc: ['123', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  isInvalid(field: 'name' | 'cardNumber' | 'expiry' | 'cvc'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  openCheckout(): void {
    this.error.set(null);
    this.dialog().nativeElement.showModal();
  }

  closeCheckout(): void {
    this.dialog().nativeElement.close();
  }

  pay(): void {
    if (this.paying()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.paying.set(true);
    this.error.set(null);
    combineLatest([this.paymentService.checkout(this.form.getRawValue()), timer(MIN_PROCESSING_MS)])
      .pipe(map(([res]) => res.user))
      .subscribe({
        next: (user) => {
          this.auth.setUser(user);
          this.paying.set(false);
          this.closeCheckout();
          this.justUpgraded.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.paying.set(false);
          this.error.set(err.error?.error ?? 'The payment could not be completed. Please try again.');
        },
      });
  }
}
