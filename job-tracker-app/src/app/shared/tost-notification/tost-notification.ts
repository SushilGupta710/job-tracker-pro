import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tost-notification',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tost-notification.html',
  styleUrl: './tost-notification.css',
})
export class TostNotification {
  @Input() toastMessage = ''; 
  @Output() close = new EventEmitter<void>();
  @Input() toastType: 'success' | 'error' | 'warning' = 'error';
  onClose() {
    this.close.emit();
  }
}
