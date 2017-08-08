/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';
import { Job } from 'models/job.model';
import { JOB_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-last-ten-jobs-column',
  template: `
    <div class="last-ten-jobs-list">
      <dlm-job-status *ngFor="let job of jobs; index as i" [job]="job" [style.align-self]="getCircleAlignment(job, i)"></dlm-job-status>
    </div>
  `,
  styleUrls: ['./last-ten-jobs-column.component.scss']
})
export class LastTenJobsColumnComponent implements OnInit {
  @Input() jobs: Job[] = [];

  constructor() { }

  ngOnInit() {
  }

  getCircleAlignment(job: Job, index) {
    if (job.status === JOB_STATUS.IGNORED || job.status === JOB_STATUS.FAILED) {
      return 'flex-end';
    }
    if (index === 0 && job.status === JOB_STATUS.RUNNING) {
      const nextJob = this.jobs[1];
      if (nextJob && nextJob.status === JOB_STATUS.FAILED) {
        return 'flex-end';
      }
    }
    return 'baseline';
  }

}
