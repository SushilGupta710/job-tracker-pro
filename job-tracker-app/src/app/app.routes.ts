import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './services/auth-guard-service';
import { AuthService } from './services/auth-service';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./job-tracker/job-tracker').then((m) => m.JobTrackerPage),
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'job-tracker',
    loadComponent: () => import('./job-tracker/job-tracker').then((m) => m.JobTrackerPage),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'job-tracker',
  },
];