import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Logo } from './shared/logo/logo';

const SLOW_NAVIGATION_MS = 600;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Logo],
  templateUrl: './app.html',
  styles: `
    .waking {
      display: grid;
      place-items: center;
      align-content: center;
      gap: 12px;
      min-height: 70vh;
      padding: 24px;
      text-align: center;

      app-logo {
        width: 52px;
        height: 52px;
        margin-bottom: 8px;
      }

      h2,
      p {
        margin: 0;
      }

      p {
        max-width: 36ch;
      }
    }
  `,
})
export class App {
  waking = signal(false);

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          timer = setTimeout(() => this.waking.set(true), SLOW_NAVIGATION_MS);
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
          clearTimeout(timer);
          this.waking.set(false);
        }
      });
  }
}
