import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  mode: 'login' | 'signup' | 'forgot' = 'login';
  loginForm: FormGroup;
  signupForm: FormGroup;
  otpForm: FormGroup;
  forgotForm: FormGroup;

  showOtpInput = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
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

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  setMode(mode: 'login' | 'signup' | 'forgot') {
    this.mode = mode;
    this.errorMessage = '';
    this.showOtpInput = false;
    this.loginForm.reset();
    this.signupForm.reset();
    this.forgotForm.reset();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password?.value === confirmPassword?.value ? null : { mismatch: true };
  }


onLogin() {
  if (this.loginForm.valid) {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.loginUser(this.loginForm.value)
      .pipe(
        // This operator runs ALWAYS after the request finishes
        finalize(() => {
          this.isLoading = false;
          // Forced check for the UI
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: (response) => {
          this.handleAuthSuccess(response);
        },
        error: (err) => {
          // Pass the exact error object to your working helper
          this.handleError(err);
        }
      });
  } else {
    this.loginForm.markAllAsTouched();
  }
}
  // --- Signup Logic ---
  onSignup() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const { name, email, password } = this.signupForm.value;
      const [first_name, ...last] = name.split(' ');
      const payload = { email, password, first_name, last_name: last.join(' ') };

      this.authService.registerUser(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.setMode('login');
          alert('Account created! Please login.');
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  // --- OTP Logic ---
  sendOtp() {
    const email = this.loginForm.get('email')?.value;
    if (!email) return alert('Enter email first');

    this.authService.sendOtp(email).subscribe({
      next: () => {
        this.showOtpInput = true;
        this.errorMessage = 'OTP sent to your email!';
      },
      error: (err) => this.handleError(err),
    });
  }

  onVerifyOtp() {
    const email = this.loginForm.get('email')?.value;
    const otp = this.otpForm.get('otp')?.value;
    this.authService.verifyOtp(email, otp).subscribe({
      next: (res) => this.handleAuthSuccess(res),
      error: (err) => this.handleError(err),
    });
  }

  // --- Forgot Password ---
  onForgotPassword() {
    const email = this.forgotForm.get('email')?.value;
    if (!email || this.forgotForm.get('email')?.invalid) {
      this.errorMessage = 'Please enter a valid email address first.';
      return;
    }

    this.isLoading = true;
    this.authService.sendPasswordReset(email).subscribe({
      next: () => {
        this.isLoading = false;
        alert('A password reset link has been sent to your email.');
        this.setMode('login');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Could not send reset link. Try again later.';
      },
    });
  }

  continueWithGoogle() {
    this.authService.getGoogleLoginUrl().subscribe((res) => (window.location.href = res.url));
  }

  private handleAuthSuccess(res: any) {
    this.isLoading = false;
    localStorage.setItem('token', res.session.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.router.navigate(['/dashboard']);
  }

private handleError(err: any) {
  this.isLoading = false;
  
  // Look at your test JSON: the message is in err.error.details
  const message = err.error?.details || err.error?.error || 'Connection Error';
  
  if (message === 'Invalid login credentials') {
    this.errorMessage = 'Invalid email or password. Please try again.';
  } else {
    this.errorMessage = message;
  }

  // Force the toast to show
  this.cdr.detectChanges();

  setTimeout(() => {
    this.errorMessage = '';
    this.cdr.detectChanges();
  }, 2000);
}
}
