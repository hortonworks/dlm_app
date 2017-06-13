import { Component, Input, OnInit } from '@angular/core';
import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { PolicyContent } from './policy-content.type';
import { POLICY_TYPES } from 'constants/policy.constant';
import { HiveDatabase } from 'models/hive-database.model';

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

  @Input()
  sourceCluster: number;

  @Input()
  hdfsRootPath: string;

  @Input() policyDatabase: HiveDatabase;

  ngOnInit() {

  }

  fileBasedPolicy() {
    return POLICY_TYPES.HDFS === this.policy.type;
  }

  databaseBasedPolicy() {
    return POLICY_TYPES.HIVE === this.policy.type;
  }

}
