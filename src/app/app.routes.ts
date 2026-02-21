import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.Home), data: { animation: 'HomePage' } },
    { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About), data: { animation: 'AboutPage' } },
    { path: 'services', loadComponent: () => import('./pages/services/services').then(m => m.Services), data: { animation: 'ServicesPage' } },
    { path: 'events', loadComponent: () => import('./pages/events/events').then(m => m.Events), data: { animation: 'EventsPage' } },
    { path: 'team', loadComponent: () => import('./pages/team/team').then(m => m.Team), data: { animation: 'TeamPage' } },
    { path: 'join', loadComponent: () => import('./pages/join/join').then(m => m.Join), data: { animation: 'JoinPage' } },
    { path: '**', redirectTo: 'home' }
];
