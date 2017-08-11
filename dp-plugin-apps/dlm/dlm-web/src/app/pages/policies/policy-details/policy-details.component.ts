/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
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

  @Output() onSortJobs = new EventEmitter<any>();
  @Output() onPageChangeJobs = new EventEmitter<any>();
  @Output() onSelectActionJobs = new EventEmitter<any>();
  @Output() abortJobAction = new EventEmitter<any>();
  @Output() rerunJobAction = new EventEmitter<any>();
  @Output() onSelectFile = new EventEmitter<any>();

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

  @Input() jobsSort = [];

  @Input() jobsPage = 0;

  @Input() jobsActiveActions = {};

  ngOnInit() {

  }

  fileBasedPolicy() {
    return POLICY_TYPES.HDFS === this.policy.type;
  }

  databaseBasedPolicy() {
    return POLICY_TYPES.HIVE === this.policy.type;
  }

  handleOnSort(sorts) {
    this.onSortJobs.emit(sorts);
  }

  handleOnPageChange(page) {
    this.onPageChangeJobs.emit(page);
  }

  handleOnSelectAction(event) {
    this.onSelectActionJobs.emit(event);
  }

  handleAbortJobAction(event) {
    this.abortJobAction.emit(event);
  }

  handleRerunJobAction(event) {
    this.rerunJobAction.emit(event);
  }

  handleSelectFile(event) {
    this.onSelectFile.emit(event);
  }
}
