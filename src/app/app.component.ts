import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  isSidebarOpen = true;
  ShowLayout = true;
  title: any;

  menuItems = [
    { name: 'Home', icon: './HomeWhite.png', routes: '/home' },
    {
      name: 'Products',
      icon: './ProductsWhite.png',
      expanded: false,
      children: [{ name: 'Product List', routes: '/products-list' }],
    },
    {
      name: 'Inventory',
      icon: './InventoryWhite.png',
      expanded: false,
      children: [{ name: 'Dashboard', routes: '/inventory-dashboard' }],
    },
    { name: 'Sales', icon: './SalesWhite.png', routes: '/sales' },
    {
      name: 'Job Orders',
      icon: './JobOrderWhite.png',
      routes: '/job-order',
    },
    {
      name: 'Quotations',
      icon: './QuotationsWhite.png',
      routes: '/quotations',
    },
  ];

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      const hiddenRoutes = ['/login', '/'];
      this.ShowLayout = !hiddenRoutes.includes(this.router.url);
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDropdown(menuItem: any) {
    if (menuItem.children) {
      menuItem.expanded = !menuItem.expanded;
    }
  }
}
