import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { StockMovementService } from '../../services/stock-movement.service';
import { StockMovementComponent } from '../stock-movement/stock-movement.component';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-inventory-dashboard',
  imports: [CommonModule, StockMovementComponent, FormsModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.css'],
})
export class InventoryDashboardComponent implements OnInit {
  @ViewChild('stockMovementModal') stockMovementModal!: StockMovementComponent;
  totalStock: number = 0;
  recentMovements: any[] = [];
  filteredMovements: any[] = [];
  startDate: string = '';
  endDate: string = '';
  selectedType: string = '';
  incomingStock: number = 0;
  outgoingStock: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 5;
  sortColumn: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private inventoryService: InventoryService,
    private stockMovementService: StockMovementService
  ) {}

  ngOnInit() {
    this.loadStockMovements();
    this.filterStockMovements();
    this.getTotalStock();
    this.getRecentStockMovements();
    this.calculateIncomingOutgoingStock();
  }

  reloadInventory() {
    this.getTotalStock();
    this.getRecentStockMovements();
    this.calculateIncomingOutgoingStock();
  }

  openStockMovementModal() {
    if (this.stockMovementModal) {
      this.stockMovementModal.showModal();
    }
  }

  getTotalStock() {
    this.inventoryService
      .getInventory(1, 1000, 'stockLevel', 'desc')
      .subscribe((response) => {
        this.totalStock = response.data.reduce(
          (acc: number, item: any) => acc + item.stockLevel,
          0
        );
      });
  }

  getRecentStockMovements() {
    const filters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    this.stockMovementService.getStockMovements(filters).subscribe(
      (response) => {
        this.recentMovements = response.data.map((movement: any) => ({
          ...movement,
          serialNumbers: movement.serialNumbers || [], // Ensure serialNumbers is always an array
        }));
        this.totalPages = response.totalPages;
        this.filterStockMovements(); // Apply filters
      },
      (error) => {
        console.error('❌ Error fetching stock movements:', error);
      }
    );
  }

  calculateIncomingOutgoingStock() {
    const filters = {
      startDate: this.startDate,
      endDate: this.endDate,
      type: this.selectedType,
      page: this.currentPage,
      limit: this.itemsPerPage,
    };
    this.stockMovementService
      .getStockMovements(filters)
      .subscribe((response) => {
        const movements = response.data;

        this.incomingStock = movements
          .filter((m: any) => m.type === 'INCREASE')
          .reduce((acc: number, m: any) => acc + m.quantity, 0);

        this.outgoingStock = movements
          .filter((m: any) => m.type === 'DECREASE')
          .reduce((acc: number, m: any) => acc + m.quantity, 0);
      });
  }

  loadStockMovements() {
    this.stockMovementService
      .getStockMovements({ page: this.currentPage, limit: this.itemsPerPage })
      .subscribe(
        (response) => {
          this.recentMovements = response.data;
          this.totalPages = response.totalPages;
          this.filterStockMovements(); // Apply filters
        },
        (error) => {
          console.error('❌ Error fetching stock movements:', error);
        }
      );
  }

  filterStockMovements() {
    this.filteredMovements = this.recentMovements.filter((movement) => {
      const movementDate = new Date(movement.timestamp);

      // Check if movement is within the selected date range
      const withinDateRange =
        (!this.startDate || movementDate >= new Date(this.startDate)) &&
        (!this.endDate || movementDate <= new Date(this.endDate));

      // Check if movement matches selected type
      const matchesType = this.selectedType
        ? movement.type === this.selectedType
        : true;

      return withinDateRange && matchesType;
    });
  }

  sortMovements() {
    if (!this.sortColumn) return;

    this.filteredMovements.sort((a, b) => {
      const valueA = a[this.sortColumn];
      const valueB = b[this.sortColumn];

      if (typeof valueA === 'string') {
        return this.sortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });
  }

  setSort(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.sortMovements();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadStockMovements();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadStockMovements();
    }
  }

  async exportStockMovementsToExcel() {
    if (!this.recentMovements || this.recentMovements.length === 0) {
      console.warn('⚠️ No stock movements available to export.');
      return;
    }

    // ✅ Create a new Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Movements');

    // ✅ Define Columns with Proper Widths
    worksheet.columns = [
      { header: 'Product', key: 'productName', width: 25 },
      { header: 'Movement Type', key: 'type', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Serial Numbers', key: 'serialNumbers', width: 40 },
      { header: 'Timestamp', key: 'timestamp', width: 20 },
    ];

    // ✅ Apply Header Styling (Blue Background, White Bold Text)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0070C0' }, // Blue Background
      };
      cell.alignment = { horizontal: 'center' };
    });

    // ✅ Format Data for Excel Export
    this.recentMovements.forEach((movement) => {
      worksheet.addRow({
        productName: movement.inventoryId?.productName || 'Unknown',
        type: movement.type === 'INCREASE' ? 'Incoming' : 'Outgoing',
        quantity: movement.quantity,
        serialNumbers: movement.serialNumbers?.join(', ') || 'N/A', // Join serials into a single cell
        timestamp: new Date(movement.timestamp).toLocaleString(),
      });
    });

    // ✅ Apply Borders to All Cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // ✅ Save Excel File
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `Stock_Movements_${new Date().toISOString()}.xlsx`
    );
  }
}

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
