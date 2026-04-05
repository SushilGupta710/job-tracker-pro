import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobCardComponent } from '../job-card/job-card.component';
import { Job, JobStatus } from '../../services/job-tracker.service';

@Component({
  selector: 'app-job-list-desktop',
  standalone: true,
  imports: [CommonModule, JobCardComponent],
  template: `
    <div class="w-full overflow-x-auto">
      <div class="grid gap-3 p-3 min-w-max" style="grid-template-columns: repeat(5, minmax(200px, 1fr))">
        <div *ngFor="let status of statuses" class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white px-1">{{ status }}</h3>
          <div class="space-y-2 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 p-2 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950 h-[500px] overflow-y-auto"
            (drop)="onDrop($event, status)"
            (dragover)="onDragOver($event)"
          >
            <div *ngIf="getJobsByStatus(status).length === 0" class="text-center py-6">
              <p class="text-xs text-slate-400 dark:text-slate-500">No jobs</p>
            </div>
            <app-job-card
              *ngFor="let job of getJobsByStatus(status)"
              [job]="job"
              (dragStart)="dragStart.emit($event)"
              (viewJob)="selectJob.emit(job.id)"
            />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class JobListDesktopComponent {
  jobs = input.required<Job[]>();
  draggedJobId = input.required<{ set: (value: number) => void }>();
  statusChange = output<{ jobId: number; newStatus: JobStatus }>();
  selectJob = output<number>();
  dragStart = output<number>();

  statuses: JobStatus[] = ['Saved/New', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  getJobsByStatus(status: JobStatus): Job[] {
    return this.jobs().filter((job) => job.status === status);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, newStatus: JobStatus) {
    event.preventDefault();
    event.stopPropagation();
    const draggedData = event.dataTransfer?.getData('text/plain');
    if (draggedData) {
      try {
        const data = JSON.parse(draggedData);
        this.statusChange.emit({ jobId: data.jobId, newStatus });
      } catch (e) {
        console.error('Failed to parse drag data', e);
      }
    }
  }
}
