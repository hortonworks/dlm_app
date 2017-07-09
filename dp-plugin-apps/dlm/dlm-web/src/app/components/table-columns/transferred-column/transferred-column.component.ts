import { Component, OnInit, Input } from '@angular/core';
import { isEmpty } from 'utils/object-utils';
import { JobTrackingInfo } from 'models/job-tracking-info.model';

@Component({
  selector: 'dlm-transferred-column',
  templateUrl: './transferred-column.component.html',
  styleUrls: ['./transferred-column.component.scss']
})
export class TransferredColumnComponent implements OnInit {

  @Input() trackingInfo = {};

  constructor() { }

  ngOnInit() {

  }

  isFailed() {
    return isEmpty(this.trackingInfo);
  }

  isInProgress() {
    const { completedMapTasks, totalMapTasks } = <JobTrackingInfo>this.trackingInfo;
    return !this.isFailed() && completedMapTasks < totalMapTasks;
  }
}
