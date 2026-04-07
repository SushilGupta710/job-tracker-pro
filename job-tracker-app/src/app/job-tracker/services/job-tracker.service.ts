import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth-service';
import { HttpService } from '../../appservice/http-service';

export type JobStatus = 'Saved/New' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface JobTimelineItem {
  id: string | number;
  message: string;
  subMessage?: string;
  date: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  salary: string;
  location: string;
  description: string;
  status: JobStatus;
  appliedAt: string;
  logo: string;
  timeline: JobTimelineItem[];
  source?: string;
}

@Injectable({
  providedIn: 'root',
})
export class JobTrackerService {
  private backendUrl = 'http://localhost:3000/api';
  private statusMap: Record<JobStatus, number> = {
    'Saved/New': 1,
    Applied: 2,
    Interviewing: 3,
    Offer: 4,
    Rejected: 5,
  };

  private jobsSignal = signal<Job[]>([]);
  private searchTermSignal = signal('');
  private statusesSignal = signal<JobStatus[]>(['Saved/New', 'Applied', 'Interviewing', 'Offer', 'Rejected']);
  readonly statuses: JobStatus[] = ['Saved/New', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  readonly jobs = this.jobsSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly statusesDynamic = this.statusesSignal.asReadonly();

  readonly filteredJobs = computed(() => {
    const term = this.searchTermSignal().toLowerCase().trim();
    if (!term) {
      return this.jobsSignal();
    }
    return this.jobsSignal().filter((job) => {
      return (
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        job.status.toLowerCase().includes(term)
      );
    });
  });

  constructor(private httpService: HttpService, private authService: AuthService) {}

  loadStatuses(): Observable<any[]> {
    return this.httpService.getJobStatuses().pipe(
      tap((statuses) => {
        const mapped = statuses.map((s: any) => s.status_name as JobStatus);
        this.statusesSignal.set(mapped);
      })
    );
  }

  setSearchTerm(term: string) {
    this.searchTermSignal.set(term);
  }

  loadJobs(): Observable<any[]> {
    const user = this.authService.getUser();
    if (!user?.id) {
      return new Observable<any[]>((subscriber) => subscriber.complete());
    }

    return this.httpService.getJobsByUser().pipe(
      tap((jobs) => {
        this.jobsSignal.set(jobs.map((job) => this.convertBackendJob(job)));
      })
    );
  }

  addJob(job: Omit<Job, 'id'>): Observable<any> {
    const payload = {
      title: job.title,
      company: job.company,
      url: job.url,
      salary: job.salary,
      location: job.location,
      description: job.description,
      status_id: this.statusMap[job.status] ?? 1,
      job_image_url: job.logo && job.logo !== '/assets/default-logo.png' ? job.logo : null,
    };

    return this.httpService.createJob(payload).pipe(
      tap((data) => {
        const record = Array.isArray(data) ? data[0] : data;
        const createdJob = this.convertBackendJob(record);
        this.jobsSignal.update((jobs) => [createdJob, ...jobs]);
      })
    );
  }

  updateJob(job: Job): Observable<any> {
    const payload = {
      job_title: job.title,
      job_company_name: job.company,
      job_url: job.url,
      job_salary: job.salary,
      job_location: job.location,
      job_description: job.description,
      status_id: this.statusMap[job.status] ?? 1,
      job_modified_date: new Date().toISOString(),
    };

    return this.httpService.updateJob(job.id, payload).pipe(
      tap(() => {
        this.jobsSignal.update((jobs) =>
          jobs.map((j) => (j.id === job.id ? { ...job, appliedAt: payload.job_modified_date } : j))
        );
      })
    );
  }

  deleteJob(jobId: string): Observable<any> {
    return this.httpService.deleteJob(jobId).pipe(
      tap(() => {
        this.jobsSignal.update((jobs) => jobs.filter((job) => job.id !== jobId));
      })
    );
  }

  updateJobStatus(jobId: string, newStatus: JobStatus): Observable<any> {
    const payload = {
      status_id: this.statusMap[newStatus] ?? 1,
    };

    return this.httpService.patchJobStatus(jobId, payload).pipe(
      tap(() => {
        this.jobsSignal.update((jobs) =>
          jobs.map((job) => {
            if (job.id === jobId) {
              const updatedTimeline = [
                {
                  id: job.timeline.length + 1,
                  message: `Status updated to ${newStatus}`,
                  date: new Date().toLocaleString(),
                },
                ...job.timeline,
              ];
              return { ...job, status: newStatus, timeline: updatedTimeline };
            }
            return job;
          })
        );
      })
    );
  }

  getJobsByStatus(status: JobStatus) {
    return this.filteredJobs().filter((job) => job.status === status);
  }

  downloadExcel() {
    const headers = ['Title', 'Company', 'URL', 'Salary', 'Location', 'Status', 'Applied Date', 'Description'];
    const rows = this.jobsSignal().map((job) => [
      job.title,
      job.company,
      job.url,
      job.salary,
      job.location,
      job.status,
      job.appliedAt,
      job.description.replace(/\n/g, ' '),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'job-tracker-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  downloadTemplate() {
    const headers = ['title', 'company', 'url', 'salary', 'location', 'description', 'applieddate', 'status'];
    const csvContent = [headers]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'job-tracker-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  importJobs(jobs: Job[]) {
    const payload = jobs.map((job) => ({
      title: job.title,
      company: job.company,
      url: job.url,
      salary: job.salary,
      location: job.location,
      description: job.description,
      status_id: this.statusMap[job.status] ?? 1,
      job_modified_date: job.appliedAt || new Date().toISOString(),
      job_image_url: job.logo && job.logo !== '/assets/default-logo.png' ? job.logo : null,
    }));

    return this.httpService.bulkImportJobs(payload).pipe(
      tap(() => {
        this.loadJobs().subscribe();
      })
    );
  }

  private convertBackendJob(raw: any): Job {
    return {
      id: String(raw.id),
      title: raw.job_title || raw.title || '',
      company: raw.job_company_name || raw.company || '',
      url: raw.job_url || raw.url || '',
      salary: raw.job_salary || raw.salary || '',
      location: raw.job_location || raw.location || '',
      description: raw.job_description || raw.description || '',
      status: (raw.job_status?.status_name || raw.status || 'Saved/New') as JobStatus,
      appliedAt: raw.job_applieddate || raw.job_modified_date || raw.appliedAt || '',
      logo: raw.job_image_url || '/assets/default-logo.png',
      timeline: raw.timeline || [],
      source: raw.job_source?.source_name || 'Manual',
    };
  }
}
