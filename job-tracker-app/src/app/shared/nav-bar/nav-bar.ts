import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.css']
})
export class NavBarComponent {
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  currentNav = signal<'dashboard' | 'job-tracker'>('dashboard');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }


  onNavClick(nav: 'dashboard' | 'job-tracker') {
    this.currentNav.set(nav);
    this.router.navigate([`/${nav}`]);
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  toggleTheme() {
    // this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  viewProfile() {
    this.isDropdownOpen = false;
    this.router.navigate(['/profile']);
  }
}