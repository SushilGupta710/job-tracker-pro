import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../services/job-tracker.service';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-600 dark:hover:bg-slate-900 cursor-move hover:shadow-md"
      draggable="true"
      (dragstart)="onDragStart($event)"
    >
      <div class="flex items-center gap-2" (click)="viewJob.emit()">
        <img [src]="job().logo || '/assets/default-logo.png'" [alt]="job().company + ' logo'" class="h-8 w-8 rounded-lg object-cover flex-shrink-0" />
        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="text-left text-xs font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
          >
            {{ job().title }}
          </button>
          <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ job().company }}</p>
        </div>
      </div>
      <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {{ job().appliedAt | date: 'short' }}
      </div>
    </div>
  `,
})
export class JobCardComponent {
  job = input.required<Job>();
  dragStart = output<string>();
  viewJob = output<void>();

  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ jobId: this.job().id }));
    }
    this.dragStart.emit(this.job().id);
  }
}
