// sale.component.ts
import { ProductService } from './../../services/product.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SaleService } from '../../services/sale.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.css']
})
export class SaleComponent implements OnInit {
  saleForm: FormGroup;
  products: any[] = [];
  sales: any[] = [];
  isLoading = false;
  errorMessage = '';
  isModalOpen = false; // controls modal visibility
  isEditMode = false;
  editingSaleId: string | null = null;

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
      saleItems: this.fb.array([]) // array to hold multiple sale items
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadSales();
    // Initialize with one sale item
    this.addSaleItem();
  }

  // Getter for saleItems form array
  get saleItems(): FormArray {
    return this.saleForm.get('saleItems') as FormArray;
  }

  // Create a new sale item form group
  createSaleItem(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      // Optionally include a computed field for item total; you can compute this dynamically as well.
      itemTotal: [{ value: 0, disabled: true }]
    });
  }

  // Add a new sale item to the form array
  addSaleItem(): void {
    this.saleItems.push(this.createSaleItem());
  }

  // Remove a sale item at a given index
  removeSaleItem(index: number): void {
    this.saleItems.removeAt(index);
  }

  // Helper: Returns available stock for a given product ID
  getAvailableStock(productId: string): number {
    const product = this.products.find(p => p._id === productId);
    return product ? product.stockLevel : 0;
  }

  // Calculate the overall total amount for the sale
  get overallTotal(): number {
    return this.saleItems.controls.reduce((sum, itemGroup) => {
      const productId = itemGroup.get('product')?.value;
      const quantity = itemGroup.get('quantity')?.value;
      const product = this.products.find(p => p._id === productId);
      const price = product ? product.price : 0;
      return sum + (price * quantity);
    }, 0);
  }

  // (Optional) Update individual sale item total when product or quantity changes.
  // Update the item total and validate quantity against available stock.
  updateItemTotal(index: number): void {
    const itemGroup = this.saleItems.at(index);
    const productId = itemGroup.get('product')?.value;
    const quantity = itemGroup.get('quantity')?.value;

    // Find the product details (assuming it contains price and stockLevel)
    const product = this.products.find(p => p._id === productId);
    if (product) {
      const available = product.stockLevel;

      // If quantity exceeds available stock, set a custom error.
      if (quantity > available) {
        itemGroup.get('quantity')?.setErrors({ exceedsAvailable: true });
        itemGroup.get('itemTotal')?.setValue(0);
      } else {
        // If quantity is valid, remove the custom error (if present) and update the total.
        if (itemGroup.get('quantity')?.hasError('exceedsAvailable')) {
          itemGroup.get('quantity')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        const price = product.price;
        const itemTotal = price * quantity;
        itemGroup.get('itemTotal')?.setValue(itemTotal);
      }
    }
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res.data || res;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      },
    });
  }

  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (res) => {
        this.sales = res.data || res;
      },
      error: (err) => {
        console.error('Error fetching sales:', err);
      },
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.saleForm.reset();
    // Reset the saleItems FormArray:
    while (this.saleItems.length !== 0) {
      this.saleItems.removeAt(0);
    }
    // Re-add an empty sale item
    this.addSaleItem();
    this.errorMessage = '';
    this.isEditMode = false;
    this.editingSaleId = null;
  }

  // Called on editing an existing sale (if needed)
  editSale(sale: any): void {
    this.isEditMode = true;
    this.editingSaleId = sale._id; // or sale.saleID if using your custom id

    // Populate the main sale fields
    this.saleForm.patchValue({
      clientName: sale.clientName,
      dateOfPurchase: new Date(sale.dateOfPurchase).toISOString().substring(0, 10),
      warranty: sale.warranty,
      termPayable: sale.termPayable,
      modeOfPayment: sale.modeOfPayment,
      status: sale.status
    });

    // Clear any existing saleItems
    while (this.saleItems.length !== 0) {
      this.saleItems.removeAt(0);
    }

    // Populate saleItems array from sale.saleItems
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

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    // Prepare payload. Include overall total if desired.
    const saleData = {
      ...this.saleForm.value,
      overallTotalAmount: this.overallTotal
    };

    if (this.isEditMode && this.editingSaleId) {
      this.saleService.updateSale(this.editingSaleId, saleData).subscribe({
        next: (res) => {
          console.log('Sale updated successfully:', res);
          this.loadSales();
          this.isLoading = false;
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating sale:', err);
          this.errorMessage = err.error?.message || 'An error occurred';
          this.isLoading = false;
        },
      });
    } else {
      this.saleService.createSale(saleData).subscribe({
        next: (res) => {
          console.log('Sale created successfully:', res);
          this.loadSales();
          this.isLoading = false;
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating sale:', err);
          this.errorMessage = err.error?.message || 'An error occurred';
          this.isLoading = false;
        },
      });
    }
  }

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
    // Default badge style if none match
    return 'inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
  }
}
