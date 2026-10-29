import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Logo } from '../../shared/logo/logo';
import { CountUp } from '../../shared/motion/count-up';
import { InView } from '../../shared/motion/in-view';
import { HowItWorks } from './how-it-works';
import { TechRibbon } from './tech-ribbon';
import { prefersReducedMotion } from '../../shared/motion/reduced-motion';
import { HeroVisual } from './hero-visual';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Logo, CountUp, InView, HeroVisual, HowItWorks, TechRibbon],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  private auth = inject(AuthService);

  readonly headline = ['Know', 'what', 'every', 'workout', 'is', 'worth.'];

  readonly stats = [
    { value: 15000, decimals: 0, prefix: '', label: 'workouts in the training data' },
    { value: 1.5, decimals: 1, prefix: '≈', label: 'kcal typical prediction error' },
    { value: 7, decimals: 0, prefix: '', label: 'measurements per prediction' },
  ];

  readonly year = new Date().getFullYear();

  statsVisible = signal(false);
  startingDemo = signal(false);
  demoError = signal<string | null>(null);

  async tryDemo(): Promise<void> {
    this.startingDemo.set(true);
    this.demoError.set(await this.auth.openDemo());
    this.startingDemo.set(false);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}
