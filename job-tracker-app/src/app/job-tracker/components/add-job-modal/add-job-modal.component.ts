import { Component, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job } from '../../services/job-tracker.service';
import { JobTrackerService } from '../../services/job-tracker.service';

interface AddJobForm {
  title: string;
  company: string;
  appliedAt: string;
  status: 'Saved/New' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  url?: string;
  salary?: string;
  location?: string;
  description?: string;
}

@Component({
  selector: 'app-add-job-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div class="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">{{ isEdit() ? 'Update Job' : 'Add New Job' }}</h2>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Row 1: Title and Company -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                [(ngModel)]="form().title"
                name="title"
                class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., Senior Engineer"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                [(ngModel)]="form().company"
                name="company"
                class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., Google"
                required
              />
            </div>
          </div>

          <!-- Row 2: URL and Salary -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Job URL
              </label>
              <input
                type="url"
                [(ngModel)]="form().url"
                name="url"
                class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="https://example.com/job"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Salary
              </label>
              <input
                type="text"
                [(ngModel)]="form().salary"
                name="salary"
                class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., ₹80,000"
              />
            </div>
          </div>

          <!-- Row 3: Location and Date -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Location
              </label>
              <input
                type="text"
                [(ngModel)]="form().location"
                name="location"
                class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., Remote"
              />
            </div>

            <div *ngIf="!isEdit()">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Application Date *
              </label>
              <input
                type="date"
                [(ngModel)]="form().appliedAt"
                name="appliedAt"
                class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <!-- Row 4: Status -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Status *
            </label>
            <select
              [(ngModel)]="form().status"
              name="status"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option *ngFor="let status of service.statusesDynamic()" [value]="status">{{ status }}</option>
            </select>
          </div>

          <!-- Row 5: Description -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              [(ngModel)]="form().description"
              name="description"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Additional details about the job..."
              rows="3"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              class="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 transition dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {{ isEdit() ? 'Update Job' : 'Add Job' }}
            </button>
            <button
              type="button"
              (click)="cancel.emit()"
              class="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AddJobModalComponent {
  jobToEdit = input<Job | null>(null);
  save = output<Job>();
  cancel = output<void>();

   service = inject(JobTrackerService);

  form = signal<AddJobForm>({
    title: '',
    company: '',
    appliedAt: new Date().toLocaleString(),
    status: 'Saved/New',
    url: '',
    salary: '',
    location: '',
    description: '',
  });

  isEdit = signal(false);

  constructor() {
    effect(() => {
      const job = this.jobToEdit();
      if (job) {
        this.isEdit.set(true);
        this.form.set({
          title: job.title,
          company: job.company,
          appliedAt: job.appliedAt.split(' ')[0], // assuming format
          status: job.status,
          url: job.url,
          salary: job.salary,
          location: job.location,
          description: job.description,
        });
      } else {
        this.isEdit.set(false);
        this.form.set({
          title: '',
          company: '',
          appliedAt: new Date().toLocaleString(),
          status: 'Saved/New',
          url: '',
          salary: '',
          location: '',
          description: '',
        });
      }
    });
  }

  onSubmit() {
    const formData = this.form();
    const job: Job = {
      id: this.jobToEdit()?.id ?? String(Date.now()),
      title: formData.title,
      company: formData.company,
      appliedAt: formData.appliedAt,
      status: formData.status as any,
      url: formData.url || '',
      salary: formData.salary || '',
      location: formData.location || '',
      description: formData.description || '',
      logo: this.jobToEdit()?.logo || '/assets/default-logo.png',
      timeline: this.jobToEdit()?.timeline || [],
    };
    this.save.emit(job);
  }
}
