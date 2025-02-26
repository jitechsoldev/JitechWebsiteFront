import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';

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
  currentUser: any; // <-- Add a property for user info

  menuItems = [
    { name: 'Schedule', icon: './HomeWhite.png', routes: '/schedule' },
    { name: 'Products', icon: './ProductsWhite.png', routes: '/products-list' },
    { name: 'Inventory', icon: './InventoryWhite.png', routes: '/inventory-dashboard' },
    { name: 'Sales Invoice', icon: './SalesWhite.png', routes: '/sale' },
    { name: 'Job Orders', icon: './JobOrderWhite.png', routes: '/job-order' },
    { name: 'Quotations', icon: './QuotationsWhite.png', routes: '/quotations'},
    { name: 'User Management', icon: './QuotationsWhite.png', routes: '/user-management' },
  ];

  constructor(private router: Router, private authService: AuthService) {
    // Update user info on each navigation event
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUser = this.authService.getUserInfo();
        const hiddenRoutes = ['/login', '/'];

        // If URL contains '#' (anchor link), do nothing
        if (this.router.url.includes('#')) {
          return;
        }
        this.ShowLayout = !hiddenRoutes.includes(this.router.url);
      }
    });
  }

  ngOnInit(): void {
    // Also update on initialization
    this.currentUser = this.authService.getUserInfo();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  confirmLogout() {
    if (confirm('Are you sure you want to log out?')) {
      // Clear the token from local storage via AuthService
      this.authService.logout();
      // Redirect to the login page
      this.router.navigate(['/login']);
    }
  }
}
