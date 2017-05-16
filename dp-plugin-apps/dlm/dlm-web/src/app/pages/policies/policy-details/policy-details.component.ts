import { Component, Input, OnInit } from '@angular/core';
import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';

@Component({
  selector: 'dlm-policy-details',
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.scss']
})
export class PolicyDetailsComponent implements OnInit {

  @Input()
  policy: Policy;

  @Input()
  jobs: Job[];

  ngOnInit() {

  }

}
