import { Component, OnInit, Input } from '@angular/core';
import { Job } from '../../../models/job.model';
import { JOB_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-job-status',
  templateUrl: './job-status.component.html'
})
export class JobStatusComponent implements OnInit {
  JOB_STATUS = JOB_STATUS;
  @Input() job: Job;

  get showStatusIndicator() {
    const { FAILED, WARNINGS, IN_PROGRESS } = JOB_STATUS;
    return [FAILED, WARNINGS, IN_PROGRESS].indexOf(this.job.status) !== -1;
  }

  constructor() {
  }

  ngOnInit() {
  }

}
