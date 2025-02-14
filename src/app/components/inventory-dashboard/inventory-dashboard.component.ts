import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { StockMovementService } from '../../services/stock-movement.service';

@Component({
  selector: 'app-inventory-dashboard',
  imports: [CommonModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css',
})
export class InventoryDashboardComponent implements OnInit {
  totalStock: number = 0;
  recentMovements: any[] = [];

  constructor(
    private inventoryService: InventoryService,
    private stockMovementService: StockMovementService
  ) {}

  ngOnInit() {
    this.getTotalStock();
    this.getRecentStockMovements();
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
    this.stockMovementService.getStockMovements('all').subscribe((response) => {
      console.log('Stock Movements API Response:', response); // ✅ Log response
      this.recentMovements = response.data.slice(0, 5);
    });
  }
}
