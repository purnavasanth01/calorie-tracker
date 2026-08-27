import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary, Prediction } from '../../core/models/prediction.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private historyService = inject(HistoryService);
  auth = inject(AuthService);

  summary = signal<DashboardSummary | null>(null);
  recent = signal<Prediction[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.historyService.summary().subscribe((s) => this.summary.set(s));
    this.historyService.list().subscribe((res) => {
      this.recent.set(res.predictions.slice(0, 5));
      this.loading.set(false);
    });
  }
}
