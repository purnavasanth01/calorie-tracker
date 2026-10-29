import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser()) {
    return router.createUrlTree(['/dashboard']);
  }

  auth.loadCurrentUser().then(() => {
    if (auth.currentUser()) router.navigateByUrl('/dashboard');
  });
  return true;
};
