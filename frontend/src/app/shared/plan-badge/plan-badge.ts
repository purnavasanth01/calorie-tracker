import { Component, computed, input } from '@angular/core';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-plan-badge',
  template: `<span class="badge" [class.badge-premium]="label() !== 'Free'" [class.badge-free]="label() === 'Free'">{{ label() }}</span>`,
})
export class PlanBadge {
  user = input.required<User>();

  label = computed(() => {
    const user = this.user();
    if (user.isDemo) return 'Demo';
    return user.isPremium ? 'Premium' : 'Free';
  });
}
