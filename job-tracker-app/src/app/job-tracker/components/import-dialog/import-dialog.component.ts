import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../services/job-tracker.service';

@Component({
  selector: 'app-import-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div class="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">Import Jobs</h2>

        <div class="mb-6 space-y-4">
          <div>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date Format for Applied Date:</p>
            <p class="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded">
              Use format: YYYY-MM-DD HH:MM (e.g., 2026-04-05 14:30) or leave empty for current date/time
            </p>
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Valid Status Values:</p>
            <div class="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded">
              <span class="font-mono">Saved/New • Applied • Interviewing • Offer • Rejected</span>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Invalid status values will default to "Saved/New"</p>
            </div>
          </div>
          <button
            type="button"
            (click)="downloadTemplate.emit()"
            class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm underline"
          >
            Download empty template
          </button>
        </div>

        <div class="mb-6">
          <div
            class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition cursor-pointer dark:border-slate-600 dark:hover:border-indigo-500"
            (click)="fileInput.click()"
            (dragover)="$event.preventDefault()"
            (drop)="onFileDrop($event)"
          >
            <svg class="mx-auto h-12 w-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Drop CSV file here or click to upload
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Maximum file size: 10MB</p>
            <p *ngIf="selectedFileName()" class="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-semibold">
              📄 {{ selectedFileName() }}
            </p>
          </div>

          <input
            #fileInput
            type="file"
            accept=".csv"
            (change)="onFileSelected($event)"
            class="hidden"
          />
        </div>

        <div *ngIf="parseError()" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {{ parseError() }}
        </div>

        <div *ngIf="parsedJobs().length > 0" class="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
          ✓ {{ parsedJobs().length }} job(s) ready to import
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            (click)="import.emit(parsedJobs())"
            [disabled]="parsedJobs().length === 0"
            class="flex-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Import {{ parsedJobs().length }} Jobs
          </button>
          <button
            type="button"
            (click)="cancel.emit()"
            class="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ImportDialogComponent {
  import = output<Job[]>();
  cancel = output<void>();
  downloadTemplate = output<void>();
  parsedJobs = signal<Job[]>([]);
  selectedFileName = signal<string>('');
  parseError = signal<string>('');

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type === 'text/csv') {
      this.processFile(file);
    }
  }

  private processFile(file: File) {
    this.selectedFileName.set(file.name);
    this.parseError.set('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const jobs = this.parseCSV(csv);
      if (jobs.length === 0) {
        this.parseError.set('No valid jobs found in the CSV file.');
      }
      this.parsedJobs.set(jobs);
    };
    reader.onerror = () => {
      this.parseError.set('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  }

  private parseCSV(csv: string): Job[] {
    try {
      const lines = csv.trim().split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        return [];
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const jobs: Job[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const title = values[headers.indexOf('title')] || '';
        const company = values[headers.indexOf('company')] || '';

        if (!title || !company) continue;

        // Validate status
        const rawStatus = values[headers.indexOf('status')] || '';
        const validStatuses = ['saved/new', 'applied', 'interviewing', 'offer', 'rejected'];
        const status = validStatuses.includes(rawStatus.toLowerCase().trim()) ? rawStatus.trim() : 'Saved/New';

        const job: Job = {
          id: `${Date.now() + i}`,
          title,
          company,
          url: values[headers.indexOf('url')] || '',
          salary: values[headers.indexOf('salary')] || '',
          location: values[headers.indexOf('location')] || '',
          description: values[headers.indexOf('description')] || '',
          appliedAt: values[headers.indexOf('applieddate')] || new Date().toLocaleString(),
          status: status as any,
          logo: '/assets/default-logo.png',
          timeline: [],
        };

        jobs.push(job);
      }

      return jobs;
    } catch (error) {
      this.parseError.set('Error parsing CSV file. Please check the format.');
      return [];
    }
  }
}
