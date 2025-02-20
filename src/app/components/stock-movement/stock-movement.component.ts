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

  onProductChange(event: any) {
    this.selectedInventoryId = event.target.value; // ✅ Ensure value updates
    console.log('🛠️ Selected Inventory ID:', this.selectedInventoryId);

    if (this.selectedInventoryId) {
      this.fetchAvailableSerialNumbers();
    } else {
      console.warn('⚠️ No product selected, cannot fetch serial numbers.');
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

        // ✅ Extract Serial Numbers as an Array
        let serials: string[] = XLSX.utils
          .sheet_to_json(sheet, { header: 1 })
          .flat() as unknown[] as string[];
        console.log('📂 Extracted Serial Numbers from File:', serials);

        // ✅ Filter out empty or undefined serials
        serials = serials
          .map((serial) => serial?.toString().trim()) // Ensure it's a string & trim spaces
          .filter((serial) => serial); // Remove empty values

        if (serials.length === 0) {
          this.errors.push('⚠️ No valid serial numbers found in the file.');
          return;
        }

        // ✅ Detect Duplicate Serial Numbers in the Uploaded File
        const uniqueSerials = new Set(serials);
        if (uniqueSerials.size !== serials.length) {
          this.errors.push(
            '⚠️ Duplicate serial numbers found in the uploaded file. Ensure all serials are unique.'
          );
          return;
        }

        // ✅ Ensure Serial Numbers Do Not Exist in Inventory
        if (!this.availableSerialNumbers) {
          console.error('❌ Error: Available serial numbers not set.');
          this.errors.push(
            '⚠️ Unable to check for existing serial numbers. Please select a product first.'
          );
          return;
        }

        const duplicates = serials.filter((serial) =>
          this.availableSerialNumbers.includes(serial)
        );

        console.log(
          '🔍 Checking against inventory:',
          this.availableSerialNumbers
        );
        console.log('⚠️ Duplicates Found:', duplicates);

        if (duplicates.length > 0) {
          this.errors.push(
            `⚠️ The following serial numbers already exist in inventory: ${duplicates.join(
              ', '
            )}`
          );
          return;
        }

        // ✅ Update Quantity Field in Form
        this.stockMovementForm.patchValue({ quantity: serials.length });

        // ✅ Populate Serial Numbers in Form
        this.serialNumbers = serials.map((value, id) => ({ id, value }));

        // ✅ Sync Serial Numbers with FormArray
        const serialNumberFormArray = this.stockMovementForm.get(
          'serialNumbers'
        ) as FormArray;
        serialNumberFormArray.clear();
        serials.forEach((serial) =>
          serialNumberFormArray.push(new FormControl(serial))
        );

        console.log('✅ Final Serial Numbers Added:', this.serialNumbers);
      } catch (error) {
        console.error('❌ Error processing file:', error);
        this.errors.push(
          '⚠️ An error occurred while processing the file. Please try again.'
        );
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
    this.errors = [];

    if (!this.selectedInventoryId) {
      console.log('❌ No product selected!');
      return;
    }

    const selectedInventory = this.inventory.find(
      (inv) => inv._id === this.selectedInventoryId
    );

    if (selectedInventory) {
      console.log('🟢 Selected Inventory Data:', selectedInventory);

      if (
        selectedInventory.serialNumbers &&
        selectedInventory.serialNumbers.length > 0
      ) {
        this.availableSerialNumbers = Array.from(
          new Set(selectedInventory.serialNumbers)
        ); // ✅ Convert to Set for fast lookup
      } else {
        console.warn('⚠️ No serial numbers found in selected inventory.');
        this.availableSerialNumbers = [];
      }
    } else {
      console.warn('⚠️ Selected inventory item not found!');
      this.availableSerialNumbers = [];
    }

    console.log(
      '🔎 Available Serial Numbers in Inventory:',
      this.availableSerialNumbers
    );
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

    if (this.type === 'INCREASE') {
      this.serialNumbers = Array.from({ length: this.quantity }, (_, i) => ({
        id: i,
        value: this.serialNumbers[i]?.value || '', // Keep previously uploaded serials if available
      }));
    } else {
      this.serialNumbers = [];
    }
  }

  updateStock() {
    if (!this.isFormValid() || this.stockMovementForm.invalid) {
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
        this.stockUpdated.emit(); // ✅ Notify parent component to refresh UI
        this.loadInventory(); // ✅ Reload inventory immediately after update
        this.stockMovementForm.reset();
        this.errors = [];
        this.closeModal();
      },
      (error) => {
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
