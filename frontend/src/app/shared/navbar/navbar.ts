import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Logo } from '../logo/logo';
import { PlanBadge } from '../plan-badge/plan-badge';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Logo, PlanBadge],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  host: { '(window:scroll)': 'onScroll()' },
})
export class Navbar {
  auth = inject(AuthService);
  private router = inject(Router);

  scrolled = signal(false);

  onScroll(): void {
    this.scrolled.set(window.scrollY > 4);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
