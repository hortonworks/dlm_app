import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'jobs-status-filter',
  templateUrl: './jobs-status-filter.component.html',
  styleUrls: ['./jobs-status-filter.component.scss']
})
export class JobsStatusFilterComponent implements OnInit, OnChanges {

  private failedJobMock = {status: 'FAILED'};
  private inProgressJobMock = {status: 'IN_PROGRESS'};
  private warningsJobMock = {status: 'WARNINGS'};
  private groupedByStatusJobs = {};

  @Input() jobs: Job[] = [];
  @Output() onFilter: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.groupByStatus();
  }

  ngOnChanges() {
    this.groupByStatus();
  }

  groupByStatus() {
    this.groupedByStatusJobs = {
      SUCCESS: [],
      FAILED: [],
      IN_PROGRESS: [],
      WARNINGS: []
    };
    this.jobs.forEach(job => {
      if (this.groupedByStatusJobs[job.status]) {
        this.groupedByStatusJobs[job.status].push(job);
      }
    });
  }

  filterJobsByStatus(status) {
    this.onFilter.emit(status);
  }

}
