import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

const SIGNED_IN_KEY = 'caltrack.signedIn';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);

  wasSignedIn(): boolean {
    try {
      return localStorage.getItem(SIGNED_IN_KEY) === '1';
    } catch {
      return false;
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.authenticate('login', { email, password });
  }

  async signup(name: string, email: string, password: string): Promise<void> {
    await this.authenticate('signup', { name, email, password });
  }

  async openDemo(): Promise<string | null> {
    try {
      await this.authenticate('demo', { tz: new Date().getTimezoneOffset() });
      await this.router.navigateByUrl('/dashboard');
      return null;
    } catch (err) {
      return (err as HttpErrorResponse).error?.error ?? "The demo couldn't start. Please try again in a moment.";
    }
  }

  private async authenticate(path: 'login' | 'signup' | 'demo', body: object): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ user: User }>(`${environment.apiUrl}/auth/${path}`, body)
    );
    this.setUser(res.user);
  }

  async loadCurrentUser(): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<{ user: User | null }>(`${environment.apiUrl}/auth/me`));
      this.setUser(res.user);
    } catch {
      this.currentUser.set(null);
    }
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}));
    this.setUser(null);
  }

  setUser(user: User | null): void {
    this.currentUser.set(user);
    try {
      if (user) localStorage.setItem(SIGNED_IN_KEY, '1');
      else localStorage.removeItem(SIGNED_IN_KEY);
    } catch {
      return;
    }
  }
}
