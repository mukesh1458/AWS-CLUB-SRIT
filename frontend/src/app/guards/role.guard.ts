import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // The expected roles are passed in the route data
    const expectedRoles = route.data['roles'] as Array<string>;

    if (!authService.isLoggedIn()) {
        return router.createUrlTree(['/login']);
    }

    if (expectedRoles && authService.hasRole(expectedRoles)) {
        return true;
    }

    // User is logged in but doesn't have the right role - redirect to home or unauthorized page
    return router.createUrlTree(['/']);
};
