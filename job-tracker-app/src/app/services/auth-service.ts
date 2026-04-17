import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../appservice/http-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpService: HttpService) {}

  registerUser(userData: any) {
    return this.httpService.authSignup(userData);
  }

  loginUser(credentials: any): Observable<any> {
    return this.httpService.authSignin(credentials);
  }

  sendOtp(email: string) {
    return this.httpService.authSendOtp(email);
  }

  verifyOtp(email: string, token: string) {
    return this.httpService.authVerifyOtp(email, token);
  }

  getGoogleLoginUrl() {
    return this.httpService.authGoogleUrl();
  }

  sendPasswordReset(email: string) {
    return this.httpService.authPasswordReset(email);
  }

  getUserProfile() {
    return this.httpService.getUserProfile();
  }

  updateUserProfile(payload: any) {
    return this.httpService.updateUserProfile(payload).pipe(
      tap(() => this.updateUser(payload))
    );
  }

  getToken() {
    if (typeof window === 'undefined') {
      return '';
    }
    if (this.isTokenExpired()) {
      this.logout();
      return '';
    }
    return localStorage.getItem('token') || '';
  }

  setTokenExpiry(expiresInSeconds: number) {
    if (typeof window === 'undefined' || expiresInSeconds == null) {
      return;
    }
    const expiryTime = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem('tokenExpiry', expiryTime.toString());
  }

  getTokenExpiry(): number | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) {
      return null;
    }
    const value = Number(expiry);
    return Number.isFinite(value) ? value : null;
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    return expiry !== null && Date.now() >= expiry;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!this.getToken();
  }

  getUser() {
    if (typeof window === 'undefined') {
      return null;
    }
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  updateUser(user: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return of(user);
  }
}
