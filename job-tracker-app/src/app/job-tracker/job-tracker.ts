import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../shared/nav-bar/nav-bar';
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
export class JobTrackerPage {
  private readonly service = inject(JobTrackerService);

  // UI State
  showAddModal = signal(false);
  showImportDialog = signal(false);
  showDetailModal = signal(false);
  selectedJob = signal<Job | null>(null);
  jobToEdit = signal<Job | null>(null);
  draggedJobId = signal<number>(0);
  isMobile = computed(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  // Delegate service signals
  jobs = this.service.jobs;
  searchTerm = this.service.searchTerm;
  filteredJobs = this.service.filteredJobs;

  // Search input change handler
  onSearchChange(term: string) {
    this.service.setSearchTerm(term);
  }

  // Add job modal handlers
  openAddModal() {
    this.showAddModal.set(true);
  }

  onAddJobSave(job: Job) {
    if (this.jobToEdit()) {
      this.service.updateJob(job);
    } else {
      this.service.addJob(job);
    }
    this.showAddModal.set(false);
    this.jobToEdit.set(null);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.jobToEdit.set(null);
  }

  // Action menu handlers
  onDownloadExcel() {
    this.service.downloadExcel();
  }

  onOpenBulkImport() {
    this.showImportDialog.set(true);
  }

  // Import dialog handlers
  onImport(jobs: Job[]) {
    jobs.forEach((job) => this.service.addJob(job));
    this.showImportDialog.set(false);
  }

  closeImportDialog() {
    this.showImportDialog.set(false);
  }

  onDownloadTemplate() {
    this.service.downloadTemplate();
  }

  // Job list handlers
  onSelectJob(jobId: number) {
    const job = this.jobs().find((j) => j.id === jobId);
    if (job) {
      this.selectedJob.set(job);
      this.showDetailModal.set(true);
    }
  }

  onStatusChange(data: { jobId: number; newStatus: JobStatus }) {
    this.service.updateJobStatus(data.jobId, data.newStatus);
  }

  onDragStart(jobId: number) {
    this.draggedJobId.set(jobId);
  }

  // Detail modal handlers
  onUpdateJob(job: Job) {
    this.service.updateJob(job);
    this.selectedJob.set(job);
  }

  onEditJob() {
    const job = this.selectedJob();
    if (job) {
      this.jobToEdit.set(job);
      this.showDetailModal.set(false);
      this.showAddModal.set(true);
    }
  }

  onDeleteJob(jobId: number) {
    this.service.deleteJob(jobId);
    this.showDetailModal.set(false);
    this.selectedJob.set(null);
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
