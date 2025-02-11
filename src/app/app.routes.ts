import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SalesComponent } from './components/sales/sales.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  // {
  //   path: 'orders',
  //   component: JobOrderComponent,
  // },
  // {
  //   path: 'products',
  //   component: ProductsComponent,
  // },
  {
    path: 'sales',
    component: SalesComponent,
  },
];
