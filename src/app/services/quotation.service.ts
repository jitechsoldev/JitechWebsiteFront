import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Quotation } from '../models/quotation';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  // Updated backend URL
  private apiUrl = 'http://localhost:5000/api/quotations';

  constructor(private http: HttpClient) {}

  // Retrieve the latest quotation from the backend
  getLatestQuotation(): Observable<Quotation> {
    return this.http.get<Quotation>(`${this.apiUrl}/latest`)
      .pipe(
        catchError(this.handleError<Quotation>('getLatestQuotation'))
      );
  }

  // Retrieve all quotations from the backend
  getAllQuotations(): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(`${this.apiUrl}`)
      .pipe(
        catchError(this.handleError<Quotation[]>('getAllQuotations', []))
      );
  }

  // Submit a new quotation to the backend
  addQuotation(quotation: Quotation): Observable<Quotation> {
    return this.http.post<Quotation>(this.apiUrl, quotation)
      .pipe(
        catchError(this.handleError<Quotation>('addQuotation'))
      );
  }

  // Clear quotations (if needed, adjust API endpoint as required)
  clearQuotation(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`)
      .pipe(
        catchError(this.handleError<any>('clearQuotation'))
      );
  }

  // Handle HTTP operation that failed.
  // Let the app continue by returning an empty result.
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
