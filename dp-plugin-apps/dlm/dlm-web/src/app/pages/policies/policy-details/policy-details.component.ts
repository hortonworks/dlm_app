/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { PolicyContent } from './policy-content.type';
import { POLICY_TYPES, POLICY_EXECUTION_TYPES } from 'constants/policy.constant';
import { HiveDatabase } from 'models/hive-database.model';
import { JOB_STATUS } from 'constants/status.constant';
import { ProgressState } from 'models/progress-state.model';
import { TranslateService } from '@ngx-translate/core';
import { TableFooterOptions } from 'common/table/table-footer/table-footer.type';
import { HiveBrowserTablesLoadingMap } from 'components/hive-browser';


@Component({
  selector: 'dlm-policy-details',
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.scss']
})
export class PolicyDetailsComponent {

  policyContent = PolicyContent;
  jobsTableFooterOptions = {
    showPageSizeMenu: false
  } as TableFooterOptions;

  @Output() onSortJobs = new EventEmitter<any>();
  @Output() onPageChangeJobs = new EventEmitter<any>();
  @Output() onSelectActionJobs = new EventEmitter<any>();
  @Output() abortJobAction = new EventEmitter<any>();
  @Output() rerunJobAction = new EventEmitter<any>();
  @Output() onOpenDirectory = new EventEmitter<any>();
  @Output() onPageChangeFiles = new EventEmitter<any>();
  @Output() onTablesFilter = new EventEmitter<any>();

  @Input()
  policy: Policy;

  @Input()
  jobs: Job[];

  @Input()
  jobsOverallCount: number;

  @Input()
  jobsOffset: number;

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

  @Input() fileBrowserPage = 0;

  @Input() loadingJobs: boolean;

  @Input() loadingDatabases: ProgressState;

  @Input() loadingTables: HiveBrowserTablesLoadingMap;

  @Input() tablesSearchPattern = '';

  constructor(
    private t: TranslateService
  ) {

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

  handleOpenDirectory(event) {
    this.onOpenDirectory.emit(event);
  }

  handleOnFilePageChange(event) {
    this.onPageChangeFiles.emit(event);
  }

  handleFilterApplied(event) {
    this.onTablesFilter.emit(event);
  }

  get filteredJobs() {
    return this.jobs ? this.jobs.filter(job => job.status !== JOB_STATUS.IGNORED) : [];
  }

  /**
   * Returns a string 'Disabled' or 'Enabled' for HDFS policy
   * based on whether snapshot is enabled on the policy
   * Returns empty string for HIVE policy
   */
  get snapshotEnabledStatus() {
    if (!this.policy || this.policy.type === POLICY_TYPES.HIVE) {
      return '';
    }
    return (this.policy.executionType && this.policy.executionType === POLICY_EXECUTION_TYPES.HDFS_SNAPSHOT) ?
      this.t.instant('common.enabled') : this.t.instant('common.disabled');
  }
}
