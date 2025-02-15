import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private apiUrl = 'http://localhost:5000/api/sales';

  constructor(private http: HttpClient) {}

  // Create a new sale
  createSale(sale: any): Observable<any> {
    return this.http.post(this.apiUrl, sale);
  }

  // Get all sales
  getSales(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Get a sale by ID
  getSaleById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Update an existing sale
  updateSale(id: string, sale: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, sale);
  }
}
