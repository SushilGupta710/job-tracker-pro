import { Component, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { Login } from './login/login';
import { AuthService } from './services/auth-service';

@Component({
  selector: 'app-root',
  imports: [ Login],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('job-tracker-app');
}
