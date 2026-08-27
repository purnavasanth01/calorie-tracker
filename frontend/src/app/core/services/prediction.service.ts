import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Prediction, PredictionInput } from '../models/prediction.model';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  constructor(private http: HttpClient) {}

  predict(input: PredictionInput) {
    return this.http.post<{ prediction: Prediction }>(`${environment.apiUrl}/predict`, input);
  }
}
