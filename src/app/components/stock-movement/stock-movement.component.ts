import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { StockMovementService } from '../../services/stock-movement.service';

@Component({
  selector: 'app-stock-movement',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stock-movement.component.html',
  styleUrl: './stock-movement.component.css',
})
export class StockMovementComponent implements OnInit {
  @Output() stockUpdated = new EventEmitter<void>();

  stockMovementForm: FormGroup;
  inventory: any[] = [];
  selectedInventoryId: string = '';
  type: string = 'INCREASE';
  quantity: number = 0;
  serialNumbers: { id: number; value: string }[] = [];
  availableSerialNumbers: string[] = [];
  selectedSerialNumbers: string[] = [];
  message: string = '';
  errors: string[] = [];
  isModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private stockMovementService: StockMovementService
  ) {
    this.stockMovementForm = this.fb.group({
      inventoryId: ['', Validators.required],
      type: ['INCREASE', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      serialNumbers: this.fb.array([]),
    });
  }

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
    this.errors = [];

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
    this.errors = [];

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
    this.errors = [];

    if (this.selectedSerialNumbers.includes(serial)) {
      this.selectedSerialNumbers = this.selectedSerialNumbers.filter(
        (sn) => sn !== serial
      );
    } else {
      if (this.selectedSerialNumbers.length < this.quantity) {
        this.selectedSerialNumbers.push(serial);
      } else {
        this.errors.push(
          `⚠️ You can only select ${this.quantity} serial numbers.`
        );
      }
    }
  }

  updateSerialNumber(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.serialNumbers[index].value = inputElement.value;
  }

  validateStockMovement(): boolean {
    this.errors = [];

    if (!this.selectedInventoryId) {
      this.errors.push('⚠️ Please select a product.');
    }

    if (this.quantity <= 0 || isNaN(this.quantity)) {
      this.errors.push('⚠️ Quantity must be greater than zero.');
    }

    if (this.type === 'INCREASE') {
      const enteredSerials = this.serialNumbers.map((sn) => sn.value.trim());
      const uniqueSerials = new Set(enteredSerials);

      if (enteredSerials.includes('')) {
        this.errors.push('⚠️ Please enter all serial numbers.');
      }

      if (enteredSerials.length !== uniqueSerials.size) {
        this.errors.push(
          '⚠️ Duplicate serial numbers detected. Please enter unique serials.'
        );
      }
    }

    if (this.type === 'DECREASE') {
      if (this.selectedSerialNumbers.length !== this.quantity) {
        this.errors.push(
          `⚠️ Please select exactly ${this.quantity} serial numbers.`
        );
      }

      for (let serial of this.selectedSerialNumbers) {
        if (!this.availableSerialNumbers.includes(serial)) {
          this.errors.push(
            `⚠️ Serial number ${serial} does not exist in inventory.`
          );
        }
      }
    }

    return this.errors.length === 0;
  }

  updateStock() {
    if (!this.validateStockMovement()) {
      return;
    }

    const stockMovement = {
      inventoryId: this.selectedInventoryId,
      type: this.type,
      quantity: this.quantity,
      serialNumbers:
        this.type === 'INCREASE'
          ? this.serialNumbers.map((sn) => sn.value.trim())
          : this.selectedSerialNumbers,
    };

    this.stockMovementService.addStockMovement(stockMovement).subscribe(
      (response) => {
        this.message = `✅ Stock successfully updated! New Stock Level: ${response.newStockLevel}`;
        this.loadInventory();
        this.serialNumbers = [];
        this.availableSerialNumbers = [];
        this.selectedSerialNumbers = [];
        this.errors = [];
      },
      (error) => {
        this.errors.push(`❌ Error: ${error.error.message}`);
      }
    );
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  isFormValid(): boolean {
    this.validateStockMovement();

    return this.errors.length === 0;
  }

  showModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
