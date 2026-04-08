import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavBarComponent } from '../shared/nav-bar/nav-bar';
import { JobTrackerService, JobStatus } from '../job-tracker/services/job-tracker.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NavBarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sankeyChart', { static: false }) sankeyChartRef?: ElementRef<HTMLDivElement>;
  private chart: any = null;
  private readonly router = inject(Router);
  private readonly service = inject(JobTrackerService);

  readonly jobs = this.service.jobs;
  readonly statuses: JobStatus[] = ['Saved/New', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  readonly counts = computed(() => {
    const allJobs = this.jobs();
    return this.statuses.reduce((acc, status) => {
      acc[status] = allJobs.filter((job) => job.status === status).length;
      return acc;
    }, {} as Record<JobStatus, number>);
  });

  readonly totalJobs = computed(() => this.jobs().length);

  readonly description =
    'Your job tracker dashboard gives you a quick snapshot of everything in progress, so you can stay focused on the roles you care about most.';

  ngOnInit() {
    this.service.loadJobs().subscribe();
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnDestroy() {
    this.destroyChart();
    window.removeEventListener('resize', this.resizeHandler);
  }

  navigateToJobTracker() {
    this.router.navigate(['/job-tracker']);
  }

  private readonly resizeHandler = () => {
    this.chart?.resize();
  };

  private async initChart() {
    if (!this.sankeyChartRef?.nativeElement) {
      return;
    }

    // @ts-ignore: runtime import of ECharts package
    const echarts = await import('echarts');
    this.chart = echarts.init(this.sankeyChartRef.nativeElement);
    this.setSankeyOption();
    window.addEventListener('resize', this.resizeHandler);

    effect(() => {
      if (this.chart) {
        this.setSankeyOption();
      }
      this.counts();
    });
  }

  private destroyChart() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }

  private setSankeyOption() {
    if (!this.chart) {
      return;
    }

    const counts = this.counts();

    const option = {
      legend: {
        data: ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'],
        textStyle: {
          color: '#0ea5e9',
        },
        top: '5%',
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: '{b}: {c}',
      },
      series: {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        nodeAlign: 'left',
        data: [
          { name: 'Saved', x: '48%', y: '10%' },
          { name: 'Applied', x: '48%', y: '30%' },
          { name: 'Interviewing', x: '48%', y: '50%' },
          { name: 'Offer', x: '28%', y: '78%' },
          { name: 'Rejected', x: '72%', y: '78%' },
        ],
        links: [
          { source: 'Saved', target: 'Applied', value: counts['Saved/New'] },
          { source: 'Applied', target: 'Interviewing', value: counts.Applied },
          { source: 'Interviewing', target: 'Offer', value: counts.Interviewing },
          { source: 'Interviewing', target: 'Rejected', value: counts.Interviewing ? counts.Rejected : 0 },
        ],
        label: {
          color: '#0ea5e9',
          fontSize: 13,
          position: 'right',
        },
        lineStyle: {
          color: '#0ea5e9',
          curveness: 0.45,
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#cbd5e1',
        },
      },
    };

    this.chart.setOption(option, true);
  }
}
