import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  username: string;
  roles: string[];
  exp: number;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  // Login now accepts only the password.
  login(credentials: { password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
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
      console.log('No token found.');
      return false;
    }
    try {
      const decoded: DecodedToken = jwtDecode(token) as DecodedToken;
      console.log('Decoded token in isLoggedIn():', decoded);
      if (!decoded.exp) {
        console.error('Token missing exp field.');
        return false;
      }
      if (decoded.exp * 1000 < Date.now()) {
        console.log('Token expired.');
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  // New method to get user info from the token.
  getUserInfo(): DecodedToken | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        return jwtDecode(token) as DecodedToken;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  // Fetch all users (with authentication)
  getUsers(): Observable<any[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. User may not be logged in.');
      return new Observable(observer => {
        observer.error({ status: 401, message: 'Unauthorized' });
        observer.complete();
      });
    }

    return this.http.get<any[]>(`${this.apiUrl}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
