import { Component, ChangeDetectorRef, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { TostNotification } from '../shared/tost-notification/tost-notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TostNotification],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  mode: 'login' | 'signup' | 'forgot' = 'login';
  loginForm: FormGroup;
  signupForm: FormGroup;
  forgotForm: FormGroup;

  isLoading = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'warning'>('error');
  private toastTimeout: any;
  private platformId = inject(PLATFORM_ID);
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.signupForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    // if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated()) {
    //   this.router.navigate(['/dashboard']);
    // }
    if (isPlatformBrowser(this.platformId)) {
    // 1. Check if user is already logged in via localStorage
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // 2. Check if we just returned from Google (Token is in the URL Hash)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      this.handleGoogleHash(hash);
    }
  }
  }
private handleGoogleHash(hash: string) {
  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');

  if (accessToken) {
    // 1. Save Token
    localStorage.setItem('token', accessToken);
    if (expiresIn) {
      this.authService.setTokenExpiry(Number(expiresIn));
    }

    // 2. Extract User Data from the JWT
    try {
      // The JWT is divided into 3 parts by dots. The middle part (index 1) has the data.
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // 3. Map Google/Supabase metadata to your User object format
      const userMetadata = payload.user_metadata || {};
      const user = {
        id: payload.sub,
        email: payload.email,
        first_name: userMetadata.full_name?.split(' ')[0] || userMetadata.name?.split(' ')[0] || 'User',
        last_name: userMetadata.full_name?.split(' ').slice(1).join(' ') || '',
        picture: userMetadata.avatar_url || userMetadata.picture
      };

      // 4. Save User to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
    } catch (e) {
      console.error('Error decoding Google user data', e);
      // Fallback: Save a generic user object so the app doesn't crash
      localStorage.setItem('user', JSON.stringify({ first_name: 'Google', last_name: 'User' }));
    }

    // 5. Cleanup and Redirect
    this.showToast('Login successful!', 'success');
    window.history.replaceState({}, document.title, window.location.pathname);

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 800);
  }
}

  setMode(mode: 'login' | 'signup' | 'forgot') {
    this.mode = mode;
    this.closeToast();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password?.value === confirmPassword?.value ? null : { mismatch: true };
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set('');
    }, 3000);
  }

  closeToast() {
    this.toastMessage.set('');

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }

  onLogin() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.showToast('Please enter a valid email and password.');
      return;
    }

    this.isLoading.set(true);
    this.closeToast();

    this.authService.loginUser(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.handleAuthSuccess(response);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.handleError(err);
      },
    });
  }

  onSignup() {
    if (!this.signupForm.valid) {
      this.signupForm.markAllAsTouched();
      this.showToast('Please fill all signup fields correctly.');
      return;
    }

    this.isLoading.set(true);

    const { name, email, password } = this.signupForm.value;
    const [first_name, ...last] = name.split(' ');
    const payload = { email, password, first_name, last_name: last.join(' ') };

    this.authService.registerUser(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.setMode('login');
        this.showToast('Account created successfully! Please login.','success');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.handleError(err);
      },
    });
  }

  sendOtp() {
    const email = this.loginForm.get('email')?.value;

    if (!email) {
      this.showToast('Enter email first.');
      return;
    }

    this.authService.sendOtp(email).subscribe({
      next: () => {
        this.showToast('OTP sent to your email!','warning');
      },
      error: (err: any) => {
        this.handleError(err);
      },
    });
  }

  onForgotPassword() {
    const email = this.forgotForm.get('email')?.value;

    if (!email || this.forgotForm.get('email')?.invalid) {
      this.showToast('Please enter a valid email address first.');
      return;
    }

    this.isLoading.set(true);

    this.authService.sendPasswordReset(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.setMode('login');
        this.showToast('A password reset link has been sent to your email.','warning');
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.showToast('Could not send reset link. Try again later.');
      },
    });
  }

  continueWithGoogle() {
    this.authService.getGoogleLoginUrl().subscribe({
      next: (res: any) => {
        this.showToast('Redirecting to Google...','warning');
        window.location.href = res.url;
      },
      error: (err: any) => {
        this.handleError(err);
      },
    });
  }

  private handleAuthSuccess(res: any) {
    if (isPlatformBrowser(this.platformId)) {
      const token = res?.session?.access_token || res?.access_token;
      const user = res?.user || {
        id: res?.id,
        first_name: res?.first_name,
        last_name: res?.last_name,
      };

      if (token) {
        localStorage.setItem('token', token);
        const expiresIn = res?.session?.expires_in || res?.expires_in;
        if (expiresIn) {
          this.authService.setTokenExpiry(expiresIn);
        }
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      this.emitAuthSyncEvent('login', token, user, res?.session?.expires_in || res?.expires_in);
    }

    this.showToast('Login successful!', 'success');
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 800);
  }

  private emitAuthSyncEvent(type: 'login' | 'logout', token?: string, user?: any, expiresIn?: number) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const eventPayload: any = {
      type,
      ts: Date.now(),
    };

    if (token) {
      eventPayload.token = token;
    }
    if (user) {
      eventPayload.user = user;
    }
    if (expiresIn != null) {
      eventPayload.expires_in = expiresIn;
    }

    window.localStorage.setItem('jobTrackerAuthSync', JSON.stringify(eventPayload));
  }

  private handleError(err: any) {
    let message = 'Connection Error';

    if (typeof err?.error === 'string') {
      message = err.error;
    } else if (err?.error?.details) {
      message = err.error.details;
    } else if (err?.error?.error) {
      message = err.error.error;
    } else if (err?.message) {
      message = err.message;
    }

    if (message === 'Invalid login credentials') {
      this.showToast('Invalid email or password. Please try again.');
    } else {
      this.showToast(message || 'Unexpected error occurred.');
    }
  }
}
