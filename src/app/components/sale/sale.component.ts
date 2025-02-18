// sale.component.ts
import { ProductService } from './../../services/product.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { SaleService } from '../../services/sale.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.css']
})

export class SaleComponent implements OnInit {
  saleForm: FormGroup;
  products: any[] = [];
  sales: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  editingSaleId: string | null = null;
  searchQuery: string = '';
  sortColumn: string = 'dateOfPurchase'; // Default sorting column
  sortDirection: 'asc' | 'desc' = 'desc'; // Default sorting direction


  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  pages: number[] = [];

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private productService: ProductService
  ) {
    this.saleForm = this.fb.group({
      clientName: ['', Validators.required],
      dateOfPurchase: ['', Validators.required],
      warranty: ['', Validators.required],
      termPayable: ['', Validators.required],
      modeOfPayment: ['', Validators.required],
      status: ['', Validators.required],
      saleItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadSales();
    if (this.saleItems.length === 0) {
      this.addSaleItem();
    }
  }

  applyFilter(): void {
    this.currentPage = 1; // Reset to first page when searching
    this.loadSales();
  }

  // Getter for the saleItems FormArray
  get saleItems(): FormArray {
    return this.saleForm.get('saleItems') as FormArray;
  }

  // Create a new sale item FormGroup
  createSaleItem(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      itemTotal: [{ value: 0, disabled: true }]
    });
  }

  // Add a new sale item to the FormArray
  addSaleItem(): void {
    this.saleItems.push(this.createSaleItem());
  }

  // Remove a sale item from the FormArray by index
  removeSaleItem(index: number): void {
    this.saleItems.removeAt(index);
  }

  // Update the total for a sale item and validate quantity against available stock.
  updateItemTotal(index: number): void {
    const itemGroup = this.saleItems.at(index);
    const productId = itemGroup.get('product')?.value;
    const quantity = itemGroup.get('quantity')?.value;
    const product = this.products.find(p => p._id === productId);
    if (product) {
      const available = product.stockLevel;
      if (quantity > available) {
        itemGroup.get('quantity')?.setErrors({ exceedsAvailable: true });
        itemGroup.get('itemTotal')?.setValue(0);
      } else {
        if (itemGroup.get('quantity')?.hasError('exceedsAvailable')) {
          itemGroup.get('quantity')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        const itemTotal = product.price * quantity;
        itemGroup.get('itemTotal')?.setValue(itemTotal);
      }
    }
  }

  // Compute the overall total from all sale items
  get overallTotal(): number {
    return this.saleItems.controls.reduce((sum, control) => {
      const total = control.get('itemTotal')?.value;
      return sum + (total ? parseFloat(total) : 0);
    }, 0);
  }

  // Helper: Return available stock for a given product ID
  getAvailableStock(productId: string): number {
    const product = this.products.find(p => p._id === productId);
    return product ? product.stockLevel : 0;
  }

  // Helper: Return badge classes based on status (ensuring case-insensitive match)
  getBadgeClasses(status: string): string {
    if (!status) {
      return 'inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
    }
    const s = status.trim().toLowerCase();
    if (s === 'completed') {
      return 'inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
    } else if (s === 'pending') {
      return 'inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
    } else if (s === 'cancelled' || s === 'canceled') {
      return 'inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
    }
    return 'inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
  }

  // Load products from the ProductService
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: res => {
        this.products = res.data || res;
      },
      error: err => {
        console.error('Error fetching products:', err);
      }
    });
  }

  // Load sales from the SaleService with pagination
  loadSales(): void {
    const queryParams: any = {
      page: this.currentPage,
      sortBy: this.sortColumn,
      order: this.sortDirection
     };

    if (this.searchQuery) {
      queryParams.search = this.searchQuery;
    }

    this.saleService.getSales(queryParams).subscribe({
      next: (res) => {
        this.sales = res.data || res;
        this.totalPages = res.totalPages || 1;
        this.currentPage = res.currentPage || 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error: (err) => {
        console.error('Error fetching sales:', err);
      }
    });
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      // Toggle sorting order if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column and reset sorting to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadSales(); // Refresh sales with new sorting
  }

  // Paginator: Navigate to a specific page
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadSales();
  }

  // Open the modal for adding/editing a sale
  openModal(): void {
    this.isModalOpen = true;
  }

  // Close the modal and reset the form
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

  // Populate the form for editing an existing sale
  editSale(sale: any): void {
    this.isEditMode = true;
    this.editingSaleId = sale._id;
    this.saleForm.patchValue({
      clientName: sale.clientName,
      dateOfPurchase: new Date(sale.dateOfPurchase).toISOString().substring(0, 10),
      warranty: sale.warranty,
      termPayable: sale.termPayable,
      modeOfPayment: sale.modeOfPayment,
      status: sale.status
    });
    while (this.saleItems.length !== 0) {
      this.saleItems.removeAt(0);
    }
    sale.saleItems.forEach((item: any) => {
      const saleItemGroup = this.createSaleItem();
      saleItemGroup.patchValue({
        product: item.product?._id || item.product,
        quantity: item.quantity,
        itemTotal: item.totalAmount
      });
      this.saleItems.push(saleItemGroup);
    });
    this.openModal();
  }

  // Handle form submission for creating or updating a sale
  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const saleData = {
      ...this.saleForm.value,
      overallTotalAmount: this.overallTotal
    };
    if (this.isEditMode && this.editingSaleId) {
      this.saleService.updateSale(this.editingSaleId, saleData).subscribe({
        next: res => {
          console.log('Sale updated successfully:', res);
          this.loadSales();
          this.isLoading = false;
          this.closeModal();
        },
        error: err => {
          console.error('Error updating sale:', err);
          this.errorMessage = err.error?.error || 'An error occurred';
          this.isLoading = false;
        }
      });
    } else {
      this.saleService.createSale(saleData).subscribe({
        next: res => {
          console.log('Sale created successfully:', res);
          this.loadSales();
          this.isLoading = false;
          this.closeModal();
        },
        error: err => {
          console.error('Error creating sale:', err);
          this.errorMessage = err.error?.error || 'An error occurred';
          this.isLoading = false;
        }
      });
    }
  }
}
