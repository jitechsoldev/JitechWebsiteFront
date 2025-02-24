import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import * as jwt_decode from 'jwt-decode';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  // Login using only a password.
  login(password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  // Register a new user.
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Logout user by removing the token.
  logout(): void {
    localStorage.removeItem('token');
  }

  // Check if the user is logged in by decoding and validating the token.
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    try {
      const decoded: any = (jwt_decode as any).default(token);
      // Check if token has expired. The 'exp' claim is in seconds.
      if (decoded.exp * 1000 < Date.now()) {
        this.logout(); // Clear token if expired
        return false;
      }
      return true;
    } catch (error) {
      return false; // Token is invalid
    }
  }
}
