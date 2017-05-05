import { Component, OnInit, Input } from '@angular/core';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'dlm-job-status',
  templateUrl: './job-status.component.html'
})
export class JobStatusComponent implements OnInit {

  @Input() job: Job;

  get showStatusIndicator() {
    return ['FAILED', 'WARNINGS', 'IN_PROGRESS'].indexOf(this.job.status) !== -1;
  }

  constructor() {
  }

  ngOnInit() {
  }

}
