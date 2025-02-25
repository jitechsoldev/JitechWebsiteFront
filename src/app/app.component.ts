import { Component } from '@angular/core';
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

  menuItems = [
    { name: 'Schedule', icon: './HomeWhite.png', routes: '/schedule' },
    { name: 'Products', icon: './ProductsWhite.png', routes: '/products-list' },
    { name: 'Inventory', icon: './InventoryWhite.png', routes: '/inventory-dashboard' },
    { name: 'Sales', icon: './SalesWhite.png', routes: '/sale' },
    { name: 'Job Orders', icon: './JobOrderWhite.png', routes: '/job-order' },
    { name: 'Quotations', icon: './QuotationsWhite.png', routes: '/quotations'},
  ];

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const hiddenRoutes = ['/login', '/'];

        // ✅ Check if URL contains # (anchor link), don't show layout if so
        if (this.router.url.includes('#')) {
          return;
        }

        this.ShowLayout = !hiddenRoutes.includes(this.router.url);
      }
    });
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
