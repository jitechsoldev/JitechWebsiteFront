import { JobOrderComponent } from './components/job-order/job-order.component';
import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SalesComponent } from './components/sales/sales.component';
import { CalendarComponent } from './components/calendar/calendar.component';

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
  {
    path: 'sales',
    component: SalesComponent,
  },
  {
    path: 'calendar',
    component: CalendarComponent,
  },
  {
    path: 'job-order',
    component: JobOrderComponent,
  },
];
