import { Component, Input, OnInit } from '@angular/core';
import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { PolicyContent } from './policy-content.type';

@Component({
  selector: 'dlm-policy-details',
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.scss']
})
export class PolicyDetailsComponent implements OnInit {

  policyContent = PolicyContent;

  @Input()
  policy: Policy;

  @Input()
  jobs: Job[];

  @Input()
  contentType = PolicyContent.Jobs;

  ngOnInit() {

  }

}
