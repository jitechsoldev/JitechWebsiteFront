import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: any[] = [];

  constructor(
    private productService: ProductService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      (response) => {
        this.products = response.data;
      },
      (error) => {
        console.error('❌ Error loading products:', error);
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
          this.loadProducts(); // ✅ Refresh list after status change
        },
        (error) => {
          console.error('❌ Error updating product:', error);
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
}
