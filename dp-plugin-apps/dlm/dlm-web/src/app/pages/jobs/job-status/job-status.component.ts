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

  constructor() {
  }

  ngOnInit() {
  }

}
