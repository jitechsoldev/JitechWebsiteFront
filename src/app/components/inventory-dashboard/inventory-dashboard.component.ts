import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { StockMovementService } from '../../services/stock-movement.service';
import { StockMovementComponent } from '../stock-movement/stock-movement.component';

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
  incomingStock: number = 0;
  outgoingStock: number = 0;

  // ✅ Keep Pagination Variables
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private inventoryService: InventoryService,
    private stockMovementService: StockMovementService
  ) {}

  ngOnInit() {
    this.getTotalStock();
    this.getRecentStockMovements();
    this.calculateIncomingOutgoingStock();
  }

  reloadInventory() {
    console.log('🔄 Reloading Inventory...');
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
    this.stockMovementService
      .getStockMovements(this.currentPage, this.itemsPerPage)
      .subscribe(
        (response) => {
          this.recentMovements = response.data;
          this.totalPages = response.totalPages;
        },
        (error) => {
          console.error('❌ Error fetching stock movements:', error);
        }
      );
  }

  calculateIncomingOutgoingStock() {
    this.stockMovementService.getStockMovements().subscribe((response) => {
      const movements = response.data;

      this.incomingStock = movements
        .filter((m: any) => m.type === 'INCREASE')
        .reduce((acc: number, m: any) => acc + m.quantity, 0);

      this.outgoingStock = movements
        .filter((m: any) => m.type === 'DECREASE')
        .reduce((acc: number, m: any) => acc + m.quantity, 0);
    });
  }

  // ✅ Keep Pagination Functions
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getRecentStockMovements();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getRecentStockMovements();
    }
  }
}
