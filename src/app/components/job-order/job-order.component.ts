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
  selector: 'app-job-order',
  templateUrl: './job-order.component.html',
  imports: [
    FormsModule, CommonModule,ReactiveFormsModule
  ],
  styleUrls: ['./job-order.component.css']
})
export class JobOrderComponent implements OnInit {
  jobOrders: JobOrder[] = [];
  newJobOrder: JobOrder = {
    clientName: '',
    description: '',
    address: '',
    contactNo: '',
    date: '',
    status: 'Pending',
    priority: 'Medium'
  };

  constructor(private jobOrderService: JobOrderService) {}

  ngOnInit() {
    this.fetchJobOrders();
  }

  fetchJobOrders() {
    this.jobOrderService.getJobOrders().subscribe((data) => {
      this.jobOrders = data;
    });
  }

  addJobOrder() {
    this.jobOrderService.createJobOrder(this.newJobOrder).subscribe(() => {
      this.fetchJobOrders();
      this.newJobOrder = { clientName: '', description: '', address: '', contactNo: '', date: '', status: 'Pending', priority: 'Medium' };
    });
  }

  deleteJobOrder(id: string) {
    this.jobOrderService.deleteJobOrder(id).subscribe(() => {
      this.fetchJobOrders();
    });
  }
}

