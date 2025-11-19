import { Routes } from '@angular/router';
import { AuthGuard } from './app/guards/auth.guard';
import { HttpBackend } from '@angular/common/http';

export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () => import('./inicio/app/app.component').then(m => m.AppComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/app/app.component').then(m => m.AppComponent)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/app/app.component').then(m => m.AppComponent)
  },
  {
    path: 'timeline',
    loadComponent: () => import('./timeline/app/app.component').then(m => m.AppComponent),
    canActivate: [AuthGuard],
    data: { requiresAuth: true }
  },
  {
    path: 'perfil',
    children: [
      {
        path: '',
        loadComponent: () => import('./perfil/app/app.component').then(m => m.AppComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'config',
        loadComponent: () => import('./perfil_config/app/app.component').then(m => m.AppComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'perfil-config',
    redirectTo: 'perfil/config',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
