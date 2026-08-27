import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-premium',
  templateUrl: './premium.html',
  styleUrl: './premium.scss',
})
export class Premium implements OnInit {
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  redirecting = signal(false);
  verifying = signal(false);
  justUpgraded = signal(false);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const sessionId = params.get('session_id');

    if (params.get('success') === 'true' && sessionId) {
      this.verifying.set(true);
      this.paymentService.verifySession(sessionId).subscribe(async (res) => {
        this.verifying.set(false);
        if (res.premium) {
          this.justUpgraded.set(true);
          await this.auth.loadCurrentUser();
        }
      });
    }
  }

  upgrade(): void {
    this.redirecting.set(true);
    this.paymentService.createCheckoutSession().subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: () => {
        this.redirecting.set(false);
      },
    });
  }
}
