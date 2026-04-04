import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavBarComponent } from '../shared/nav-bar/nav-bar';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavBarComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  isSaved = false;

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
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const user = this.authService.getUser() || {};
    const updated = {
      ...user,
      first_name: this.profileForm.get('firstName')?.value,
      last_name: this.profileForm.get('lastName')?.value,
    };

    this.authService.updateUser(updated).subscribe(() => {
      this.isSaved = true;
      setTimeout(() => (this.isSaved = false), 2500);
    });
  }
}