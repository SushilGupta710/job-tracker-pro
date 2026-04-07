import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job, JobTimelineItem, JobStatus } from '../../services/job-tracker.service';
import { HttpService } from '../../../appservice/http-service';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-job-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent],
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div class="w-full max-w-4xl rounded-3xl bg-white p-4 sm:p-8 shadow-2xl dark:bg-slate-900 max-h-[85vh] overflow-y-auto">
        <app-confirmation-dialog
          *ngIf="showConfirmDialog()"
          title="Delete Job"
          message="Are you sure you want to delete this job? This action cannot be undone."
          (confirm)="onConfirmDelete()"
          (cancel)="onCancelDelete()"
        ></app-confirmation-dialog>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <img [src]="job().logo || '/assets/default-logo.png'" [alt]="job().company + ' logo'" class="h-12 w-12 sm:h-16 sm:w-16 rounded-xl object-cover" />
            <div>
              <h2 class="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white">{{ job().title }}</h2>
              <p class="text-sm sm:text-lg text-slate-500 dark:text-slate-400 flex items-center gap-2">
                {{ job().company }}
                <span *ngIf="job().location" class="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                  {{ job().location }}
                </span>
              </p>
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
                (click)="onDelete()"
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
            <strong>Applied via {{ job().source }} on {{ formatAppliedDate(job().appliedAt) }}</strong>
          </p>
        </div>

        <div class="mb-6">
          <h3 class="font-semibold text-slate-900 dark:text-white mb-3 text-lg">Activity Timeline</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
            <div *ngFor="let item of timeline()" class="flex gap-3 border-l-2 border-indigo-400 pl-4 py-2">
              <div class="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-400 mt-2"></div>
              <div>
                <p class="font-medium text-slate-900 dark:text-white text-sm">{{ item.message }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.subMessage }}</p>
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
  updateJobStatus = output<{jobId: string, newStatus: JobStatus}>();
  deleteJob = output<string>();
  close = output<void>();
  editJob = output<void>();
  viewJobLink = output<string>();

  editedStatus = signal<string>('');
  editedAppliedAt = signal<string>('');
  timeline = signal<JobTimelineItem[]>([]);
  showConfirmDialog = signal(false);
  private httpService = inject(HttpService);

  constructor() {
    effect(() => {
      const currentJob = this.job();
      this.editedStatus.set(currentJob.status);
      this.editedAppliedAt.set(currentJob.appliedAt);
      // Fetch timeline
      this.httpService.getTimeline(currentJob.id).subscribe({
        next: (data) => {
          const sortedData = data.sort((a: any, b: any) => new Date(a.status_change_date).getTime() - new Date(b.status_change_date).getTime());
          const timelineItems = sortedData.map((item: any, index: number) => {
            const statusName = item.job_status?.status_name || item.status;
            let message = '';
            let subMessage = '';
            if (index === 0) {
              message = 'New Job created';
              subMessage = 'You added a new job';
            } else {
              const prevStatus = sortedData[index - 1].job_status?.status_name || sortedData[index - 1].status;
              message = `Moved to ${statusName}`;
              subMessage = `You moved this job from ${prevStatus} to ${statusName}`;
            }
            return {
              id: item.id,
              message,
              subMessage,
              date: new Date(item.status_change_date).toDateString()
            };
          });
          this.timeline.set(timelineItems);
        },
        error: () => this.timeline.set([])
      });
    });
  }

  updateEditedJob() {
    this.updateJobStatus.emit({jobId: this.job().id, newStatus: this.editedStatus() as JobStatus});
  }

  onDelete() {
    this.showConfirmDialog.set(true);
  }

  onConfirmDelete() {
    this.showConfirmDialog.set(false);
    this.deleteJob.emit(this.job().id);
  }

  onCancelDelete() {
    this.showConfirmDialog.set(false);
  }

  formatAppliedDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toDateString();
  }
}
