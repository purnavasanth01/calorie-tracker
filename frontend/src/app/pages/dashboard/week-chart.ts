import { Component, LOCALE_ID, computed, inject, input } from '@angular/core';
import { DecimalPipe, formatDate } from '@angular/common';
import { DailyTotal } from '../../core/models/prediction.model';

function parseLocalDate(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

@Component({
  selector: 'app-week-chart',
  imports: [DecimalPipe],
  templateUrl: './week-chart.html',
  styleUrl: './week-chart.scss',
})
export class WeekChart {
  days = input.required<DailyTotal[]>();
  weeklyGoal = input.required<number>();

  private locale = inject(LOCALE_ID);

  dailyTarget = computed(() => this.weeklyGoal() / 7);

  private scaleMax = computed(() => Math.max(this.dailyTarget(), ...this.days().map((d) => d.calories)) * 1.2 || 1);

  targetPercent = computed(() => (this.dailyTarget() / this.scaleMax()) * 100);

  bars = computed(() =>
    this.days().map((day, index, all) => {
      const date = parseLocalDate(day.date);
      return {
        ...day,
        isToday: index === all.length - 1,
        shortLabel: formatDate(date, 'EEE', this.locale),
        fullLabel: formatDate(date, 'EEEE, MMM d', this.locale),
        heightPercent: (day.calories / this.scaleMax()) * 100,
      };
    })
  );
}
