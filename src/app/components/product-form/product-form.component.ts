import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  @Output() productUpdated = new EventEmitter<void>();
  productForm: FormGroup;
  isEditing = false;
  productId: string | null = null;
  inventory: any[] = [];
  errorMessage: string | null = null;
  isModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private inventoryService: InventoryService,
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

  // ✅ Load product details when editing
  loadProduct(product: any) {
    this.isEditing = true;
    this.productId = product._id;
    this.productForm.patchValue(product);
  }

  saveProduct() {
    if (this.productForm.invalid) return;

    if (this.isEditing) {
      this.productService
        .updateProduct(this.productId!, this.productForm.value)
        .subscribe(
          (response) => {
            console.log('✅ Product updated successfully!', response);
            this.productUpdated.emit(); // Notify parent to reload products
            this.closeModal();
          },
          (error) => {
            console.error('❌ Error updating product:', error);
          }
        );
    } else {
      this.productService.addProduct(this.productForm.value).subscribe(
        (response) => {
          console.log('✅ Product added successfully!', response);
          this.productUpdated.emit(); // Notify parent to reload products
          this.closeModal();
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

  showModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
