import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <!-- Close Button -->
        <div class="flex justify-end mb-4">
          <button
            type="button"
            (click)="onCancel()"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Title -->
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ title() }}</h2>

        <!-- Message -->
        <p class="text-slate-600 dark:text-slate-400 mb-6">{{ message() }}</p>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            (click)="onCancel()"
            class="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            No
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            class="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 transition dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  title = input.required<string>();
  message = input.required<string>();
  confirm = output<void>();
  cancel = output<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
