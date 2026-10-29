import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DashboardSummary, Prediction } from '../models/prediction.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<{ predictions: Prediction[]; limited: boolean; limit: number }>(
      `${environment.apiUrl}/history`
    );
  }

  summary() {
    const tz = new Date().getTimezoneOffset();
    return this.http.get<DashboardSummary>(`${environment.apiUrl}/history/summary`, { params: { tz } });
  }

  remove(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/history/${id}`);
  }

  exportCsvUrl(): string {
    return `${environment.apiUrl}/history/export`;
  }
}
