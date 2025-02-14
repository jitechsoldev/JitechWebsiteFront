import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  showInactive = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((response) => {
      console.log('Loaded Products:', response.data); // ✅ Log API response
      this.products = response.data;
    });
  }

  toggleStatus(productId: string) {
    console.log('Toggling status for Product ID:', productId); // ✅ Log to see if it's triggered
    this.productService.toggleProductStatus(productId).subscribe(
      () => {
        console.log('Product status updated!');
        this.loadProducts(); // ✅ Refresh the product list
      },
      (error) => {
        console.error('Error updating product status:', error);
      }
    );
  }

  logProductId(productId: string) {
    console.log('🖊 Editing Product ID:', productId);
  }
}
