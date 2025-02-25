import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuotationService } from '../../services/quotation.service';
import { Quotation } from '../../models/quotation';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service';


@Component({
  selector: 'app-quotation',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './quotation.component.html',
  styleUrl: './quotation.component.css'
})
export class QuotationComponent implements OnInit {

  isOpen = false;
  showModal = false;
  products: any[] = [];
  selectedProducts: any[] = [];
  isLoading = false;
  searchTerm: string = ''; // search term for filtering inventory
  selectedProduct: any = null; // selected product from dropdown

  formData: Quotation = this.getEmptyQuotation();

  constructor(private quotationService: QuotationService,  private productService: ProductService,
    private inventoryService: InventoryService) {}

  ngOnInit() {
     // Clear any stored products from previous selections
  this.selectedProducts = [];
  this.selectedProduct = null;
  localStorage.removeItem('selectedProducts');
  sessionStorage.removeItem('selectedProducts');
  this.loadProducts();

  // Fetch the latest quotation, ensuring old data doesn't persist
  this.loadLatestQuotation();

    setTimeout(() => {
      console.log('🛍️ Selected Products:', this.selectedProducts);
      this.selectedProducts = this.selectedProducts.map(product => ({
        ...product,
        qty: product.qty || 1,  // Default qty to 1
        discount: product.discount || 0  // Default discount to 0
      }));
    }, 2000);
  }

  loadProducts() {
    this.productService.getProducts(1, 100).subscribe(
      (response) => {
        console.log('✅ Product List Response:', response); // Debugging log
        this.products = response.data ? response.data : response;
        this.products.forEach(product => {
          console.log(`🛍️ Product: ${product.productName}, Price: ${product.price}`);
          if (!product.price) {
            console.warn(`⚠️ Product ${product.productName} is missing a price!`);
          }
        });
      },
      (error) => {
        console.error('🚨 Error loading products:', error);
      }
    );
  }

  loadLatestQuotation() {
    this.quotationService.getLatestQuotation().subscribe(latestQuotation => {
      this.formData = latestQuotation;
    this.selectedProducts = latestQuotation.items && latestQuotation.items.length ? latestQuotation.items : [];

    console.log('✅ Selected Products After Load:', this.selectedProducts);
    });
  }

  open() {
    this.formData = this.getEmptyQuotation(); // Reset form for new quotation
    this.showModal = true;
  }

  close() {
    this.showModal = false;
    this.selectedProducts = []; // Clear selected products on close
    this.selectedProduct = null;
  }

  submit() {
    this.formData.items = this.selectedProducts.map(product => ({
      sku: product.sku,
      productName: product.productName,
      description: product.description || '',
      qty: product.qty,
      price: product.price || 0,
      discount: product.discount || 0,
    }));

    this.quotationService.addQuotation(this.formData).subscribe(
      response => {
        console.log('✅ Quotation saved:', response);

        // Force clear selectedProducts before closing
        this.selectedProducts = [];
        this.selectedProduct = null;

        // Also clear any stored data
        localStorage.removeItem('selectedProducts');
        sessionStorage.removeItem('selectedProducts');

        this.loadLatestQuotation(); // Reload latest quotation
        this.close();
      },
      error => {
        console.error('🚨 Error saving quotation:', error);
      }
    );
  }


  logDebugInfo(product: any) {
    console.log(`Product: ${product.productName}`);
    console.log(`Price: ${product.price}, Qty: ${product.qty}, Discount: ${product.discount}`);
    console.log(`Computed Amount: ${this.calculateAmount(product)}`);
    return '';
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US');
  }

  private getEmptyQuotation(): Quotation {
    return {
      quotationNumber: '',
      companyName: '',
      address: '',
      contactNo: '',
      tin: '',
      clientName: '',
      quotationDate: '',
      expiryDate: '',
      reference: '',
      salesPerson: '',
      paymentTerm: ''
    };
  }

  // Returns inventory filtered by search term
  get filteredInventory() {
    if (!this.searchTerm) {
      return this.products;
    }
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(product =>
      product.productName.toLowerCase().includes(term) ||
      (product.sku && product.sku.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term))
    );
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    console.log('❌ Closing Modal and Resetting Selection');

    this.showModal = false;
    this.selectedProducts = [];
    this.selectedProduct = null;

