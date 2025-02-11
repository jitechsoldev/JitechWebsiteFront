import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sales',
  imports: [CommonModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
})
export class SalesComponent {
  isSidebarOpen = false;
  activeMenuItem: string = 'Sales';

  menuItems = [
    { name: 'Home', icon: './HomeWhite.png' },
    { name: 'Orders', icon: './JobOrderWhite.png' },
    { name: 'Products', icon: './ProductsWhite.png' },
    { name: 'Sales', icon: './SalesWhite.png' },
    { name: 'Inventory', icon: './InventoryWhite.png' },
    { name: 'Quotations', icon: './QuotationsWhite.png' },
  ];

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveItem(item: string) {
    this.activeMenuItem = item;
  }
}
