import { Routes } from '@angular/router';

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
    canActivate: [], // TODO: Adicionar AuthGuard quando implementar autenticação
    data: { requiresAuth: true }
  },
  {
    path: 'perfil',
    children: [
      {
        path: '',
        loadComponent: () => import('./perfil/app/app.component').then(m => m.AppComponent)
      },
      {
        path: 'config',
        loadComponent: () => import('./perfil_config/app/app.component').then(m => m.AppComponent)
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