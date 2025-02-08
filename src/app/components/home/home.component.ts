import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  isScrolled: any;
  products: any;
  constructor(private router: Router) {}
  sidebarOpen = true;
  isRotated = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.isRotated = !this.isRotated;
  }

  logout() {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  }

  // Sample schedule data
  schedules = [
    {
      monday: 'Meeting',
      tuesday: 'Workshop',
      wednesday: 'Coding',
      thursday: 'Review',
      friday: 'Presentation',
      saturday: 'Break',
      sunday: 'Rest',
    },
    {
      monday: 'Project Work',
      tuesday: 'Team Call',
      wednesday: 'Code Review',
      thursday: 'Testing',
      friday: 'Deployment',
      saturday: 'Off',
      sunday: 'Off',
    },
  ];

  // Delete a schedule
  deleteSchedule(index: number) {
    this.schedules.splice(index, 1);
  }
}
