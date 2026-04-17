import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  //   private backendUrl = 'http://localhost:3000/api';//local URL
  private backendUrl = 'https://smart-job-tracker-api-w44d.onrender.com/api';

  loading = signal(false);

  constructor(private http: HttpClient, private router: Router) {}

  private getHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private request<T>(observable: Observable<T>): Observable<T> {
    this.loading.set(true);
    return observable.pipe(
      catchError((error: any) => {
        if (error?.status === 401 || error?.status === 403) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
          }
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.request(
      this.http.get<T>(`${this.backendUrl}${path}`, {
        headers: this.getHeaders(),
        params,
      })
    );
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.request(
      this.http.post<T>(`${this.backendUrl}${path}`, body, {
        headers: this.getHeaders(),
      })
    );
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.request(
      this.http.put<T>(`${this.backendUrl}${path}`, body, {
        headers: this.getHeaders(),
      })
    );
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.request(
      this.http.patch<T>(`${this.backendUrl}${path}`, body, {
        headers: this.getHeaders(),
      })
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.request(
      this.http.delete<T>(`${this.backendUrl}${path}`, {
        headers: this.getHeaders(),
      })
    );
  }

  authSignup(data: any) {
    return this.post('/auth/signup', data);
  }

  authSignin(data: any) {
    return this.post('/auth/signin', data);
  }

  authSendOtp(email: string) {
    return this.post('/auth/send-otp', { email });
  }

  authVerifyOtp(email: string, token: string) {
    return this.post('/auth/verify-otp', { email, token });
  }

  authPasswordReset(email: string) {
    return this.post('/auth/reset-password', { email });
  }

  authGoogleUrl(redirectUrl: string) {
    const params = new HttpParams().set('redirectTo', redirectUrl);
      return this.get<{ url: string }>('/auth/google', params);
  }
  getUserProfile() {
    return this.get(`/user`);
  }

  updateUserProfile(data: any) {
    return this.put('/user/update', data);
  }

  getJobStatuses() {
    return this.get<any[]>('/jobs/statuses');
  }

  getJobsByUser() {
    return this.get<any[]>('/jobs');
  }

  createJob(data: any) {
    return this.post<any>('/jobs/create', data);
  }

  updateJob(jobId: string, data: any) {
    return this.put<any>(`/jobs/update/${jobId}`, data);
  }

  deleteJob(jobId: string) {
    return this.delete<any>(`/jobs/${jobId}`);
  }

  patchJobStatus(jobId: string, data: any) {
    return this.patch<any>(`/jobs/status/${jobId}`, data);
  }

  searchJobs(query: string) {
    const params = new HttpParams().set('query', query);
    return this.get<any[]>('/jobs/search', params);
  }

  exportJobs() {
    return this.get<any[]>('/jobs/export');
  }

  getTimeline(jobId: string) {
    return this.get<any[]>(`/jobs/timeline/${jobId}`);
  }
    bulkImportJobs(jobs: any[]) {
    return this.post<any>('/jobs/bulk-import', { jobs });
  }
}
