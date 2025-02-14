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
  serialNumbers: string[] = []; // ✅ Dynamic array for serial numbers
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

  generateSerialFields() {
    if (this.type === 'INCREASE') {
      this.serialNumbers = Array(this.quantity).fill(''); // ✅ Create empty serial number fields
    } else {
      this.serialNumbers = []; // ✅ Reset serials when decreasing stock
    }
  }

  updateStock() {
    if (!this.selectedInventoryId || this.quantity <= 0) {
      this.message = 'Please select a product and enter a valid quantity.';
      return;
    }

    // ✅ Validate serial numbers when increasing stock
    if (
      this.type === 'INCREASE' &&
      this.serialNumbers.some((sn) => sn.trim() === '')
    ) {
      this.message = 'Please enter all serial numbers.';
      return;
    }

    const stockMovement = {
      inventoryId: this.selectedInventoryId,
      type: this.type,
      quantity: this.quantity,
      serialNumbers: this.type === 'INCREASE' ? this.serialNumbers : [], // ✅ Only send serials for INCREASE
      reason: this.reason,
    };

    this.stockMovementService.addStockMovement(stockMovement).subscribe(
      (response) => {
        this.message = `Stock successfully updated! New Stock Level: ${response.newStockLevel}`;
        this.loadInventory(); // Refresh inventory list
        this.serialNumbers = []; // ✅ Reset serial numbers after submission
      },
      (error) => {
        this.message = `Error: ${error.error.message}`;
      }
    );
  }
}
