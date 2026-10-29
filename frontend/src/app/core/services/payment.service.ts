import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface CardDetails {
  name: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  checkout(card: CardDetails) {
    return this.http.post<{ user: User }>(`${environment.apiUrl}/payment/checkout`, card);
  }
}
