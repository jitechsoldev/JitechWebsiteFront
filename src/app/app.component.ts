import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isSidebarOpen = true;
  ShowLayout = true;
  currentUser: any = null; // Store the logged-in user info
  filteredMenuItems: any[] = []; // Store accessible menu items

  // Define menu items with required roles
  menuItems = [
    { name: 'Schedule', icon: './HomeWhite.png', routes: '/schedule', roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'Products', icon: './ProductsWhite.png', routes: '/products-list', roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'Inventory', icon: './InventoryWhite.png', routes: '/inventory-dashboard', roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'Sales Invoice', icon: './SalesWhite.png', routes: '/sale', roles: ['Admin', 'Super Admin', 'User'] },
    { name: 'Job Orders', icon: './JobOrderWhite.png', routes: '/job-order', roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'Quotations', icon: './QuotationsWhite.png', routes: '/quotations', roles: ['User', 'Admin', 'Super Admin'] },
    { name: 'User Management', icon: './User.png', routes: '/user-management', roles: ['Super Admin'] }, // Only Super Admin can access
  ];

  constructor(private router: Router, private authService: AuthService) {
    // Listen for route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateUserAndMenu();
      }
    });
  }

  ngOnInit(): void {
    this.updateUserAndMenu();
  }

  updateUserAndMenu() {
    // Get user info from the token
    this.currentUser = this.authService.getUserInfo();

    // Check if the user has roles; if not, default to an empty array
    const userRoles = this.currentUser?.roles || [];

    // Filter the menu based on user roles
    this.filteredMenuItems = this.menuItems.filter(item =>
      item.roles.some(role => userRoles.includes(role))
    );

    // Hide layout on login page
    this.ShowLayout = !['/login', '/'].includes(this.router.url);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  confirmLogout() {
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.currentUser = null; // Clear user info
      this.filteredMenuItems = []; // Reset menu
    }
  }
}
