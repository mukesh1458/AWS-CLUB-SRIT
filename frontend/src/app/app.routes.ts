import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.Home), data: { animation: 'HomePage' } },
    { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About), data: { animation: 'AboutPage' } },
    { path: 'services', loadComponent: () => import('./pages/services/services').then(m => m.Services), data: { animation: 'ServicesPage' } },
    { path: 'events', loadComponent: () => import('./pages/events/events').then(m => m.Events), data: { animation: 'EventsPage' } },
    { path: 'team', loadComponent: () => import('./pages/team/team').then(m => m.Team), data: { animation: 'TeamPage' } },
    { path: 'join', loadComponent: () => import('./pages/join/join').then(m => m.Join), data: { animation: 'JoinPage' } },
    { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login), data: { animation: 'LoginPage' } },

    // Protected Routes
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboards/student-dashboard/student-dashboard').then(m => m.StudentDashboard),
        canActivate: [authGuard]
    },
    {
        path: 'team-dashboard',
        loadComponent: () => import('./pages/dashboards/team-dashboard/team-dashboard').then(m => m.TeamDashboard),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['super_admin', 'team_member'] }
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/dashboards/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['super_admin'] }
    },

    { path: '**', redirectTo: 'home' }
];
