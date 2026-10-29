import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Gender } from '../models/prediction.model';

export interface ProfileUpdate {
  gender: Gender;
  age: number | null;
  height: number | null;
  weight: number | null;
  weeklyGoal: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  update(data: ProfileUpdate) {
    return this.http.put<{ user: User }>(`${environment.apiUrl}/profile`, data);
  }
}
