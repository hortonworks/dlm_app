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
