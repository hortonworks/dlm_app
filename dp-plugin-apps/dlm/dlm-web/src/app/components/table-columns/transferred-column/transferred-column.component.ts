/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { JobTrackingInfo, JobTrackinfoProgress } from 'models/job-tracking-info.model';
import { JOB_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-transferred-column',
  templateUrl: './transferred-column.component.html',
  styleUrls: ['./transferred-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferredColumnComponent {

  @Input() jobStatus: string;
  @Input() trackingInfo: JobTrackingInfo = <JobTrackingInfo>{};

  get trackingProgress(): JobTrackinfoProgress {
    return this.trackingInfo && this.trackingInfo.progress || <JobTrackinfoProgress>{};
  }

  get completedCount(): number {
    const { completed, killed, failed } = this.trackingProgress;
    const sum = (a, b) => a + (b || 0);
    return [completed, killed, failed].reduce(sum, 0);
  }

  get progress(): number {
    return Math.round((this.completedCount / (this.trackingProgress.total || 1)) * 100);
  }

  isInProgress(): boolean {
    return this.jobStatus === JOB_STATUS.RUNNING;
  }
}
