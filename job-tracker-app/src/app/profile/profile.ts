import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavBarComponent } from '../shared/nav-bar/nav-bar';
import { TostNotification } from '../shared/tost-notification/tost-notification';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavBarComponent, TostNotification, ConfirmationDialogComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  isSaved = false;
  isChanged = signal(false);
  showConfirmDialog = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'warning'>('success');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
      });
    }

    // Track changes
    this.profileForm.valueChanges.subscribe(() => {
      const current = this.profileForm.value;
      const original = this.authService.getUser();
      this.isChanged.set(
        current.firstName !== original?.first_name || current.lastName !== original?.last_name
      );
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.toastType.set(type);
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.showConfirmDialog.set(true);
  }

  onConfirmUpdate() {
    this.showConfirmDialog.set(false);
    const user = this.authService.getUser() || {};
    const updated = {
      ...user,
      first_name: this.profileForm.get('firstName')?.value,
      last_name: this.profileForm.get('lastName')?.value,
    };

    this.authService.updateUserProfile(updated).subscribe({
      next: () => {
        this.isSaved = true;
        this.isChanged.set(false);
        this.showToast('Profile updated successfully!', 'success');
        setTimeout(() => (this.isSaved = false), 2500);
      },
      error: () => {
        this.showToast('Unable to update profile. Please try again.', 'error');
        this.isSaved = false;
      },
    });
  }

  onCancelUpdate() {
    this.showConfirmDialog.set(false);
  }
}