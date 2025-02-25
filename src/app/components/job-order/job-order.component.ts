import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JobOrderService } from '../../services/job-order.service';
import { SaleService } from '../../services/sale.service';
import { debounceTime, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-job-order',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './job-order.component.html',
  styleUrls: ['./job-order.component.css']
})
export class JobOrderComponent implements OnInit {
  jobOrderForm: FormGroup;
  sales: any[] = [];
  jobOrders: any[] = [];
  isModalOpen = false;
  isEditMode = false;
  editingJobOrderId: string | null = null;

  searchQuery = '';
  searchUpdated = new Subject<string>();

  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  saleSearchQuery: string = '';
  filteredSales: any[] = [];
  showSalesDropdown: boolean = false;
  selectedSaleIndex: number = -1;

  sortColumn = 'jobOrderID';
  sortDirection: 'asc' | 'desc' = 'desc';

  // New properties for confirmation modals:
  showDeleteModal: boolean = false;
  jobOrderIdToDelete: string | null = null;
  showSubmitModal: boolean = false;

  // Custom validation error modal already exists:
  validationError: string = '';
  showValidationModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private jobOrderService: JobOrderService,
    private saleService: SaleService
  ) {
    // Updated validators for stricter checks
    this.jobOrderForm = this.fb.group({
      saleID: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      contactInfo: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
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

  // Getters for form controls
  get saleID() { return this.jobOrderForm.get('saleID'); }
  get address() { return this.jobOrderForm.get('address'); }
  get contactInfo() { return this.jobOrderForm.get('contactInfo'); }
  get description() { return this.jobOrderForm.get('description'); }
  get installationDate() { return this.jobOrderForm.get('installationDate'); }
  get status() { return this.jobOrderForm.get('status'); }

  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (res) => {
        this.sales = res.data || [];
        this.filteredSales = this.sales;
      },
      error: (err) => console.error('Error fetching sales:', err)
    });
  }

  filterSales(): void {
    this.showSalesDropdown = true;
    const query = this.saleSearchQuery.trim().toLowerCase();
    this.filteredSales = query
      ? this.sales.filter(sale =>
          sale.clientName.toLowerCase().includes(query) ||
          sale.saleID.toLowerCase().includes(query)
        )
      : this.sales;
    this.selectedSaleIndex = -1;
  }

  onSaleSearchKeyDown(event: KeyboardEvent): void {
    if (!this.showSalesDropdown || !this.filteredSales.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSaleIndex = (this.selectedSaleIndex + 1) % this.filteredSales.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedSaleIndex = (this.selectedSaleIndex - 1 + this.filteredSales.length) % this.filteredSales.length;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.selectedSaleIndex >= 0 && this.selectedSaleIndex < this.filteredSales.length) {
        this.selectSale(this.filteredSales[this.selectedSaleIndex]);
      }
    }
  }

  selectSale(sale: any): void {
    this.jobOrderForm.patchValue({ saleID: sale._id });
    this.saleSearchQuery = `${sale.clientName} (${sale.saleID})`;
    this.showSalesDropdown = false;
    this.selectedSaleIndex = -1;
  }

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
      error: (err) => console.error('Error fetching job orders:', err)
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.jobOrderForm.reset();
    this.jobOrderForm.get('saleID')?.enable();
    this.isEditMode = false;
    this.editingJobOrderId = null;
  }

  // Custom validation error modal
  showValidationError(message: string): void {
    this.validationError = message;
    this.showValidationModal = true;
  }

  closeValidationModal(): void {
    this.validationError = '';
    this.showValidationModal = false;
  }

  // Instead of directly submitting, handle submission via confirmation modal.
  handleSubmit(): void {
    if (this.jobOrderForm.invalid) {
      this.jobOrderForm.markAllAsTouched();
      this.showValidationError('Please ensure all fields are filled correctly.');
      return;
    }
    // Optionally close/hide the main modal:
    this.isModalOpen = false;
    this.openSubmitModal();
  }

  openSubmitModal(): void {
    this.showSubmitModal = true;
  }

  confirmSubmit(): void {
    this.showSubmitModal = false;
    this.doSubmit();
  }

  cancelSubmit(): void {
    this.showSubmitModal = false;
  }

  doSubmit(): void {
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
          this.showValidationError('Error updating job order. Please try again.');
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
          this.showValidationError('Error creating job order. Please try again.');
        }
      });
    }
  }

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

  // Instead of using window.confirm for deletion, open our custom delete modal.
  openDeleteModal(jobOrderId: string): void {
    this.jobOrderIdToDelete = jobOrderId;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.jobOrderIdToDelete) {
      this.jobOrderService.deleteJobOrder(this.jobOrderIdToDelete).subscribe({
        next: (res) => {
          console.log('Job Order deleted successfully:', res);
          this.loadJobOrders();
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error deleting job order:', err);
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete(): void {
    this.jobOrderIdToDelete = null;
    this.showDeleteModal = false;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadJobOrders();
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadJobOrders();
  }

  getBadgeClasses(status: string): string {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'completed') {
      return 'bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs';
    } else if (lowerStatus === 'pending') {
      return 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs';
    } else if (lowerStatus === 'cancelled') {
      return 'bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs';
    }
    return 'bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs';
  }

  // ----- Export to Excel Feature -----
  exportToExcel(): void {
    const exportData = this.jobOrders.map(order => ({
      'Job Order ID': order.jobOrderID,
      'Client': order.clientName,
      'Address': order.address,
      'Contact Info': order.contactInfo,
      'Description': order.description,
      'Installation Date': new Date(order.installationDate).toLocaleDateString(),
      'Status': order.status
    }));
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
