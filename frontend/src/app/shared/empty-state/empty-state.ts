import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink, Logo],
  template: `
    <div class="empty-state">
      <app-logo [draw]="true" />
      <h3>No workouts yet</h3>
      <p>{{ message() }}</p>
      <a class="btn btn-primary" routerLink="/predict">Log a workout</a>
    </div>
  `,
})
export class EmptyState {
  message = input.required<string>();
}
