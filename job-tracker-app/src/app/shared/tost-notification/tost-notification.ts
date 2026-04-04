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
  @Input() toastMessage = ''; // receive the value from parent
  @Output() close = new EventEmitter<void>(); // let parent know when user clicks close

  onClose() {
    this.close.emit(); // parent can call `closeToast()` when this fires
  }
}
