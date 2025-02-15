import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../services/product.service'; // ✅ Import ProductService

@Component({
  selector: 'app-inventory-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css',
})
export class InventoryListComponent implements OnInit {
  inventory: any[] = [];
  page = 1;
  limit = 10;
  sortBy = 'createdAt';
  order = 'desc';
  categoryFilter = '';

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService // ✅ Inject ProductService
  ) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.inventoryService.getInventory(1, 1000, 'updatedAt', 'desc').subscribe(
      (response) => {
        console.log('✅ Loaded Updated Inventory:', response.data);
        this.inventory = response.data; // ✅ Ensure inventory array updates
      },
      (error) => {
        console.error('❌ Error loading inventory:', error);
      }
    );
  }

  refreshInventoryAfterEdit(productId: string) {
    this.productService.updateInventoryAfterProductUpdate(productId).subscribe(
      (invResponse) => {
        console.log('✅ Inventory updated successfully!', invResponse);
        this.loadInventory(); // ✅ Refresh inventory after update
      },
      (error) => {
        console.error('❌ Error updating inventory:', error);
      }
    );
  }
}