    // Remove stored data to prevent persistence
    localStorage.removeItem('selectedProducts');
    sessionStorage.removeItem('selectedProducts');
  }

  // Toggle individual product selection.
  // Also, the product.desiredQty should already be entered in the modal.
  toggleSelection(product: any, event: any) {
    if (event.target.checked) {
      // Set default quantity if not provided
      if (!product.desiredQty || product.desiredQty < 1) {
        product.desiredQty = 1;
      }
      this.selectedProducts.push(product);
    } else {
      this.selectedProducts = this.selectedProducts.filter(p => p !== product);
    }
  }

  // Toggle selection for all filtered products
  toggleAllSelection(event: any) {
    if (event.target.checked) {
      this.selectedProducts = [...this.filteredInventory];
      // Set default quantity for each product if not provided
      this.selectedProducts.forEach(product => {
        if (!product.desiredQty || product.desiredQty < 1) {
          product.desiredQty = 1;
        }
      });
    } else {
      this.selectedProducts = [];
    }
  }

  // Adds selected products from the modal to the quotation.
  // Copies the desired quantity into product.qty.
  addSelectedProducts() {
    this.selectedProducts.forEach(product => {
      product.qty = product.desiredQty ? product.desiredQty : 1;
    });
    console.log('Selected Products:', this.selectedProducts);
    this.closeModal();
  }

  // Final submission of the quotation
  submitQuotation() {
    console.log('Quotation Submitted:', this.selectedProducts);
  }

  // Compute individual product amount using percentage discount
  calculateAmount(product: any): number {
    const price = product.price || 0;
    const qty = product.qty || 1;
    let discountPercent = product.discount || 0;
    // Clamp discount to 0–100%
    discountPercent = Math.min(Math.max(discountPercent, 0), 100);
    return price * qty * (1 - discountPercent / 100);
  }

  // Updated subTotal using calculateAmount for each product
  get subTotal(): number {
    return this.selectedProducts.reduce((sum, product) => {
      return sum + this.calculateAmount(product);
    }, 0);
  }

  get taxrate(): number {
    // 12% of taxableAmount
    const taxRate = 0.12;
    return taxRate;
  }

  get taxableAmount(): number {
    // Example logic: maybe the taxable amount is subTotal minus any exempt portion
    // For now, let's assume it's just subTotal
    return this.subTotal - (this.subTotal * this.taxrate);
  }

  get vatTotalAmount(): number {
    // VAT = taxrate * taxableAmount
    return this.taxrate * this.subTotal;
  }

  get grandTotal(): number {
    // With consistent calculation logic, grand total equals subTotal.
    return this.subTotal;
  }

  // Adds the selected product and removes it from the available list
  addProduct() {
    if (this.selectedProduct) {
      console.log('🛒 Adding Product:', this.selectedProduct);

      // Prevent duplicate entries
      const exists = this.selectedProducts.some(p => p.sku === this.selectedProduct.sku);
      if (exists) {
        console.warn('⚠️ Product already exists in the selected list!');
        return;
      }

      // Ensure price exists
      if (!this.selectedProduct.price) {
        this.selectedProduct.price = this.selectedProduct.defaultPrice || 0;
      }

      // Add product to the selected list
      this.selectedProducts.push({ ...this.selectedProduct });

      // Remove from available product list
      this.products = this.products.filter(item => item.sku !== this.selectedProduct.sku);

      // Clear selection
      this.selectedProduct = null;
    }
  }


  // Removes the product from the selected list and adds it back to available options
  removeProduct(productToRemove: any) {
    console.log('🗑 Removing Product:', productToRemove);

    // Remove from selectedProducts
    this.selectedProducts = this.selectedProducts.filter(product => product.sku !== productToRemove.sku);

    // Ensure the product is added back to the dropdown options if it's not already there
    if (!this.products.some(product => product.sku === productToRemove.sku)) {
      this.products.push(productToRemove);
    }
  }

  updateAmount(product: any) {
    // Ensure discount is within valid range (0-100%)
    if (product.discount < 0) {
      product.discount = 0;
    } else if (product.discount > 100) {
      product.discount = 100;
    }
    // Force Angular to detect changes and update UI
    this.selectedProducts = [...this.selectedProducts];
  }

  get totalDiscount(): number {
    return this.selectedProducts.reduce((sum, product) => {
      // If you have quantity:
      const qty = product.qty || 1;
      const rate = product.price || 0;
      const discountPercent = product.discount || 0; // e.g., 10 => 10%
      // Convert discount% to decimal, then multiply by (rate * qty)
      const lineDiscountPesos = (rate * qty) * (discountPercent / 100);
      return sum + lineDiscountPesos;
    }, 0);
  }

  clampDiscount(product: any) {
    if (product.discount < 0) {
      product.discount = 0;
    } else if (product.discount > 100) {
      product.discount = 100;
    }
  }

  // Validate quantity (example)
  validateDesiredQty(product: any) {
    if (!product.qty || product.qty < 1) {
      product.qty = 1;
    }
    // ...any stock checks, etc.
    // Then clamp discount if needed
    this.clampDiscount(product);
  }


}
