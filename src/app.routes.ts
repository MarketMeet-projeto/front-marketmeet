import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/app/app.component').then(m => m.AppComponent)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/app/app.component').then(m => m.AppComponent)
  },
  {
    path: 'perfil-config',
    loadComponent: () => import('./perfil_config/app/app.component').then(m => m.AppComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];