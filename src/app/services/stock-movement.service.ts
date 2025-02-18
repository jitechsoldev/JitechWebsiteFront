import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockMovementService {
  private apiUrl = 'http://localhost:5000/api/stock-movements';

  constructor(private http: HttpClient) {}

  // Add stock movement (increase/decrease)
  addStockMovement(movement: any): Observable<any> {
    return this.http.post(this.apiUrl, movement);
  }

  // Get stock movements for a specific inventory item
  getStockMovements(filters: {
    startDate?: string;
    endDate?: string;
    type?: string;
    page: number;
    limit: number;
  }): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { params: filters });
  }
}
