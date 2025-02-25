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
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'products-list',
    component: ProductListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'products-list/add',
    component: ProductFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'products-list/edit/:id',
    component: ProductFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'inventory-dashboard',
    component: InventoryDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'product-movement',
    component: StockMovementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sale',
    component: SaleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'job-order',
    component: JobOrderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'schedule',
    component: ScheduleComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
