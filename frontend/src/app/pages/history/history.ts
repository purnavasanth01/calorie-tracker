import { Component, LOCALE_ID, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, formatDate } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { Gender, Prediction } from '../../core/models/prediction.model';
import { EmptyState } from '../../shared/empty-state/empty-state';

type GenderFilter = 'all' | Gender;

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
  readonly genderOptions: { value: GenderFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  predictions = signal<Prediction[]>([]);
  limited = signal(false);
  limit = signal(0);
  loading = signal(true);
  error = signal(false);
  search = signal('');
  genderFilter = signal<GenderFilter>('all');

  showUpsell = computed(() => this.limited() && this.predictions().length >= this.limit());

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const gender = this.genderFilter();

    return this.predictions().filter((p) => {
      const matchesGender = gender === 'all' || p.gender === gender;
      const searchable = [formatDate(p.createdAt, DATE_FORMAT, this.locale), p.caloriesBurnt.toFixed(0), p.duration];
      const matchesSearch = !term || searchable.some((value) => String(value).toLowerCase().includes(term));
      return matchesGender && matchesSearch;
    });
  });

  exportUrl = this.historyService.exportCsvUrl();

  ngOnInit(): void {
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

  setSearch(value: string): void {
    this.search.set(value);
  }

  setGenderFilter(value: GenderFilter): void {
    this.genderFilter.set(value);
  }
}
