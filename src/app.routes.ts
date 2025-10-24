import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/app/app.routes').then(m => m.routes)
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./cadastro/app/app.routes').then(m => m.routes)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];