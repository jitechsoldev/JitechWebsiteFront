import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobOrderService {
  private apiUrl = 'http://localhost:5000/api/job-orders';

  constructor(private http: HttpClient) {}

  // Create a new Job Order
  createJobOrder(jobOrder: any): Observable<any> {
    return this.http.post(this.apiUrl, jobOrder);
  }

  // Get all Job Orders with optional search & pagination parameters
  getJobOrders(params?: { page?: number; search?: string; sortBy?: string; order?: string }): Observable<any> {
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

  // Get a Job Order by ID
  getJobOrderById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Update an existing Job Order
  updateJobOrder(id: string, jobOrder: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, jobOrder);
  }

  // Delete a Job Order
  deleteJobOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
