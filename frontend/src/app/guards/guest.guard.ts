import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        return true; // Allow access to login/join
    }

    // Already logged in, redirect to appropriate dashboard
    const userRole = authService.currentUser?.role;
    if (userRole === 'super_admin') {
        return router.createUrlTree(['/admin']);
    } else if (userRole === 'team_member') {
        return router.createUrlTree(['/team-dashboard']);
    } else {
        return router.createUrlTree(['/dashboard']);
    }
};
