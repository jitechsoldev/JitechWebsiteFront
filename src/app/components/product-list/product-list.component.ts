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
  filteredProducts: any[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  uniqueCategories: string[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;
  sortColumn: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

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

  openProductFormModal() {
    if (this.productFormModal) {
      this.selectedProduct = null;
      this.productFormModal.showModal();
    }
  }

  editProduct(product: any) {
    if (this.productFormModal) {
      this.selectedProduct = product;
      this.productFormModal.loadProduct(product);
      this.productFormModal.showModal();
    }
  }

  loadProducts() {
    this.productService
      .getProducts(this.currentPage, this.itemsPerPage)
      .subscribe(
        (response) => {
          this.products = response.data;
          this.totalPages = response.totalPages;
          this.uniqueCategories = [
            ...new Set(this.products.map((p) => p.category)),
          ];
          this.filterProducts();
        },
        (error) => {
          console.error('❌ Error loading products:', error);
        }
      );
  }

  filterProducts() {
    this.filteredProducts = this.products.filter((product) => {
      const matchesSearch =
        product.productName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCategory = this.selectedCategory
        ? product.category === this.selectedCategory
        : true;
      const matchesStatus = this.selectedStatus
        ? product.active.toString() === this.selectedStatus
        : true;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    this.sortProducts();
  }

  sortProducts() {
    if (!this.sortColumn) return;

    this.filteredProducts.sort((a, b) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (typeof valueA === 'string') {
        return this.sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.sortProducts();
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
        () => {
          product.active = updatedStatus;
        },
        (error) => console.error('❌ Error updating product:', error)
      );
  }

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
