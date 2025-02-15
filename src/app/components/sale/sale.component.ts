import { ProductService } from './../../services/product.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { SaleService } from '../../services/sale.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sale',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
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

  editSale(sale: any): void {
    this.isEditMode = true;
    this.editingSaleId = sale._id; // or sale.saleID if you want to reference by your custom id
    // Populate the form with the sale data
    this.saleForm.patchValue({
      clientName: sale.clientName,
      product: sale.product?._id || sale.product, // Adjust if sale.product is populated differently
      quantity: sale.quantity,
      dateOfPurchase: new Date(sale.dateOfPurchase).toISOString().substring(0, 10),
      warranty: sale.warranty,
      termPayable: sale.termPayable,
      modeOfPayment: sale.modeOfPayment,
      status: sale.status
    });
    this.openModal(); // Open the modal to display the form for editing
  }

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private productService: ProductService
  ) {
    this.saleForm = this.fb.group({
      clientName: ['', Validators.required],
      product: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      dateOfPurchase: ['', Validators.required],
      warranty: ['', Validators.required],
      termPayable: ['', Validators.required],
      modeOfPayment: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadSales();
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
    this.saleForm.reset(); // Optionally reset the form on close
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const saleData = this.saleForm.value;
    if (this.isEditMode && this.editingSaleId) {
      // Call update API method (make sure your saleService has an updateSale method)
      this.saleService.updateSale(this.editingSaleId, saleData).subscribe({
        next: (res) => {
          console.log('Sale updated successfully:', res);
          this.loadSales(); // Refresh the table after update
          this.isLoading = false;
          this.closeModal();
          this.isEditMode = false;
          this.editingSaleId = null;
        },
        error: (err) => {
          console.error('Error updating sale:', err);
          this.errorMessage = err.error?.message || 'An error occurred';
          this.isLoading = false;
        },
      });
    } else {
      // If not in edit mode, create a new sale
      this.saleService.createSale(saleData).subscribe({
        next: (res) => {
          console.log('Sale created successfully:', res);
          this.loadSales(); // Refresh the table after creation
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
}
