import { Component, OnInit } from '@angular/core';
import { JobOrderService } from '../../services/job-order.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
})
export class ScheduleComponent implements OnInit {
  jobOrders: any[] = [];

  // Calendar state
  currentYear: number;
  currentMonth: number; // 0-based month index

  constructor(private jobOrderService: JobOrderService) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
  }

  ngOnInit(): void {
    this.loadJobOrders();
  }

  loadJobOrders(): void {
    // Load all job orders (or adjust your query as needed)
    this.jobOrderService.getJobOrders({}).subscribe({
      next: (res) => {
        this.jobOrders = res.data || [];
      },
      error: (err) => {
        console.error('Error fetching job orders:', err);
      },
    });
  }

  // Returns job orders scheduled on the given weekday (0 = Sunday, 6 = Saturday)
  getJobOrdersForWeekday(weekday: number): any[] {
    return this.jobOrders.filter((order) => {
      const d = new Date(order.installationDate);
      return (
        d.getFullYear() === this.currentYear &&
        d.getMonth() === this.currentMonth &&
        d.getDay() === weekday &&
        order.status.toLowerCase() === 'pending'
      );
    });
  }

  // Helper to get the month name for display
  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString(
      'default',
      { month: 'long' }
    );
  }

  // Navigation: go to previous month
  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadJobOrders();
  }

  // Navigation: go to next month
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadJobOrders();
  }

  getBadgeClasses(status: string): string {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'Completed') {
      return 'bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs';
    } else if (lowerStatus === 'In-progress') {
      return 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs';
    } else if (lowerStatus === 'Cancelled') {
      return 'bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs';
    }
    return 'bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs'; // Default for unknown status
  }
}
