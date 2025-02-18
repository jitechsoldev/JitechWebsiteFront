import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { InventoryDashboardComponent } from './components/inventory-dashboard/inventory-dashboard.component';
import { StockMovementComponent } from './components/stock-movement/stock-movement.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { SaleComponent } from './components/sale/sale.component';
import { JobOrderComponent } from './components/job-order/job-order.component';
import { ScheduleComponent } from './components/schedule/schedule.component';

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
    path: 'products-list',
    component: ProductListComponent,
  },
  {
    path: 'products-list/add',
    component: ProductFormComponent,
  },
  {
    path: 'products-list/edit/:id',
    component: ProductFormComponent,
  },
  {
    path: 'inventory-dashboard',
    component: InventoryDashboardComponent,
  },
  {
    path: 'product-movement',
    component: StockMovementComponent,
  },
  {
    path: 'sale',
    component: SaleComponent,
  },
  {
    path: 'job-order',
    component: JobOrderComponent,
  },
  {
    path: 'schedule',
    component: ScheduleComponent,
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
