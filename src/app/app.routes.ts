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
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },

  { path: 'user-management', component: RegisterComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin'] }
  },
  {
    path: 'products-list',
    component: ProductListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin', 'Admin','User'] }
  },
  {
    path: 'products-list/add',
    component: ProductFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin', 'Admin'] }
  },
  {
    path: 'products-list/edit/:id',
    component: ProductFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin', 'Admin'] }
  },
  {
    path: 'inventory-dashboard',
    component: InventoryDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin', 'Admin'] }
  },
  {
    path: 'product-movement',
    component: StockMovementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin', 'Admin'] }
  },
  {
    path: 'sale',
    component: SaleComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin', 'Admin', 'User'] }
  },
  {
    path: 'job-order',
    component: JobOrderComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin', 'Admin', 'User'] }
  },
  {
    path: 'schedule',
    component: ScheduleComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Super Admin', 'Admin', 'User'] }
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
