import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getProductById(id: string): Observable<any> {
    console.log('🔹 Fetching Product from API with ID:', id); // ✅ Log API call
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addProduct(product: any): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

  updateProduct(id: string, product: any): Observable<any> {
    console.log('Updating Product via API:', id, product); // ✅ Log the API call
    return this.http.put(`${this.apiUrl}/${id}`, product);
  }

  toggleProductStatus(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {});
  }

  updateInventoryAfterProductUpdate(productId: string): Observable<any> {
    console.log('🔄 Updating inventory after product update...');
    return this.http.put(`${this.apiUrl}/update-inventory/${productId}`, {});
  }
}
