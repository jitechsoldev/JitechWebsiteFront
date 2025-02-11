import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface JobOrder {
  _id?: string;
  clientName: string;
  description: string;
  address: string;
  contactNo: string;
  date: string;
  status: string;
  priority: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobOrderService {
  private apiUrl = 'http://localhost:5000/api/job-orders';

  constructor(private http: HttpClient) {}

  getJobOrders(): Observable<JobOrder[]> {
    return this.http.get<JobOrder[]>(this.apiUrl);
  }

  createJobOrder(job: JobOrder): Observable<JobOrder> {
    return this.http.post<JobOrder>(this.apiUrl, job);
  }

  deleteJobOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
