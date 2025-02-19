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
  availableSerialNumbers: string[] = [];
  selectedSerialNumbers: string[] = [];
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

  fetchAvailableSerialNumbers() {
    this.errors = [];
    const selectedInventoryId = this.stockMovementForm.value.inventoryId;

    if (
      this.stockMovementForm.value.type === 'DECREASE' &&
      selectedInventoryId
    ) {
      const selectedInventory = this.inventory.find(
        (inv) => inv._id === selectedInventoryId
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
      if (
        this.selectedSerialNumbers.length <
        this.stockMovementForm.value.quantity
      ) {
        this.selectedSerialNumbers.push(serial);
      } else {
        this.errors.push(
          `⚠️ You can only select ${this.stockMovementForm.value.quantity} serial numbers.`
        );
      }
    }
  }

  validateStockMovement(): boolean {
    this.errors = [];
    const { inventoryId, type, quantity } = this.stockMovementForm.value;

    if (!inventoryId) {
      this.errors.push('⚠️ Please select a product.');
    }

    if (quantity <= 0 || isNaN(quantity)) {
      this.errors.push('⚠️ Quantity must be greater than zero.');
    }

    if (type === 'INCREASE') {
      const enteredSerials = this.serialNumbersArray.value.map((sn: string) =>
        sn.trim()
      );
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

    if (type === 'DECREASE') {
      if (this.selectedSerialNumbers.length !== quantity) {
        this.errors.push(
          `⚠️ Please select exactly ${quantity} serial numbers.`
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

  get serialNumbersArray(): FormArray {
    return this.stockMovementForm.get('serialNumbers') as FormArray;
  }

  generateSerialFields() {
    this.errors = [];
    this.serialNumbersArray.clear(); // Clear previous serial numbers

    if (this.stockMovementForm.value.type === 'INCREASE') {
      console.log('🔍 Generating Serial Number Fields for INCREASE...');

      for (let i = 0; i < this.stockMovementForm.value.quantity; i++) {
        this.serialNumbersArray.push(this.fb.control('', Validators.required));
      }

      console.log(
        '✅ Serial Number Fields Updated:',
        this.serialNumbersArray.controls
      );
    }

    // ✅ Ensure form detects changes and updates validation
    this.stockMovementForm.updateValueAndValidity();
  }

  updateStock() {
    console.log('🔍 Form Submitted - Checking Validity');
    console.log('Form Valid:', this.stockMovementForm.valid);
    console.log('Form Values:', this.stockMovementForm.value);
    console.log('Serial Numbers Array:', this.serialNumbersArray.value);

    if (!this.isFormValid() || this.stockMovementForm.invalid) {
      console.log('❌ Form is Invalid. Fix errors before submitting.');
      return; // Prevent submission if form is invalid
    }

    const stockMovement = {
      inventoryId: this.stockMovementForm.value.inventoryId,
      type: this.stockMovementForm.value.type,
      quantity: this.stockMovementForm.value.quantity,
      serialNumbers:
        this.stockMovementForm.value.type === 'INCREASE'
          ? this.serialNumbersArray.value.map((sn: string) => sn.trim())
          : this.selectedSerialNumbers,
    };

    this.stockMovementService.addStockMovement(stockMovement).subscribe(
      (response) => {
        console.log('✅ Stock Movement Successful:', response);
        this.loadInventory();
        this.stockMovementForm.reset();
        this.errors = [];
        this.closeModal();
      },
      (error) => {
        console.log('❌ API Error:', error);
        this.errors.push(`❌ Error: ${error.error.message}`);
      }
    );
  }

  isFormValid(): boolean {
    console.log('🔍 Checking Form Validity...');

    if (this.stockMovementForm.value.type === 'INCREASE') {
      const allSerialsValid = this.serialNumbersArray.controls.every(
        (sn) => sn.valid && sn.value.trim() !== ''
      );
      console.log('✅ Serial Numbers Valid:', allSerialsValid);

      return this.stockMovementForm.valid && allSerialsValid;
    }

    console.log('✅ Form Valid:', this.stockMovementForm.valid);
    return this.stockMovementForm.valid;
  }

  updateFormValidation() {
    console.log('🔄 Updating Form Validation...');

    this.serialNumbersArray.controls.forEach((control) =>
      control.markAsTouched()
    );
    this.stockMovementForm.updateValueAndValidity();
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
