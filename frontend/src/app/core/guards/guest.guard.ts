import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.currentUser()) {
    await auth.loadCurrentUser();
  }

  return auth.currentUser() ? router.createUrlTree(['/dashboard']) : true;
};
