import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { StockMovementService } from '../../services/stock-movement.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-dashboard',
  imports: [CommonModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.css'],
})
export class InventoryDashboardComponent implements OnInit {
  totalStock: number = 0;
  recentMovements: any[] = [];
  incomingStock: number = 0; // ✅ New: Total of all INCREASE movements
  outgoingStock: number = 0; // ✅ New: Total of all DECREASE movements

  constructor(
    private inventoryService: InventoryService,
    private stockMovementService: StockMovementService
  ) {}

  ngOnInit() {
    this.getTotalStock();
    this.getRecentStockMovements();
    this.calculateIncomingOutgoingStock();
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
    this.stockMovementService.getStockMovements().subscribe((response) => {
      this.recentMovements = response.data.slice(0, 5);
    });
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
}
