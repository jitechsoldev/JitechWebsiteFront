import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  isSidebarOpen = false;
  activeMenuItem: string = 'Home';

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
