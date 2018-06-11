/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
