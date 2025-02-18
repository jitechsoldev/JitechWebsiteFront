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
  isModalOpen: boolean = false;
  errors: string[] = [];

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

    if (this.productId) {
      this.isEditing = true;
      this.loadProduct(this.productId);
    }
  }

  validateProductForm(): boolean {
    this.errors = [];

    if (this.productForm.invalid) {
      if (this.productForm.get('productName')?.errors) {
        this.errors.push('⚠️ Product Name is required.');
      }
      if (this.productForm.get('sku')?.errors) {
        this.errors.push('⚠️ SKU must be at least 3 characters long.');
      }
      if (this.productForm.get('category')?.errors) {
        this.errors.push('⚠️ Category is required.');
      }
      if (this.productForm.get('price')?.errors) {
        this.errors.push('⚠️ Price must be greater than zero.');
      }
    }

    return this.errors.length === 0;
  }

  loadProduct(id: string) {
    this.productService.getProductById(id).subscribe(
      (product) => {
        if (product) {
          this.productForm.patchValue(product);
        } else {
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
    if (!this.validateProductForm()) {
      return; // Stop if form is invalid
    }

    if (this.isEditing) {
      this.productService
        .updateProduct(this.productId!, this.productForm.value)
        .subscribe(
          () => {
            this.productUpdated.emit();
            this.closeModal();
          },
          (error) => {
            this.errors.push(
              `❌ Error updating product: ${error.error.message}`
            );
          }
        );
    } else {
      this.productService.addProduct(this.productForm.value).subscribe(
        () => {
          this.productUpdated.emit();
          this.closeModal();
        },
        (error) => {
          this.errors.push(`❌ Error adding product: ${error.error.message}`);
        }
      );
    }
  }

  refreshInventoryList() {
    this.inventoryService.getInventory(1, 1000, 'updatedAt', 'desc').subscribe(
      (invData) => {
        console.log('✅ Updated Inventory Data:', invData);
        this.inventory = invData.data;
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
    this.errors = [];
  }
}
