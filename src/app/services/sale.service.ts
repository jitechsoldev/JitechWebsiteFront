import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  // Get all sales with optional search, pagination & sorting
  getSales(params?: { page?: number; search?: string; sortBy?: string; order?: string }): Observable<any> {
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params?.order) {
      httpParams = httpParams.set('order', params.order);
    }

    return this.http.get(this.apiUrl, { params: httpParams });
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
