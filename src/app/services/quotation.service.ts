import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Quotation } from '../models/quotation';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  // Updated backend URLs (adjust ports if needed)
  private apiUrl = 'http://localhost:5000/api/quotations';
  private apiUrl_Inventory = 'http://localhost:5000/api/inventory';

  constructor(private http: HttpClient) {}

  // Retrieve the latest quotation from the backend
  getLatestQuotation(): Observable<Quotation> {
    return this.http.get<Quotation>(`${this.apiUrl}/latest`);
  }

  // Submit a new quotation to the backend
  addQuotation(quotation: Quotation): Observable<Quotation> {
    return this.http.post<Quotation>(this.apiUrl, quotation);
  }

  clearQuotation() {
    return this.http.delete('/api/quotations/clear'); // Adjust API endpoint if needed
  }

}
