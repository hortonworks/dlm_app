/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';
import { isEmpty } from 'utils/object-utils';
import { JobTrackingInfo } from 'models/job-tracking-info.model';

@Component({
  selector: 'dlm-transferred-column',
  templateUrl: './transferred-column.component.html',
  styleUrls: ['./transferred-column.component.scss']
})
export class TransferredColumnComponent implements OnInit {

  @Input() trackingInfo: JobTrackingInfo = <JobTrackingInfo>{};

  get progress() {
    return Math.round((this.trackingInfo.completedMapTasks || 0) / (this.trackingInfo.totalMapTasks || 1) * 100);
  }

  constructor() { }

  ngOnInit() {

  }

  isFailed() {
    return isEmpty(this.trackingInfo);
  }

  isInProgress() {
    const { completedMapTasks, totalMapTasks } = this.trackingInfo;
    return !this.isFailed() && completedMapTasks < totalMapTasks;
  }
}
