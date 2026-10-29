import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { Tilt } from '../../shared/motion/tilt';

@Component({
  selector: 'app-premium',
  imports: [Tilt],
  templateUrl: './premium.html',
  styleUrl: './premium.scss',
})
export class Premium implements OnInit {
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  isPremium = computed(() => this.auth.currentUser()?.isPremium ?? false);
  redirecting = signal(false);
  verifying = signal(false);
  justUpgraded = signal(false);
  notice = signal<string | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const sessionId = params.get('session_id');

    if (params.get('canceled') === 'true') {
      this.notice.set("Checkout was cancelled. You haven't been charged.");
    }

    if (params.get('success') === 'true' && sessionId) {
      this.verifying.set(true);
      this.paymentService.verifySession(sessionId).subscribe({
        next: async (res) => {
          this.verifying.set(false);
          if (res.premium) {
            this.justUpgraded.set(true);
            await this.auth.loadCurrentUser();
          } else {
            this.error.set("We couldn't confirm your payment yet. If you were charged, refresh this page in a moment.");
          }
        },
        error: () => {
          this.verifying.set(false);
          this.error.set("We couldn't confirm your payment. Please refresh the page.");
        },
      });
    }
  }

  upgrade(): void {
    this.redirecting.set(true);
    this.error.set(null);
    this.paymentService.createCheckoutSession().subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: () => {
        this.redirecting.set(false);
        this.error.set('Payments are not available right now. Please try again later.');
      },
    });
  }
}
