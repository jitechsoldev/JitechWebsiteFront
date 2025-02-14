import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private apiUrl = 'http://localhost:5000/api/inventory';
  getStockMovements: any;

  constructor(private http: HttpClient) {}

  // Get paginated inventory list with sorting & filtering
  getInventory(
    page: number,
    limit: number,
    sortBy: string,
    order: string,
    category?: string
  ): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`;
    if (category) url += `&category=${category}`;
    return this.http.get(url);
  }

  // Get single inventory item
  getInventoryItem(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Create a new inventory item
  addInventoryItem(item: any): Observable<any> {
    return this.http.post(this.apiUrl, item);
  }

  // Update an inventory item
  updateInventoryItem(id: string, item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, item);
  }

  // Delete an inventory item
  deleteInventoryItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
