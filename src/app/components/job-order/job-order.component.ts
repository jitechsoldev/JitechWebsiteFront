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
    FormsModule, CommonModule, ReactiveFormsModule
  ],
  styleUrls: ['./job-order.component.css']
})
export class JobOrderComponent implements OnInit {
  jobOrders: JobOrder[] = [];
  isModalOpen: boolean = false; // Controls modal visibility

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

  // Fetch all job orders from backend
  fetchJobOrders() {
    this.jobOrderService.getJobOrders().subscribe((data) => {
      this.jobOrders = data;
    });
  }

  // Add a new job order
  addJobOrder() {
    if (!this.newJobOrder.clientName || !this.newJobOrder.date) {
      alert("Client Name and Date are required!");
      return;
    }

    this.jobOrderService.createJobOrder(this.newJobOrder).subscribe(() => {
      this.fetchJobOrders(); // Refresh job orders
      this.resetForm(); // Reset form after submission
      this.closeModal(); // Close modal
    });
  }

  // Delete a job order
  deleteJobOrder(id: string) {
    if (confirm("Are you sure you want to delete this job order?")) {
      this.jobOrderService.deleteJobOrder(id).subscribe(() => {
        this.fetchJobOrders();
      });
    }
  }

  // Open the modal
  openModal() {
    this.isModalOpen = true;
  }

  // Close the modal
  closeModal() {
    this.isModalOpen = false;
    this.resetForm(); // Clear form when closing modal
  }

  // Reset the form fields
  resetForm() {
    this.newJobOrder = {
      clientName: '',
      description: '',
      address: '',
      contactNo: '',
      date: '',
      status: 'Pending',
      priority: 'Medium'
    };
  }
}
