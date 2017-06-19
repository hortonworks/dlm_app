import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Job } from 'models/job.model';
import { JOB_STATUS } from 'constants/status.constant';

@Component({
  selector: 'jobs-status-filter',
  templateUrl: './jobs-status-filter.component.html',
  styleUrls: ['./jobs-status-filter.component.scss']
})
export class JobsStatusFilterComponent implements OnInit, OnChanges {
  JOB_STATUS = JOB_STATUS;
  failedJobMock = {status: JOB_STATUS.FAILED};
  inProgressJobMock = {status: JOB_STATUS.RUNNING};
  warningsJobMock = {status: JOB_STATUS.WARNINGS};
  groupedByStatusJobs: { [id: string]: Job[] } = {};

  @Input() jobs: Job[] = [];
  @Output() onFilter: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.groupByStatus();
  }

  ngOnChanges() {
    this.groupByStatus();
  }

  groupByStatus() {
    const { SUCCESS, FAILED, RUNNING, WARNINGS } = JOB_STATUS;
    this.groupedByStatusJobs = {
      [SUCCESS]: [],
      [FAILED]: [],
      [RUNNING]: [],
      [WARNINGS]: []
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
