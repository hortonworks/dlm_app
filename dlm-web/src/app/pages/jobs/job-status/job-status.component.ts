import {Component, OnInit, Input} from '@angular/core';
import {Job} from '../../../models/job.model';

@Component({
  selector: 'dlm-job-status',
  templateUrl: './job-status.component.html'
})
export class JobStatusComponent implements OnInit {

  @Input() job: Job;

  constructor() {
  }

  ngOnInit() {
  }

}
