import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary, Prediction } from '../../core/models/prediction.model';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { CountUp } from '../../shared/motion/count-up';
import { ProgressRing } from '../../shared/progress-ring/progress-ring';
import { WeekChart } from './week-chart';

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, EmptyState, CountUp, ProgressRing, WeekChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private historyService = inject(HistoryService);
  private auth = inject(AuthService);

  summary = signal<DashboardSummary | null>(null);
  recent = signal<Prediction[]>([]);
  loading = signal(true);
  error = signal(false);

  readonly today = new Date();
  readonly greeting = greetingFor(this.today);
  firstName = computed(() => this.auth.currentUser()?.name.split(' ')[0] ?? '');
  remaining = computed(() => {
    const s = this.summary();
    return s ? Math.max(0, s.weeklyGoal - s.weeklyTotal) : 0;
  });

  ngOnInit(): void {
    this.historyService.summary().subscribe({
      next: (s) => this.summary.set(s),
      error: () => this.error.set(true),
    });
    this.historyService.list().subscribe({
      next: (res) => {
        this.recent.set(res.predictions.slice(0, 5));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
