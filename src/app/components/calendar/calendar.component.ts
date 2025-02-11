import { Component, OnInit } from '@angular/core';
import { JobOrderService } from '../../services/job-order.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface JobOrder {
  _id?: string;
  clientName: string;
  description: string;
  address: string;
  contactNo: string;
  date: string;
  status: string;
  priority: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  jobOrders: JobOrder[] = [];
  weeks: JobOrder[][][] = []; // Array of weeks → days → job orders
  daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(private jobOrderService: JobOrderService) {}

  ngOnInit() {
    this.fetchJobOrders();
  }

  fetchJobOrders() {
    this.jobOrderService.getJobOrders().subscribe((jobs) => {
      this.jobOrders = jobs.map(job => ({
        ...job,
        date: new Date(job.date).toLocaleDateString('en-CA') // Ensures "YYYY-MM-DD" format without UTC shift
      }));
      this.organizeJobOrdersByWeek();
    });
  }

  organizeJobOrdersByWeek() {
    this.weeks = []; // Reset weeks array

    // Get the first day of the month
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    let currentWeek: JobOrder[][] = [[], [], [], [], [], [], []];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateObj = new Date(this.currentYear, this.currentMonth, day);
      const dateStr = dateObj.toLocaleDateString('en-CA'); // Format as "YYYY-MM-DD"
      const weekday = dateObj.getDay(); // 0 = Sunday, ..., 6 = Saturday

      if (weekday === 0 && currentWeek.some(day => day.length > 0)) {
        this.weeks.push(currentWeek); // Store previous week
        currentWeek = [[], [], [], [], [], [], []]; // Start new week
      }

      currentWeek[weekday] = this.jobOrders.filter(job => job.date === dateStr);
    }

    if (currentWeek.some(day => day.length > 0)) {
      this.weeks.push(currentWeek); // Store the last week
    }
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.fetchJobOrders();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.fetchJobOrders();
  }

  getMonthName(monthIndex: number): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthIndex];
  }
}
