import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JobOrderService } from '../../services/job-order.service'; // Assuming you have this service
import { SaleService } from '../../services/sale.service'; // Assuming you use this service to get sale details
import { debounceTime, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';

// Import XLSX and file-saver libraries
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-job-order',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './job-order.component.html',
  styleUrl: './job-order.component.css'
})

export class JobOrderComponent implements OnInit {
  jobOrderForm: FormGroup;
  sales: any[] = []; // Store sales info
  jobOrders: any[] = []; // Store fetched job orders
  isModalOpen = false;
  isEditMode = false;
  editingJobOrderId: string | null = null;

  searchQuery = '';
  searchUpdated = new Subject<string>();

  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  // Add these properties at the top of your component class
  saleSearchQuery: string = '';
  filteredSales: any[] = [];
  showSalesDropdown: boolean = false;
  selectedSaleIndex: number = -1;

  sortColumn = 'jobOrderID'; // Default sorting column
  sortDirection: 'asc' | 'desc' = 'desc'; // Default sorting direction

  constructor(
    private fb: FormBuilder,
    private jobOrderService: JobOrderService,
    private saleService: SaleService
  ) {
    this.jobOrderForm = this.fb.group({
      saleID: ['', Validators.required],
      address: ['', Validators.required],
      contactInfo: ['', Validators.required],
      description: ['', Validators.required],
      installationDate: ['', Validators.required],
      status: ['', Validators.required],
    });

    this.searchUpdated.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.loadJobOrders();
    });
  }

  ngOnInit(): void {
    this.loadSales();
    this.loadJobOrders();
  }

  // Get form control methods
  get saleID() {
    return this.jobOrderForm.get('saleID');
  }

  get address() {
    return this.jobOrderForm.get('address');
  }

  get contactInfo() {
    return this.jobOrderForm.get('contactInfo');
  }

  get description() {
    return this.jobOrderForm.get('description');
  }

  get installationDate() {
    return this.jobOrderForm.get('installationDate');
  }

  get status() {
    return this.jobOrderForm.get('status');
  }

  // Modify your loadSales() method to initialize the filtered list
  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (res) => {
        this.sales = res.data || [];
        // Initialize filteredSales with all sales
        this.filteredSales = this.sales;
      },
      error: (err) => {
        console.error('Error fetching sales:', err);
      }
    });
  }

  // Call this on every keypress to filter sales based on the search query
  filterSales(): void {
    this.showSalesDropdown = true;
    const query = this.saleSearchQuery.trim().toLowerCase();
    if (query === '') {
      this.filteredSales = this.sales;
    } else {
      this.filteredSales = this.sales.filter(sale =>
        sale.clientName.toLowerCase().includes(query) ||
        sale.saleID.toLowerCase().includes(query)
      );
    }
    // Reset the selected index whenever the filtered list changes.
    this.selectedSaleIndex = -1;
  }

  // Handle key events for arrow keys and enter.
  onSaleSearchKeyDown(event: KeyboardEvent): void {
    if (!this.showSalesDropdown || !this.filteredSales.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      // Prevent the cursor from moving in the input field.
      event.preventDefault();
      // Move the highlight down. Loop to start if at end.
      this.selectedSaleIndex = (this.selectedSaleIndex + 1) % this.filteredSales.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      // Move the highlight up. Loop to bottom if at beginning.
      this.selectedSaleIndex =
        (this.selectedSaleIndex - 1 + this.filteredSales.length) % this.filteredSales.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      // If an item is highlighted, select it.
      if (this.selectedSaleIndex >= 0 && this.selectedSaleIndex < this.filteredSales.length) {
        this.selectSale(this.filteredSales[this.selectedSaleIndex]);
      }
    }
  }

  // When a sale is selected, patch the form and hide the dropdown.
  selectSale(sale: any): void {
    this.jobOrderForm.patchValue({ saleID: sale._id });
    this.saleSearchQuery = `${sale.clientName} (${sale.saleID})`;
    this.showSalesDropdown = false;
    this.selectedSaleIndex = -1;
  }

  // Load Job Orders
  loadJobOrders(): void {
    const queryParams: any = {
      page: this.currentPage,
     sortBy: this.sortColumn,
     order: this.sortDirection
    };
    if (this.searchQuery) queryParams.search = this.searchQuery;

    this.jobOrderService.getJobOrders(queryParams).subscribe({
      next: (res) => {
        this.jobOrders = res.data || [];
        this.totalPages = res.totalPages || 1;
        this.currentPage = res.currentPage || 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error: (err) => {
        console.error('Error fetching job orders:', err);
      }
    });
  }

  // Open the modal to add a new job order
  openModal(): void {
    this.isModalOpen = true;
  }

  // Close the modal and reset form
  closeModal(): void {
    this.isModalOpen = false;
    this.jobOrderForm.reset();
    this.jobOrderForm.get('saleID')?.enable();
    this.isEditMode = false; this.editingJobOrderId = null;
  }

  // Add or Edit Job Order
  onSubmit(): void {
    if (this.jobOrderForm.invalid) {
      this.jobOrderForm.markAllAsTouched();
      return;
    }

    // If in edit mode, use getRawValue() to include disabled fields
    const jobOrderData = this.isEditMode ? this.jobOrderForm.getRawValue() : this.jobOrderForm.value;

    if (this.isEditMode && this.editingJobOrderId) {
      this.jobOrderService.updateJobOrder(this.editingJobOrderId, jobOrderData).subscribe({
        next: (res) => {
          console.log('Job Order updated successfully:', res);
          this.loadJobOrders();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating job order:', err);
        }
      });
    } else {
      this.jobOrderService.createJobOrder(jobOrderData).subscribe({
        next: (res) => {
          console.log('Job Order created successfully:', res);
          this.loadJobOrders();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating job order:', err);
        }
      });
    }
  }

  // Edit a Job Order
  editJobOrder(jobOrder: any): void {
    this.isEditMode = true;
    this.editingJobOrderId = jobOrder._id;
    this.jobOrderForm.patchValue({
      saleID: jobOrder.saleID,
      address: jobOrder.address,
      contactInfo: jobOrder.contactInfo,
      description: jobOrder.description,
      installationDate: jobOrder.installationDate,
      status: jobOrder.status
    });
    this.jobOrderForm.get('saleID')?.disable();
    this.openModal();
  }

  // Delete a Job Order
  deleteJobOrder(jobOrderId: string): void {
    const confirmDeletion = window.confirm(
      'Are you sure you want to delete this Job Order? This action cannot be undone.'
    );

    if (!confirmDeletion) {
      return; // If user cancels, do nothing.
    }

    this.jobOrderService.deleteJobOrder(jobOrderId).subscribe({
      next: (res) => {
        console.log('Job Order deleted successfully:', res);
        this.loadJobOrders();
      },
      error: (err) => {
        console.error('Error deleting job order:', err);
      }
    });
  }

  // Handle pagination
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadJobOrders();
  }

  // Sorting function for the table
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      // Toggle sorting order if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column and reset sorting to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadJobOrders(); // Refresh job orders with new sorting
  }

  // This method returns the appropriate CSS classes based on the job order status.
  getBadgeClasses(status: string): string {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'completed') {
      return 'bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs';
    } else if (lowerStatus === 'pending') {
      return 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs';
    } else if (lowerStatus === 'cancelled') {
      return 'bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs';
    }
    return 'bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs'; // Default for unknown status
  }

  // ----- Export to Excel Feature -----

  exportToExcel(): void {
    // Map jobOrders to include custom columns (customized Job Order ID and Sale ID)
    const exportData = this.jobOrders.map(order => ({
      'Job Order ID': order.jobOrderID,  // Customize as needed (for example, prepend a prefix)
      'Client': order.clientName,
      'Address': order.address,
      'Contact Info': order.contactInfo,
      'Description': order.description,
      'Installation Date': new Date(order.installationDate).toLocaleDateString(), // You can also format the date here if needed
      'Status': order.status
    }));

    // Create worksheet and workbook from the transformed data
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'JobOrders': worksheet }, SheetNames: ['JobOrders'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Job Orders Report');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
