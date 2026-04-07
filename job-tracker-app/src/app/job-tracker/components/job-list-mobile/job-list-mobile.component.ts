import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../services/job-tracker.service';

@Component({
  selector: 'app-job-list-mobile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-slate-200 dark:border-slate-700">
          <tr class="text-left text-slate-600 dark:text-slate-300">
            <th class="px-4 py-3 font-semibold">Company</th>
            <th class="px-4 py-3 font-semibold">Position</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr *ngFor="let job of jobs()" class="hover:bg-slate-50 dark:hover:bg-slate-900 transition">
            <td class="px-4 py-3">
              <div class="flex flex-col items-center gap-1">
                <img [src]="job.logo || '/assets/default-logo.png'" [alt]="job.company + ' logo'" class="h-8 w-8 rounded-lg object-cover" />
                <span class="font-medium text-slate-900 dark:text-white text-center">{{ job.company }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ job.title }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                [ngClass]="getStatusClass(job.status)"
              >
                {{ job.status }}
              </span>
            </td>
            <td class="px-4 py-3">
              <button
                type="button"
                class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                (click)="viewJob.emit(job.id)"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="jobs().length === 0" class="text-center py-12">
      <p class="text-slate-400 dark:text-slate-500">No jobs yet. Add one to get started!</p>
    </div>
  `,
})
export class JobListMobileComponent {
  jobs = input.required<Job[]>();
  viewJob = output<string>();

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'Saved/New': 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
      'Applied': 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'Interviewing': 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'Offer': 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100',
      'Rejected': 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100',
    };
    return statusClasses[status] || 'bg-slate-200 text-slate-800';
  }
}
