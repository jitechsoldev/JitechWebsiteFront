import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service'; // ✅ Import Inventory Service
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditing = false;
  productId: string | null = null;
  inventory: any[] = [];
  errorMessage: string | null = null; // ✅ Added error message variable

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private inventoryService: InventoryService, // ✅ Inject Inventory Service
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      sku: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      active: [true],
      requiresSerialNumber: [false],
    });
  }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    console.log('🔹 Product ID from URL:', this.productId);

    if (!this.productId) {
      console.log('🆕 Adding a New Product...');
      this.isEditing = false; // ✅ Correctly set to add mode
      return;
    }

    this.isEditing = true;
    console.log('🖊 Editing Product...');
    this.productService.getProductById(this.productId).subscribe(
      (product) => {
        console.log('✅ Loaded Product:', product);
        if (product) {
          this.productForm.patchValue(product);
        } else {
          console.error('❌ Product Not Found, Redirecting...');
          this.router.navigate(['/products-list']);
        }
      },
      (error) => {
        console.error('❌ Error fetching product:', error);
        this.router.navigate(['/products-list']);
      }
    );
  }

  saveProduct() {
    if (this.productForm.invalid) return;

    if (this.isEditing) {
      console.log('Updating Product:', this.productForm.value);
      this.productService
        .updateProduct(this.productId!, this.productForm.value)
        .subscribe(
          (response) => {
            console.log('✅ Product updated successfully!', response);

            // ✅ Call API to update inventory after product update
            this.productService
              .updateInventoryAfterProductUpdate(this.productId!)
              .subscribe(
                (invResponse) => {
                  console.log(
                    '✅ Inventory updated successfully!',
                    invResponse
                  );

                  // ✅ Refresh inventory list in UI
                  this.refreshInventoryList();
                },
                (error) => {
                  console.error('❌ Error updating inventory:', error);
                }
              );

            this.router.navigate(['/products-list']);
          },
          (error) => {
            console.error('❌ Error updating product:', error);
          }
        );
    } else {
      console.log('Adding New Product:', this.productForm.value);
      this.productService.addProduct(this.productForm.value).subscribe(
        (response) => {
          console.log('✅ Product added successfully!', response);
          this.router.navigate(['/products-list']);
        },
        (error) => {
          console.error('❌ Error adding product:', error);
        }
      );
    }
  }

  refreshInventoryList() {
    this.inventoryService.getInventory(1, 1000, 'updatedAt', 'desc').subscribe(
      (invData) => {
        console.log('✅ Updated Inventory Data:', invData);
        this.inventory = invData.data; // ✅ Refresh inventory array
      },
      (error) => {
        console.error('❌ Error fetching updated inventory:', error);
      }
    );
  }
}
