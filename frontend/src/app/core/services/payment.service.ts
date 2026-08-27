import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  createCheckoutSession() {
    return this.http.post<{ url: string }>(
      `${environment.apiUrl}/payment/create-checkout-session`,
      {}
    );
  }

  verifySession(sessionId: string) {
    return this.http.get<{ premium: boolean }>(
      `${environment.apiUrl}/payment/verify/${sessionId}`
    );
  }
}
