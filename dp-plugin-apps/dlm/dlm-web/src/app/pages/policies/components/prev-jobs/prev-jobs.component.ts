/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input } from '@angular/core';
import { Policy } from 'models/policy.model';
import { JOB_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-prev-jobs',
  templateUrl: './prev-jobs.component.html'
})
export class PrevJobsComponent {
  @Input() policy: Policy;
  get jobs() {
    return this.policy.jobs.filter(job => job.status !== JOB_STATUS.IGNORED).slice(0, 3);
  }
}
