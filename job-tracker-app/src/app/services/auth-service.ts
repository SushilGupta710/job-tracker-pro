import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  registerUser(userData: any) {
    // This calls your Node.js API, NOT Supabase directly
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  loginUser(credentials: any): Observable<any> {
    // This calls your Node.js server.js signin route
    return this.http.post(`${this.apiUrl}/signin`, credentials);
  }

  sendOtp(email: string) {
    return this.http.post(`${this.apiUrl}/send-otp`, { email });
  }

  verifyOtp(email: string, token: string) {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, token });
  }

  getGoogleLoginUrl() {
    return this.http.get<{ url: string }>(`${this.apiUrl}/google`);
  }

  sendPasswordReset(email: string) {
  // Direct call to Supabase via your Node server or directly
  return this.http.post(`${this.apiUrl}/reset-password`, { email });
}
}
