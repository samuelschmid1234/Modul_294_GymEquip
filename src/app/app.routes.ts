import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'machines',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/machines/machines').then((m) => m.Machines),
  },
  {
    path: 'accessory-sets',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/accessory-sets/accessory-sets').then((m) => m.AccessorySets),
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/categorys/categorys').then((m) => m.Categorys),
  },
  { path: '**', redirectTo: '' },
];
