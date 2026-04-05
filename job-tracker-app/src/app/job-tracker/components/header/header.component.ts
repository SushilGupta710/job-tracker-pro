import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-tracker-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative flex-1">
      <input
        type="search"
        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        placeholder="Search jobs, company..."
        [ngModel]="searchTerm()"
        (ngModelChange)="searchTermChange.emit($event)"
      />
    </div>
  `,
})
export class JobTrackerHeaderComponent {
  searchTerm = input('');
  searchTermChange = output<string>();
}
