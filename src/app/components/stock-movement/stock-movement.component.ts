import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import * as XLSX from 'xlsx';
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
  type: any;
  quantity: number = 0;
  serialNumbers: { id: number; value: string }[] = [];
  availableSerialNumbers: string[] = [];
  selectedSerialNumbers: string[] = [];
  errors: string[] = [];
  isModalOpen: boolean = false;
  selectedInventoryId: any;
  requiresSerialNumber: boolean = false;

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

    // Run form validation whenever the form value changes
    this.stockMovementForm.valueChanges.subscribe(() => {
      this.isFormValid();
    });
  }

  loadInventory() {
    this.inventoryService
      .getInventory(1, 1000, 'productName', 'asc')
      .subscribe((response) => {
        this.inventory = response.data;
      });
  }

  onProductChange(event: any) {
    this.selectedInventoryId = event.target.value;

    if (this.selectedInventoryId) {
      const selectedInventory = this.inventory.find(
        (inv) => inv._id === this.selectedInventoryId
      );

      if (selectedInventory && selectedInventory.productId) {
        this.requiresSerialNumber =
          selectedInventory.productId.requiresSerialNumber ?? false;
      } else {
        this.requiresSerialNumber = false;
      }

      this.fetchAvailableSerialNumbers();
    }
  }

  updateSerialInputs() {
    if (
      this.requiresSerialNumber &&
      this.stockMovementForm.get('type')?.value === 'INCREASE'
    ) {
      this.generateSerialFields();
    } else {
      this.serialNumbers = [];
      this.stockMovementForm.setControl('serialNumbers', this.fb.array([]));
    }
  }

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        let serials: string[] = XLSX.utils
          .sheet_to_json(sheet, { header: 1 })
          .flat() as string[];

        serials = serials
          .map((serial) => serial?.toString().trim())
          .filter((serial) => serial);

        serials = Array.from(new Set(serials));

        if (serials.length === 0) {
          this.errors.push('⚠️ No valid serial numbers found in the file.');
          return;
        }

        // ✅ Clear existing serial numbers before adding new ones
        this.serialNumbersArray.clear();
        this.serialNumbers = serials.map((value, id) => ({ id, value }));

        serials.forEach((serial) =>
          this.serialNumbersArray.push(new FormControl(serial))
        );

        this.stockMovementForm.patchValue({ quantity: serials.length });
      } catch (error) {
        this.errors.push('⚠️ Error processing file.');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  validateAndInsertSerials(serials: string[]) {
    this.errors = [];

    if (serials.length !== this.quantity) {
      this.errors.push(
        `⚠️ You must upload exactly ${this.quantity} serial numbers.`
      );
      return;
    }

    // ✅ Check for duplicates
    const uniqueSerials = new Set(serials);
    if (uniqueSerials.size !== serials.length) {
      this.errors.push(
        '⚠️ Duplicate serial numbers detected. Please upload unique values.'
      );
      return;
    }

    // ✅ Assign serial numbers with explicit type
    this.serialNumbers = serials.map(
      (value, id): { id: number; value: string } => ({ id, value })
    );
  }

  fetchAvailableSerialNumbers() {
    if (!this.selectedInventoryId) return;

    const selectedInventory = this.inventory.find(
      (inv) => inv._id === this.selectedInventoryId
    );

    if (selectedInventory) {
      this.requiresSerialNumber =
        selectedInventory.productId?.requiresSerialNumber || false;

      this.availableSerialNumbers = this.requiresSerialNumber
        ? [...new Set(selectedInventory.serialNumbers as string[])]
        : [];
    }
  }

  toggleSerialSelection(serial: string) {
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

    this.stockMovementForm.patchValue({
      serialNumbers: [...this.selectedSerialNumbers],
    });

    this.isFormValid();
  }

  isFormValid(): boolean {
    if (this.stockMovementForm.value.type === 'INCREASE') {
      const allSerialsValid = this.serialNumbersArray.controls.every(
        (sn) => sn.valid && sn.value.trim() !== ''
      );
      return this.stockMovementForm.valid && allSerialsValid;
    }

    if (this.stockMovementForm.value.type === 'DECREASE') {
      if (
        this.selectedSerialNumbers.length !==
        this.stockMovementForm.value.quantity
      ) {
        return false;
      }

      return this.stockMovementForm.valid;
    }

    return this.stockMovementForm.valid;
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

    if (this.requiresSerialNumber && type === 'INCREASE') {
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

    if (this.requiresSerialNumber && type === 'DECREASE') {
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

  updateStock() {
    if (!this.isFormValid() || this.stockMovementForm.invalid) {
      console.error('❌ Cannot submit, form is invalid.');
      return;
    }

    // ✅ Prevent multiple API calls
    if (this.stockMovementForm.disabled) {
      console.warn(
        '⚠️ Submission already in progress. Preventing duplicate request.'
      );
      return;
    }

    this.stockMovementForm.disable(); // Disable form to prevent resubmission

    const stockMovement = {
      inventoryId: this.stockMovementForm.value.inventoryId,
      type: this.stockMovementForm.value.type,
      quantity: this.stockMovementForm.value.quantity,
      serialNumbers: this.requiresSerialNumber
        ? this.serialNumbersArray.value.map((sn: string) => sn.trim())
        : undefined, // ⛔️ FIX: Don't send empty array, send `undefined` instead
    };

    console.log('📤 Submitting Stock Movement:', stockMovement);

    this.stockMovementService.addStockMovement(stockMovement).subscribe(
      () => {
        this.stockUpdated.emit();
        this.loadInventory();
        this.stockMovementForm.reset();
        this.closeModal();
        this.stockMovementForm.enable(); // ✅ Re-enable form after success
      },
      (error) => {
        console.error('❌ API Error:', error);
        this.errors.push(`❌ Error: ${error.error.message || 'Unknown error'}`);
        this.stockMovementForm.enable(); // ✅ Ensure form is re-enabled on error
      }
    );
  }

  generateSerialFields() {
    this.errors = [];
    const quantity = this.stockMovementForm.get('quantity')?.value || 0;

    console.log(
      `⚡ Generating Serial Fields | Requires Serial Number: ${this.requiresSerialNumber}, Quantity: ${quantity}`
    );

    if (this.requiresSerialNumber && quantity > 0) {
      this.serialNumbers = Array.from({ length: quantity }, (_, i) => ({
        id: i,
        value: this.serialNumbers[i]?.value || '', // ✅ Preserve previous values
      }));

      // ✅ Ensure FormArray updates dynamically
      const serialNumberFormArray = this.stockMovementForm.get(
        'serialNumbers'
      ) as FormArray;
      serialNumberFormArray.clear();

      this.serialNumbers.forEach((serial) =>
        serialNumberFormArray.push(
          new FormControl(serial.value, Validators.required)
        )
      );

      console.log('✅ Serial Number Fields Created:', this.serialNumbers);
    } else {
      // ✅ If serials are NOT required, clear the array
      this.serialNumbers = [];
      this.stockMovementForm.setControl('serialNumbers', this.fb.array([]));
    }

    // ✅ Force UI update
    setTimeout(() => {
      this.stockMovementForm.updateValueAndValidity();
    }, 10);
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
