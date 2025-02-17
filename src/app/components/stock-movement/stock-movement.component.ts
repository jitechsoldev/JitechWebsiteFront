import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  @Output() stockUpdated = new EventEmitter<void>(); // ✅ Emit event when stock is updated
  inventory: any[] = [];
  selectedInventoryId: string = '';
  type: string = 'INCREASE';
  quantity: number = 0;
  reason: string = '';
  serialNumbers: { id: number; value: string }[] = [];
  availableSerialNumbers: string[] = [];
  selectedSerialNumbers: string[] = [];
  message: string = '';
  isModalOpen: boolean = false; // ✅ Controls modal visibility

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
      this.serialNumbers = Array.from({ length: this.quantity }, (_, i) => ({
        id: i,
        value: '',
      }));
    } else {
      this.serialNumbers = [];
    }
  }

  fetchAvailableSerialNumbers() {
    if (this.type === 'DECREASE' && this.selectedInventoryId) {
      const selectedInventory = this.inventory.find(
        (inv) => inv._id === this.selectedInventoryId
      );

      if (selectedInventory && selectedInventory.serialNumbers) {
        this.availableSerialNumbers = [...selectedInventory.serialNumbers];
        this.selectedSerialNumbers = [];
      } else {
        this.availableSerialNumbers = [];
      }
    }
  }

  toggleSerialSelection(serial: string) {
    if (this.selectedSerialNumbers.includes(serial)) {
      this.selectedSerialNumbers = this.selectedSerialNumbers.filter(
        (sn) => sn !== serial
      );
    } else {
      if (this.selectedSerialNumbers.length < this.quantity) {
        this.selectedSerialNumbers.push(serial);
      } else {
        this.message = `⚠️ You can only select ${this.quantity} serial numbers.`;
      }
    }
  }

  updateSerialNumber(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.serialNumbers[index].value = inputElement.value;
  }

  updateStock() {
    if (!this.selectedInventoryId || this.quantity <= 0) {
      this.message = '⚠️ Please select a product and enter a valid quantity.';
      return;
    }

    // ✅ Check for duplicate serial numbers in INCREASE
    if (this.type === 'INCREASE') {
      const enteredSerials = this.serialNumbers.map((sn) => sn.value.trim());
      const uniqueSerials = new Set(enteredSerials);

      if (enteredSerials.length !== uniqueSerials.size) {
        this.message =
          '⚠️ Duplicate serial numbers detected. Please enter unique serials.';
        return;
      }
    }

    // ✅ Check for exact number of selected serial numbers in DECREASE
    if (
      this.type === 'DECREASE' &&
      this.selectedSerialNumbers.length !== this.quantity
    ) {
      this.message = `⚠️ Please select exactly ${this.quantity} serial numbers.`;
      return;
    }

    const stockMovement = {
      inventoryId: this.selectedInventoryId,
      type: this.type,
      quantity: this.quantity,
      serialNumbers:
        this.type === 'INCREASE'
          ? this.serialNumbers.map((sn) => sn.value.trim()) // ✅ Ensure no leading/trailing spaces
          : this.selectedSerialNumbers,
      reason: this.reason,
    };

    this.stockMovementService.addStockMovement(stockMovement).subscribe(
      (response) => {
        this.message = `✅ Stock successfully updated! New Stock Level: ${response.newStockLevel}`;
        this.loadInventory();
        this.serialNumbers = [];
        this.availableSerialNumbers = [];
        this.selectedSerialNumbers = [];
      },
      (error) => {
        this.message = `❌ Error: ${error.error.message}`;
      }
    );
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  showModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
