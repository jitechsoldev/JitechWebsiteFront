import { ProductService } from './../../services/product.service';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
} from '@angular/forms';
import { SaleService } from '../../services/sale.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

// Import XLSX and file-saver libraries
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.css'],
})
export class SaleComponent implements OnInit {
  saleForm: FormGroup;
  products: any[] = [];
  sales: any[] = [];
  isLoading = false;
  errorMessage = '';
  isModalOpen = false;
  isEditMode = false;
  editingSaleId: string | null = null;

  searchQuery = '';
  searchUpdated = new Subject<string>();

  // Sorting & Pagination
  sortColumn = 'saleID';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  // New property for submission confirmation modal
  showSubmitModal: boolean = false;
  // New property for custom validation error modal (if needed)
  validationError: string = '';
  showValidationModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private productService: ProductService
  ) {
    // Add validators for saleForm fields
    this.saleForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(3)]],
      dateOfPurchase: ['', Validators.required],
      warranty: ['', Validators.required],
      termPayable: ['', Validators.required],
      modeOfPayment: ['', Validators.required],
      status: ['', Validators.required],
      saleItems: this.fb.array([]),
    });

    // Debounce search input to prevent excessive API calls
    this.searchUpdated.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.loadSales();
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadSales();
    if (this.saleItems.length === 0) {
      this.addSaleItem();
    }
  }

  get saleItems(): FormArray {
    return this.saleForm.get('saleItems') as FormArray;
  }

  createSaleItem(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      itemTotal: [{ value: 0, disabled: true }],
    });
  }

  addSaleItem(): void {
    this.saleItems.push(this.createSaleItem());
  }

  removeSaleItem(index: number): void {
    this.saleItems.removeAt(index);
  }

  updateItemTotal(index: number): void {
    const itemGroup = this.saleItems.at(index);
    const productId = itemGroup.get('product')?.value;
    const quantity = itemGroup.get('quantity')?.value;
    const product = this.products.find((p) => p._id === productId);

    if (product) {
      const availableStock = product.stockLevel;
      if (quantity > availableStock) {
        itemGroup.get('quantity')?.setErrors({ exceedsAvailable: true });
        itemGroup.get('itemTotal')?.setValue(0);
      } else {
        itemGroup.get('itemTotal')?.setValue(product.price * quantity);
      }
    }
  }

  get overallTotal(): number {
    return this.saleItems.controls.reduce((sum, control) => {
      const total = control.get('itemTotal')?.value;
      return sum + (total ? parseFloat(total) : 0);
    }, 0);
  }

  getAvailableStock(productId: string): number {
    const product = this.products.find((p) => p._id === productId);
    return product ? product.stockLevel : 0;
  }

  getBadgeClasses(status: string): string {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'Completed') {
      return 'bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs';
    } else if (lowerStatus === 'In-progress') {
      return 'bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs';
    } else if (lowerStatus === 'Cancelled') {
      return 'bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs';
    }
    return 'bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs';
  }

  loadProducts(): void {
    this.productService.getProducts(1, 1000).subscribe({
      next: (res) => {
        this.products = res.data || res;
      },
      error: (err) => console.error('Error fetching products:', err),
    });
  }

  loadSales(): void {
    const queryParams: any = {
      page: this.currentPage,
      sortBy: this.sortColumn,
      order: this.sortDirection,
    };
    if (this.searchQuery) queryParams.search = this.searchQuery;
    this.saleService.getSales(queryParams).subscribe({
      next: (res) => {
        this.sales = res.data || res;
        this.totalPages = res.totalPages || 1;
        this.currentPage = res.currentPage || 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error: (err) => console.error('Error fetching sales:', err),
    });
  }

  sortTable(column: string): void {
    this.sortColumn = column;
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadSales();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadSales();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saleForm.reset();
    while (this.saleItems.length !== 0) {
      this.saleItems.removeAt(0);
    }
    this.addSaleItem();
    this.errorMessage = '';
    this.isEditMode = false;
    this.editingSaleId = null;
  }

  // For editing sale (only Edit button exists)
  editSale(sale: any): void {
    this.isEditMode = true;
    this.editingSaleId = sale._id;
    this.saleForm.patchValue({
      clientName: sale.clientName,
      dateOfPurchase: new Date(sale.dateOfPurchase)
        .toISOString()
        .substring(0, 10),
      warranty: sale.warranty,
      termPayable: sale.termPayable,
      modeOfPayment: sale.modeOfPayment,
      status: sale.status,
    });
    while (this.saleItems.length !== 0) {
      this.saleItems.removeAt(0);
    }
    sale.saleItems.forEach((item: any) => {
      const saleItemGroup = this.createSaleItem();
      saleItemGroup.patchValue({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        itemTotal: item.totalAmount,
      });
      this.saleItems.push(saleItemGroup);
    });
    this.openModal();
  }

  // Instead of immediate submission, show confirmation modal
  handleSubmit(): void {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      this.showValidationError(
        'Please ensure all fields are filled correctly.'
      );
      return;
    }
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
    this.isLoading = true;
    const saleData = {
      ...this.saleForm.value,
      overallTotalAmount: this.overallTotal,
    };
    console.log('🛒 Sale Data Sent to API:', saleData);
    if (this.isEditMode && this.editingSaleId) {
      this.saleService.updateSale(this.editingSaleId, saleData).subscribe({
        next: (res) => {
          console.log('✅ Sale updated successfully:', res);
          this.loadSales();
          this.isLoading = false;
          this.closeModal();
        },
        error: (err) => {
          console.error('❌ Error updating sale:', err);
          this.errorMessage = err.error?.error || 'An error occurred';
          this.isLoading = false;
        },
      });
    } else {
      this.saleService.createSale(saleData).subscribe({
        next: (res) => {
          console.log('✅ Sale created successfully:', res);
          this.loadSales();
          this.isLoading = false;
          this.closeModal();
        },
        error: (err) => {
          console.error('❌ Error creating sale:', err);
          this.errorMessage = err.error?.error || 'An error occurred';
          this.isLoading = false;
        },
      });
    }
  }

  showValidationError(message: string): void {
    this.validationError = message;
    this.showValidationModal = true;
  }

  closeValidationModal(): void {
    this.validationError = '';
    this.showValidationModal = false;
  }

  // ----- Export to Excel Feature for Sales -----
  exportToExcel(): void {
    const exportData = this.sales.map((sale) => ({
      'Sale ID': sale.saleID,
      'Client Name': sale.clientName,
      Products: sale.saleItems
        .map(
          (item: any) =>
            `${item.product?.productName || 'N/A'} (Qty: ${item.quantity})`
        )
        .join('; '),
      'Overall Total': sale.overallTotalAmount,
      'Date of Purchase': new Date(sale.dateOfPurchase).toLocaleDateString(),
      Warranty: sale.warranty,
      'Term Payable': sale.termPayable,
      'Mode of Payment': sale.modeOfPayment,
      Status: sale.status,
    }));
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Sales: worksheet },
      SheetNames: ['Sales'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, 'Sales Report');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }
}
