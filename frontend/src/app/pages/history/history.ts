import { Component, LOCALE_ID, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, formatDate } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { Prediction } from '../../core/models/prediction.model';
import { EmptyState } from '../../shared/empty-state/empty-state';

const DATE_FORMAT = 'MMM d, y';

@Component({
  selector: 'app-history',
  imports: [RouterLink, DatePipe, DecimalPipe, EmptyState],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private historyService = inject(HistoryService);
  private locale = inject(LOCALE_ID);

  readonly dateFormat = DATE_FORMAT;

  predictions = signal<Prediction[]>([]);
  limited = signal(false);
  limit = signal(0);
  loading = signal(true);
  error = signal(false);
  search = signal('');
  confirmingId = signal<string | null>(null);
  deletingId = signal<string | null>(null);
  deleteError = signal(false);

  showUpsell = computed(() => this.limited() && this.predictions().length >= this.limit());

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.predictions();
    return this.predictions().filter((p) =>
      [formatDate(p.createdAt, DATE_FORMAT, this.locale), p.caloriesBurnt.toFixed(0), p.duration].some((value) =>
        String(value).toLowerCase().includes(term)
      )
    );
  });

  exportUrl = this.historyService.exportCsvUrl();

  ngOnInit(): void {
    this.load();
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  remove(prediction: Prediction): void {
    if (this.confirmingId() !== prediction._id) {
      this.confirmingId.set(prediction._id);
      return;
    }

    this.deletingId.set(prediction._id);
    this.deleteError.set(false);
    this.historyService.remove(prediction._id).subscribe({
      next: () => {
        this.confirmingId.set(null);
        this.deletingId.set(null);
        this.load();
      },
      error: () => {
        this.deletingId.set(null);
        this.deleteError.set(true);
      },
    });
  }

  private load(): void {
    this.historyService.list().subscribe({
      next: (res) => {
        this.predictions.set(res.predictions);
        this.limited.set(res.limited);
        this.limit.set(res.limit);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
