import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../features/auth/services/auth';


export const authGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router      = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['login']);
};


export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router      = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['home']);
};