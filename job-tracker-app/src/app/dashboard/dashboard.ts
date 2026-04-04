import { Component } from '@angular/core';
import { NavBarComponent } from '../shared/nav-bar/nav-bar';

@Component({
  selector: 'app-dashboard',
  imports: [NavBarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
}
