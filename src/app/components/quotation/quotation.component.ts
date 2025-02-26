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

  paymentTerms: string[] = ['Cash', 'Installment', 'Cheque'];

  // Array to hold multiple quotations, each with its own toggle (isOpen)
  quotations: any[] = [];

  // Toggle for new quotation details (if needed)
  isOpen = false;

  showModal = false;
  products: any[] = [];
  selectedProducts: any[] = [];
  isLoading = false;
  searchTerm: string = ''; // search term for filtering inventory
  selectedProduct: any = null; // selected product from dropdown

  // Form data for creating a new quotation
  formData: Quotation = this.getEmptyQuotation();

  constructor(
    private quotationService: QuotationService,
    private productService: ProductService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    // Clear any stored products from previous selections
    this.selectedProducts = [];
    this.selectedProduct = null;
    localStorage.removeItem('selectedProducts');
    sessionStorage.removeItem('selectedProducts');

    // Load products and all quotations
    this.loadProducts();
    this.loadAllQuotations();

    // Quick patch for default qty/discount on already selected products
    setTimeout(() => {
      console.log('🛍️ Selected Products:', this.selectedProducts);
      this.selectedProducts = this.selectedProducts.map(product => ({
        ...product,
        qty: product.qty || 1,
        discount: product.discount || 0
      }));
    }, 2000);
  }

  /** Toggle the dropdown for a new quotation block (if used) */
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  /**
   * Toggle the dropdown for a specific quotation in the list.
   * @param index Index of the quotation in the `quotations` array.
   */
  toggleQuotationDropdown(index: number) {
    this.quotations[index].isOpen = !this.quotations[index].isOpen;
  }

  loadProducts() {
    this.productService.getProducts(1, 100).subscribe(
      (response) => {
        console.log('✅ Product List Response:', response);
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

  /**
   * Load all quotations from the service.
   * Each quotation is enhanced with an `isOpen` property to toggle details.
   */
  loadAllQuotations() {
    // Assumes your service has a method getAllQuotations() that returns an array
    this.quotationService.getAllQuotations().subscribe(
      (response: Quotation[]) => {
        this.quotations = response.map(q => ({ ...q, isOpen: false }));
        console.log('✅ Loaded Quotations:', this.quotations);
      },
      error => {
        console.error('🚨 Error loading quotations:', error);
      }
    );
  }

  open() {
    // Reset form for new quotation creation
    this.formData = this.getEmptyQuotation();
    this.showModal = true;
  }

  close() {
    this.showModal = false;
    this.selectedProducts = []; // Clear selected products on close
    this.selectedProduct = null;
  }

  submit() {
    // Prepare the quotation data with selected products
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

        // Clear selected products and reset selection
        this.selectedProducts = [];
        this.selectedProduct = null;
        localStorage.removeItem('selectedProducts');
        sessionStorage.removeItem('selectedProducts');

        // Reload all quotations so the new one appears
        this.loadAllQuotations();
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

  // Filter inventory by search term
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
    localStorage.removeItem('selectedProducts');
    sessionStorage.removeItem('selectedProducts');
  }

  // Toggle individual product selection from the inventory modal
  toggleSelection(product: any, event: any) {
    if (event.target.checked) {
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
      this.selectedProducts.forEach(product => {
        if (!product.desiredQty || product.desiredQty < 1) {
          product.desiredQty = 1;
        }
      });
    } else {
      this.selectedProducts = [];
    }
  }

  // Add selected products from modal into the quotation
  addSelectedProducts() {
    this.selectedProducts.forEach(product => {
      product.qty = product.desiredQty ? product.desiredQty : 1;
    });
    console.log('Selected Products:', this.selectedProducts);
    this.closeModal();
  }

  // Final submission of the quotation from the modal
  submitQuotation() {
    console.log('Quotation Submitted:', this.selectedProducts);
  }

  // Compute individual product amount using discount
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

  addProduct() {
    if (this.selectedProduct) {
      console.log('🛒 Adding Product:', this.selectedProduct);

      const exists = this.selectedProducts.some(p => p.sku === this.selectedProduct.sku);
      if (exists) {
        console.warn('⚠️ Product already exists in the selected list!');
        return;
      }
      if (!this.selectedProduct.price) {
        this.selectedProduct.price = this.selectedProduct.defaultPrice || 0;
      }

      this.selectedProducts.push({ ...this.selectedProduct });
      this.products = this.products.filter(item => item.sku !== this.selectedProduct.sku);
      this.selectedProduct = null;
    }
  }

  removeProduct(productToRemove: any) {
    console.log('🗑 Removing Product:', productToRemove);
    this.selectedProducts = this.selectedProducts.filter(product => product.sku !== productToRemove.sku);
    if (!this.products.some(product => product.sku === productToRemove.sku)) {
      this.products.push(productToRemove);
    }
  }

  updateAmount(product: any) {
    if (product.discount < 0) {
      product.discount = 0;
    } else if (product.discount > 100) {
      product.discount = 100;
    }
    // Force Angular change detection update
    this.selectedProducts = [...this.selectedProducts];
  }

  get totalDiscount(): number {
    return this.selectedProducts.reduce((sum, product) => {
      const qty = product.qty || 1;
      const rate = product.price || 0;
      const discountPercent = product.discount || 0;
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

  validateDesiredQty(product: any) {
    if (!product.qty || product.qty < 1) {
      product.qty = 1;
    }
    this.clampDiscount(product);
  }
}
