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
    this.loadInventory();
  }

  openProductFormModal() {
    if (this.productFormModal) {
      this.selectedProduct = null; // Reset selected product when adding a new one
      this.productFormModal.showModal();
    }
  }

  editProduct(product: any) {
    if (this.productFormModal) {
      this.selectedProduct = product; // Set the selected product
      this.productFormModal.loadProduct(product); // Load product data into the form
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
      // ✅ Convert product name & SKU to lowercase for case-insensitive search
      const searchLower = this.searchQuery?.toLowerCase() || '';
      const productNameLower = product.productName.toLowerCase();
      const skuLower = product.sku.toLowerCase();

      // ✅ Check if product matches search query
      const matchesSearch =
        searchLower === '' ||
        productNameLower.includes(searchLower) ||
        skuLower.includes(searchLower);

      // ✅ Check if product matches selected category
      const matchesCategory =
        this.selectedCategory === '' ||
        product.category === this.selectedCategory;

      // ✅ Check if product matches selected status (active/inactive)
      const matchesStatus =
        this.selectedStatus === '' ||
        product.active.toString() === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // ✅ Ensure sorting is applied after filtering
    this.sortProducts();
  }

  sortProducts() {
    this.filteredProducts.sort((a, b) => {
      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];

      // ✅ Convert to lowercase for case-insensitive sorting
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      return this.sortOrder === 'asc'
        ? valueA > valueB
          ? 1
          : -1
        : valueA < valueB
        ? 1
        : -1;
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
