import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HistoryService } from '../../core/services/history.service';
import { Prediction } from '../../core/models/prediction.model';

@Component({
  selector: 'app-history',
  imports: [RouterLink, DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private historyService = inject(HistoryService);

  predictions = signal<Prediction[]>([]);
  limited = signal(false);
  limit = signal(0);
  loading = signal(true);
  search = signal('');
  genderFilter = signal<'all' | 'male' | 'female'>('all');

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const gender = this.genderFilter();

    return this.predictions().filter((p) => {
      const matchesGender = gender === 'all' || p.gender === gender;
      const matchesSearch =
        !term ||
        new Date(p.createdAt).toLocaleDateString().toLowerCase().includes(term) ||
        String(p.caloriesBurnt).includes(term) ||
        String(p.duration).includes(term);
      return matchesGender && matchesSearch;
    });
  });

  exportUrl = this.historyService.exportCsvUrl();

  ngOnInit(): void {
    this.historyService.list().subscribe((res) => {
      this.predictions.set(res.predictions);
      this.limited.set(res.limited);
      this.limit.set(res.limit);
      this.loading.set(false);
    });
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setGenderFilter(value: 'all' | 'male' | 'female'): void {
    this.genderFilter.set(value);
  }
}
