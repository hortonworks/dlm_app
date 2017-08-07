/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
