import { Injectable, signal, computed } from '@angular/core';

export type JobStatus = 'Saved/New' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface JobTimelineItem {
  id: number;
  message: string;
  date: string;
}

export interface Job {
  id: number;
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
}

@Injectable({
  providedIn: 'root',
})
export class JobTrackerService {
  private jobsSignal = signal<Job[]>([
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Acme Corp',
      url: 'https://acme.com/careers/frontend',
      salary: '₹80,000',
      location: 'Remote',
      description: 'Build and maintain web interfaces with a strong focus on clean design and accessibility.',
      status: 'Saved/New',
      appliedAt: '2026-04-03 10:30',
      logo: '/assets/logo.svg',
      timeline: [
        { id: 1, message: 'New job created', date: '2026-04-03 10:30' },
      ],
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'Beta Systems',
      url: 'https://beta.systems/jobs/backend',
      salary: '₹95,000',
      location: 'Bangalore',
      description: 'Design APIs, maintain microservices, and help automate deployment workflows.',
      status: 'Applied',
      appliedAt: '2026-03-28 15:20',
      logo: '/assets/default-logo.png',
      timeline: [
        { id: 1, message: 'New job created', date: '2026-03-28 15:20' },
        { id: 2, message: 'Status updated from Saved/New to Applied', date: '2026-03-29 09:40' },
      ],
    },
    {
      id: 3,
      title: 'Product Designer',
      company: 'Crescent Labs',
      url: 'https://crescentlabs.com/apply/designer',
      salary: '₹75,000',
      location: 'Mumbai',
      description: 'Create compelling user experiences and collaborate with product teams to ship design work.',
      status: 'Interviewing',
      appliedAt: '2026-03-25 12:10',
      logo: '/assets/default-logo.png',
      timeline: [
        { id: 1, message: 'New job created', date: '2026-03-25 12:10' },
        { id: 2, message: 'Status updated from Applied to Interviewing', date: '2026-03-26 11:00' },
      ],
    },
  ]);

  private searchTermSignal = signal('');
  readonly statuses: JobStatus[] = ['Saved/New', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  readonly jobs = this.jobsSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();

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

  setSearchTerm(term: string) {
    this.searchTermSignal.set(term);
  }

  addJob(job: Omit<Job, 'id'>) {
    const newJob: Job = { ...job, id: Date.now() };
    this.jobsSignal.update((jobs) => [newJob, ...jobs]);
  }

  updateJob(job: Job) {
    this.jobsSignal.update((jobs) =>
      jobs.map((j) => (j.id === job.id ? job : j))
    );
  }

  deleteJob(jobId: number) {
    this.jobsSignal.update((jobs) => jobs.filter((j) => j.id !== jobId));
  }

  updateJobStatus(jobId: number, newStatus: JobStatus) {
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
    const BOM = '\uFEFF'; // Byte Order Mark for UTF-8
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

    const BOM = '\uFEFF'; // Byte Order Mark for UTF-8
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'job-tracker-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  importJobs(file: File): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const rows = content.split(/\r?\n/).filter((line) => line.trim());

          if (rows.length <= 1) {
            resolve({ success: false, message: 'Import file is empty or not in the expected template format.' });
            return;
          }

          const [headerRow, ...dataRows] = rows;
          const headers = headerRow.split(',').map((col) => col.trim().toLowerCase());
          const expected = ['jobtitle', 'companyname', 'joburl', 'salary', 'location', 'description', 'status'];

          if (!expected.every((value) => headers.includes(value))) {
            resolve({ success: false, message: 'The selected file must match the template columns exactly.' });
            return;
          }

          const newItems: Job[] = dataRows
            .map((row, index) => {
              const values = row.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
              return {
                id: Date.now() + index,
                title: values[headers.indexOf('jobtitle')] || '',
                company: values[headers.indexOf('companyname')] || '',
                url: values[headers.indexOf('joburl')] || '',
                salary: values[headers.indexOf('salary')] || '',
                location: values[headers.indexOf('location')] || '',
                description: values[headers.indexOf('description')] || '',
                status: (values[headers.indexOf('status')] as JobStatus) || 'Saved/New',
                appliedAt: new Date().toLocaleString(),
                logo: '/assets/logo.svg',
                timeline: [{ id: 1, message: 'Imported from template', date: new Date().toLocaleString() }],
              };
            })
            .filter((job) => job.title && job.company);

          if (!newItems.length) {
            resolve({ success: false, message: 'No valid rows were found in the import file.' });
            return;
          }

          this.jobsSignal.update((jobs) => [...newItems, ...jobs]);
          resolve({ success: true, message: `Successfully imported ${newItems.length} jobs.` });
        } catch (error) {
          resolve({ success: false, message: 'Error parsing the file. Please check the format.' });
        }
      };
      reader.readAsText(file);
    });
  }
}
