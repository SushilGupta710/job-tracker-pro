import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../shared/nav-bar/nav-bar';
import { TostNotification } from '../shared/tost-notification/tost-notification';
import { JobTrackerService, Job, JobStatus } from './services/job-tracker.service';
import { JobTrackerHeaderComponent } from './components/header/header.component';
import { JobTrackerActionsMenuComponent } from './components/actions-menu/actions-menu.component';
import { AddJobModalComponent } from './components/add-job-modal/add-job-modal.component';
import { JobDetailModalComponent } from './components/job-detail-modal/job-detail-modal.component';
import { ImportDialogComponent } from './components/import-dialog/import-dialog.component';
import { JobListDesktopComponent } from './components/job-list-desktop/job-list-desktop.component';
import { JobListMobileComponent } from './components/job-list-mobile/job-list-mobile.component';

@Component({
  selector: 'app-job-tracker',
  standalone: true,
  imports: [
    CommonModule,
    NavBarComponent,
    TostNotification,
    JobTrackerHeaderComponent,
    JobTrackerActionsMenuComponent,
    AddJobModalComponent,
    JobDetailModalComponent,
    ImportDialogComponent,
    JobListDesktopComponent,
    JobListMobileComponent,
  ],
  templateUrl: './job-tracker.html',
  styleUrls: ['./job-tracker.css'],
})
export class JobTrackerPage implements OnInit {
  private readonly service = inject(JobTrackerService);

  // UI State
  showAddModal = signal(false);
  showImportDialog = signal(false);
  showDetailModal = signal(false);
  selectedJob = signal<Job | null>(null);
  jobToEdit = signal<Job | null>(null);
  draggedJobId = signal<string>('');
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'warning'>('success');
  isMobile = computed(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  // Delegate service signals
  jobs = this.service.jobs;
  searchTerm = this.service.searchTerm;
  filteredJobs = this.service.filteredJobs;
  hasJobs = computed(() => this.jobs().length > 0);

  // Search input change handler
  ngOnInit() {
    this.service.loadJobs().subscribe();
    this.service.loadStatuses().subscribe();
  }

  onSearchChange(term: string) {
    this.service.setSearchTerm(term);
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }

  // Add job modal handlers
  openAddModal() {
    this.showAddModal.set(true);
  }

  onAddJobSave(job: Job) {
    if (this.jobToEdit()) {
      this.service.updateJob(job).subscribe({
        next: () => {
          this.showToast('Job updated successfully.', 'success');
          this.showAddModal.set(false);
          this.jobToEdit.set(null);
        },
        error: () => this.showToast('Unable to update job. Please try again.', 'error'),
      });
    } else {
      this.service.addJob(job).subscribe({
        next: () => {
          this.showToast('Job added successfully.', 'success');
          this.service.loadJobs().subscribe(); // Reload to ensure visibility
          this.showAddModal.set(false);
          this.jobToEdit.set(null);
        },
        error: () => this.showToast('Unable to add job. Please try again.', 'error'),
      });
    }
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.jobToEdit.set(null);
  }

  // Action menu handlers
  onDownloadExcel() {
    if (this.filteredJobs().length === 0) {
      this.showToast('No jobs available to download.', 'warning');
      return;
    }
    this.service.downloadExcel();
  }

  onOpenBulkImport() {
    this.showImportDialog.set(true);
  }

  // Import dialog handlers
  onImport(jobs: Job[]) {
    this.service.importJobs(jobs).subscribe({
      next: () => {
        this.showToast(`Imported ${jobs.length} jobs successfully.`, 'success');
        this.showImportDialog.set(false);
      },
      error: () => this.showToast('Failed to import jobs. Please try again.', 'error'),
    });
  }

  closeImportDialog() {
    this.showImportDialog.set(false);
  }

  onDownloadTemplate() {
    this.service.downloadTemplate();
  }

  // Job list handlers
  onSelectJob(jobId: string) {
    const job = this.jobs().find((j) => j.id === jobId);
    if (job) {
      this.selectedJob.set(job);
      this.showDetailModal.set(true);
    }
  }

  onStatusChange(data: { jobId: string; newStatus: JobStatus }) {
    this.service.updateJobStatus(data.jobId, data.newStatus).subscribe({
      next: () => this.showToast('Status updated successfully.', 'success'),
      error: () => this.showToast('Unable to update status. Please try again.', 'error'),
    });
  }

  onDragStart(jobId: string) {
    this.draggedJobId.set(jobId);
  }

  // Detail modal handlers
  onUpdateJob(job: Job) {
    this.service.updateJob(job).subscribe({
      next: () => {
        this.showToast('Job details saved.', 'success');
        this.selectedJob.set(job);
      },
      error: () => this.showToast('Unable to save changes. Please try again.', 'error'),
    });
  }

  onUpdateJobStatus(data: {jobId: string, newStatus: JobStatus}) {
    this.service.updateJobStatus(data.jobId, data.newStatus).subscribe({
      next: () => this.showToast('Status updated successfully.', 'success'),
      error: () => this.showToast('Unable to update status. Please try again.', 'error'),
    });
  }

  onEditJob() {
    const job = this.selectedJob();
    if (job) {
      this.jobToEdit.set(job);
      this.showDetailModal.set(false);
      this.showAddModal.set(true);
    }
  }

  onDeleteJob(jobId: string) {
    this.service.deleteJob(jobId).subscribe({
      next: () => {
        this.showToast('Job deleted successfully.', 'success');
        this.showDetailModal.set(false);
        this.selectedJob.set(null);
      },
      error: () => this.showToast('Unable to delete job. Please try again.', 'error'),
    });
  }

  setJobToEdit(job: Job) {
    // This can be extended to support edit mode in the add modal if needed
    this.selectedJob.set(null);
  }

  onViewJobLink(url: string) {
    window.open(url, '_blank');
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedJob.set(null);
  }
}
