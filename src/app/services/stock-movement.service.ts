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
  getStockMovements(page: number = 1, limit: number = 10): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    return this.http.get(url);
  }
}
