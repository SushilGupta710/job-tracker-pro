import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-tracker-actions-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        type="button"
        class="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        (click)="toggleMenu()"
        aria-label="Open actions menu"
      >
        <span class="flex flex-col justify-between h-6">
          <span class="h-1 w-1 rounded-full bg-current"></span>
          <span class="h-1 w-1 rounded-full bg-current"></span>
          <span class="h-1 w-1 rounded-full bg-current"></span>
        </span>
      </button>

      <div *ngIf="isOpen()" class="absolute right-0 sm:right-0 left-0 sm:left-auto top-full z-50 mt-2 w-48 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          [disabled]="disableExcel()"
          class="w-full px-4 py-3 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          (click)="onDownloadExcel()"
        >
          Download Excel
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
          (click)="onOpenBulkImport()"
        >
          Open bulk import
        </button>
      </div>
    </div>
  `,
})
export class JobTrackerActionsMenuComponent {
  isOpen = signal(false);
  disableExcel = input<boolean>();
  downloadExcel = output<void>();
  openBulkImport = output<void>();

  toggleMenu() {
    this.isOpen.update((v) => !v);
  }

  onDownloadExcel() {
    this.downloadExcel.emit();
    this.isOpen.set(false);
  }

  onOpenBulkImport() {
    this.openBulkImport.emit();
    this.isOpen.set(false);
  }
}
