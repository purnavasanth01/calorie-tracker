import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DefaultStats, User } from '../models/user.model';

export interface ProfileUpdate extends DefaultStats {
  weeklyGoal?: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  update(data: ProfileUpdate) {
    return this.http.put<{ user: User }>(`${environment.apiUrl}/profile`, data);
  }
}
