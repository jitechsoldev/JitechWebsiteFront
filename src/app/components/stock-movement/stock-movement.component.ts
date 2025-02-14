import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { StockMovementService } from '../../services/stock-movement.service';

@Component({
  selector: 'app-stock-movement',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stock-movement.component.html',
  styleUrl: './stock-movement.component.css',
})
export class StockMovementComponent implements OnInit {
  inventory: any[] = [];
  selectedInventoryId: string = '';
  type: string = 'INCREASE';
  quantity: number = 0;
  reason: string = '';
  message: string = '';

  constructor(
    private inventoryService: InventoryService,
    private stockMovementService: StockMovementService
  ) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.inventoryService
      .getInventory(1, 1000, 'productName', 'asc')
      .subscribe((response) => {
        this.inventory = response.data;
      });
  }

  updateStock() {
    if (!this.selectedInventoryId || this.quantity <= 0) {
      this.message = 'Please select a product and enter a valid quantity.';
      return;
    }

    const stockMovement = {
      inventoryId: this.selectedInventoryId,
      type: this.type,
      quantity: this.quantity,
      reason: this.reason,
    };

    this.stockMovementService.addStockMovement(stockMovement).subscribe(
      (response) => {
        this.message = `Stock successfully updated! New Stock Level: ${response.newStockLevel}`;
        this.loadInventory(); // Refresh inventory list
      },
      (error) => {
        this.message = `Error: ${error.error.message}`;
      }
    );
  }
}
