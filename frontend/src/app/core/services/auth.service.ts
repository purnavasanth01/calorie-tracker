import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);

  async login(email: string, password: string): Promise<void> {
    await this.authenticate('login', { email, password });
  }

  async signup(name: string, email: string, password: string): Promise<void> {
    await this.authenticate('signup', { name, email, password });
  }

  async openDemo(): Promise<string | null> {
    try {
      await this.authenticate('demo', {});
      await this.router.navigateByUrl('/dashboard');
      return null;
    } catch {
      return "The demo couldn't start. Please try again in a moment.";
    }
  }

  private async authenticate(path: 'login' | 'signup' | 'demo', body: object): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ user: User }>(`${environment.apiUrl}/auth/${path}`, body)
    );
    this.currentUser.set(res.user);
  }

  async loadCurrentUser(): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me`));
      this.currentUser.set(res.user);
    } catch {
      this.currentUser.set(null);
    }
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}));
    this.currentUser.set(null);
  }

  setUser(user: User): void {
    this.currentUser.set(user);
  }
}
