import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { SalesComponent } from './sales/sales.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComponentsRoutingModule {}
