import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service';
import { ProductFormComponent } from '../product-form/product-form.component';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  categories = ['Biometrics', 'Software', 'Printer', 'Accessories'];

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
        !this.selectedCategory || product.category === this.selectedCategory;

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

  async exportProductsToExcel() {
    if (!this.products || this.products.length === 0) {
      console.warn('⚠️ No products available to export.');
      return;
    }

    // ✅ Create a new Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Product List');

    // ✅ Define Columns with Proper Widths
    worksheet.columns = [
      { header: 'Product Name', key: 'productName', width: 25 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Stock Level', key: 'stockLevel', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      {
        header: 'Requires Serial Number',
        key: 'requiresSerialNumber',
        width: 20,
      },
      { header: 'Created Date', key: 'createdAt', width: 20 },
    ];

    // ✅ Apply Header Styling (Blue Background, White Bold Text)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0070C0' }, // Blue Background
      };
      cell.alignment = { horizontal: 'center' };
    });

    // ✅ Format Data for Excel Export
    this.products.forEach((product) => {
      worksheet.addRow({
        productName: product.productName,
        sku: product.sku,
        category: product.category,
        price: `₱${product.price.toFixed(2)}`,
        stockLevel: product.stockLevel,
        status: product.active ? 'Active' : 'Inactive',
        requiresSerialNumber: product.requiresSerialNumber ? 'Yes' : 'No',
        createdAt: new Date(product.createdAt).toLocaleString(),
      });
    });

    // ✅ Apply Borders to All Cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // ✅ Save Excel File
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Product_List_${new Date().toISOString()}.xlsx`);
  }
}

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
