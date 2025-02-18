import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, ProductFormComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  @ViewChild('productFormModal') productFormModal!: ProductFormComponent;
  products: any[] = [];
  selectedProduct: any | null = null;

  // ✅ Pagination & Filtering Variables
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private productService: ProductService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  reloadProducts() {
    this.loadProducts();
  }

  // ✅ Open Modal for Adding a Product
  openProductFormModal() {
    if (this.productFormModal) {
      this.selectedProduct = null;
      this.productFormModal.showModal();
    }
  }

  // ✅ Open Modal for Editing a Product
  editProduct(product: any) {
    if (this.productFormModal) {
      this.selectedProduct = product;
      this.productFormModal.loadProduct(product);
      this.productFormModal.showModal();
    }
  }

  // ✅ Load products (No filtering parameters)
  loadProducts() {
    this.productService
      .getProducts(this.currentPage, this.itemsPerPage)
      .subscribe(
        (response) => {
          this.products = response.data;
          this.totalPages = response.totalPages;
        },
        (error) => {
          console.error('❌ Error loading products:', error);
        }
      );
  }

  loadInventory() {
    this.inventoryService.getInventory(1, 1000, 'updatedAt', 'desc').subscribe(
      (response) => {
        console.log('✅ Inventory updated after product toggle:', response);
      },
      (error) => {
        console.error('❌ Error loading inventory:', error);
      }
    );
  }

  toggleProductStatus(product: any) {
    const updatedStatus = !product.active;
    this.productService
      .updateProduct(product._id, { active: updatedStatus })
      .subscribe(
        (response) => {
          console.log('✅ Product updated:', response);
          this.loadProducts();
        },
        (error) => {
          console.error('❌ Error updating product:', error);
        }
      );
  }

  // ✅ Pagination Functions
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }
}
