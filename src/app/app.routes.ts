import { Routes } from '@angular/router';
import { HomeCheck } from './components/home-check/home-check';
import { UpdateUser } from './components/update-user/update-user';

export const routes: Routes = [
  {
    path: '',
    component: HomeCheck,
  },

  {
    path: 'update',
    component: UpdateUser,
  },
  {
    path: 'redirc',
    loadComponent: () => import('./components/redirc/redirc').then((m) => m.Redirc),
  },
];
