import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job, JobTimelineItem } from '../../services/job-tracker.service';

@Component({
  selector: 'app-job-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div class="w-full max-w-4xl rounded-3xl bg-white p-4 sm:p-8 shadow-2xl dark:bg-slate-900 max-h-[85vh] overflow-y-auto">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <img [src]="job().logo" [alt]="job().company + ' logo'" class="h-12 w-12 sm:h-16 sm:w-16 rounded-xl object-cover" />
            <div>
              <h2 class="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">{{ job().title }}</h2>
              <p class="text-sm sm:text-lg text-slate-500 dark:text-slate-400">{{ job().company }}</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 flex-shrink-0">
            <a
              [href]="job().url"
              target="_blank"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm sm:text-base"
            >
              View Job Link
            </a>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="editJob.emit()"
                class="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 transition dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium"
              >
                Edit
              </button>
              <button
                type="button"
                (click)="deleteJob.emit(job().id)"
                class="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 transition dark:bg-red-500 dark:hover:bg-red-600 font-medium"
              >
                Delete
              </button>
              <select
                [(ngModel)]="editedStatus"
                (change)="updateEditedJob()"
                class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option>Saved/New</option>
                <option>Applied</option>
                <option>Interviewing</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            <strong>Applied Date:</strong> {{ editedAppliedAt() }}
          </p>
        </div>

        <div class="mb-6">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-3 text-lg">Activity Timeline</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
            <div *ngFor="let item of job().timeline" class="flex gap-3 border-l-2 border-indigo-400 pl-4 py-2">
              <div class="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-400 mt-2"></div>
              <div>
                <p class="font-medium text-slate-900 dark:text-white text-sm">{{ item.message }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `,
})
export class JobDetailModalComponent {
  job = input.required<Job>();
  updateJob = output<Job>();
  deleteJob = output<number>();
  close = output<void>();
  editJob = output<void>();
  viewJobLink = output<string>();

  editedStatus = signal<string>('');
  editedAppliedAt = signal<string>('');

  constructor() {
    effect(() => {
      const currentJob = this.job();
      this.editedStatus.set(currentJob.status);
      this.editedAppliedAt.set(currentJob.appliedAt);
    });
  }

  updateEditedJob() {
    const updated: Job = {
      ...this.job(),
      status: this.editedStatus() as any,
      appliedAt: this.editedAppliedAt(),
    };
    this.updateJob.emit(updated);
  }
}
