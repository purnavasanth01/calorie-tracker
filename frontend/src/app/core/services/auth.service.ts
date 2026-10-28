import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null);
  readonly loading = signal(true);

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<void> {
    await this.authenticate('login', { email, password });
  }

  async signup(name: string, email: string, password: string): Promise<void> {
    await this.authenticate('signup', { name, email, password });
  }

  private async authenticate(path: 'login' | 'signup', body: object): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ user: User }>(`${environment.apiUrl}/auth/${path}`, body)
    );
    this.currentUser.set(res.user);
  }

  async loadCurrentUser(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me`)
      );
      this.currentUser.set(res.user);
    } catch {
      this.currentUser.set(null);
    } finally {
      this.loading.set(false);
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
