/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {Component, Input, Output, EventEmitter, HostBinding, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import { Policy, SummaryTreeItem } from 'models/policy.model';
import { Job } from 'models/job.model';
import { PolicyContent } from './policy-content.type';
import { POLICY_TYPES, POLICY_EXECUTION_TYPES, SOURCE_TYPES, POLICY_MODES } from 'constants/policy.constant';
import { HiveDatabase } from 'models/hive-database.model';
import { JOB_STATUS } from 'constants/status.constant';
import { ProgressState } from 'models/progress-state.model';
import { TranslateService } from '@ngx-translate/core';
import { TableFooterOptions } from 'common/table/table-footer/table-footer.type';
import { HiveBrowserTablesLoadingMap } from 'components/hive-browser';
import { FrequencyPipe } from 'pipes/frequency.pipe';
import { FmtTzPipe } from 'pipes/fmt-tz.pipe';
import { TimeZoneService } from 'services/time-zone.service';

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
  @Output() onFilterJobs = new EventEmitter<any>();
  @Output() onInput = new EventEmitter<any>();
  @Output() onPageChangeJobs = new EventEmitter<any>();
  @Output() onSelectActionJobs = new EventEmitter<any>();
  @Output() abortJobAction = new EventEmitter<any>();
  @Output() rerunJobAction = new EventEmitter<any>();
  @Output() onOpenDirectory = new EventEmitter<any>();
  @Output() onPageChangeFiles = new EventEmitter<any>();
  @Output() onTablesFilter = new EventEmitter<any>();
  @HostBinding('class') className = 'dlm-policy-details';

  private translateNS = 'page.policies.flow_status';
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

  @Input() jobsFilters = [];

  @Input() jobsPage = 0;

  @Input() jobsInput = '';

  @Input() fileBrowserPage = 0;

  @Input() loadingJobs: boolean;

  @Input() loadingDatabases: ProgressState;

  @Input() loadingTables: HiveBrowserTablesLoadingMap;

  @Input() tablesSearchPattern = '';

  summaryHeader = this.t.instant('page.policies.settings');
  fmtTzPipe = new FmtTzPipe(this.cdRef, this.timezoneService);

  constructor(
    private t: TranslateService,
    private frequencyPipe: FrequencyPipe,
    private cdRef: ChangeDetectorRef,
    private timezoneService: TimeZoneService
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

  handleOnFilter(filters) {
    this.onFilterJobs.emit(filters);
  }

  handleOnInput(input) {
    this.onInput.emit(input);
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

  get isSourceCluster() {
    return this.sourceCluster && Number(this.sourceCluster) > 0;
  }

  get filteredJobs() {
    return this.jobs ? this.jobs.filter(job => job.status !== JOB_STATUS.IGNORED) : [];
  }

  getAccessValue(mode): string {
    return this.t.instant({
      [POLICY_MODES.READ_ONLY]: `${this.translateNS}.read_only`,
      [POLICY_MODES.READ_WRITE]: `${this.translateNS}.read_write`,
    }[mode] || ' ');
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

  /**
   * Returns an array of summary items to display policy settings
   * in the left pane
   */
  get summaryItems(): SummaryTreeItem[]  {
    const summaryItems = [];
    if (this.policy) {
      if (this.policy.description) {
        summaryItems.push({
          label: this.t.instant('common.description'),
          value: this.policy.description,
          iconClass: 'fa-file-text'
        });
      }

      const sourceName = this.policy.sourceType === SOURCE_TYPES.CLUSTER ?
        this.policy.sourceClusterResource.name : this.policy.cloudCredentialResource.name;
      const destinationName = this.policy.targetType === SOURCE_TYPES.CLUSTER ?
        this.policy.targetClusterResource.name : this.policy.cloudCredentialResource.name;

      const sourceIcon = this.policy.sourceType === SOURCE_TYPES.CLUSTER ? 'fa-cube' : 'fa-cloud';
      const destinationIcon = this.policy.targetType === SOURCE_TYPES.CLUSTER ? 'fa-cube' : 'fa-cloud';

      const frequency = this.frequencyPipe.transform(this.policy.frequency);
      const startTime = 'startTime' in this.policy && this.policy['startTime'] ?
        this.fmtTzPipe.transform(+new Date(this.policy['startTime']), 'MMM DD, Y HH:mm') : '';
      const endTime = this.policy.endTime ? this.fmtTzPipe.transform(+new Date(this.policy.endTime), 'MMM DD, Y HH:mm') : '';
      let frequencyText = `${frequency}`;
      if (startTime) {
        frequencyText += ` from ${startTime}`;
      }
      if (endTime) {
        frequencyText += ` until ${endTime}`;
      }

      summaryItems.push({
        label: this.t.instant('common.source'),
        value: `${sourceName} ${this.policy.sourceDataset}`,
        iconClass: sourceIcon
      });

      summaryItems.push({
        label: this.t.instant('common.destination'),
        value: `${destinationName} ${this.policy.targetDataset}`,
        iconClass: destinationIcon
      });

      summaryItems.push({
        label: this.t.instant('common.frequency.self'),
        value: frequencyText,
        iconClass: 'fa-clock-o'
      });

      if (this.policy.executionType && !this.databaseBasedPolicy() && this.policy.sourceType === SOURCE_TYPES.CLUSTER
      && this.policy.targetType === SOURCE_TYPES.CLUSTER) {
        summaryItems.push({
          label: this.t.instant('common.snapshot'),
          value: this.snapshotEnabledStatus,
          iconClass: 'fa-clone'
        });
      }

      summaryItems.push({
        label: this.t.instant('common.permissions'),
        value: this.getAccessValue(this.policy.accessMode),
        iconClass: 'fa-pencil-square-o'
      });

      if (this.policy.customProperties.queueName) {
        summaryItems.push({
          label: this.t.instant('common.queue_name'),
          value: this.policy.customProperties.queueName,
          iconClass: 'fa-list'
        });
      }

      if (this.policy.customProperties.distcpMapBandwidth) {
        summaryItems.push({
          label: this.t.instant('common.max_bandwidth'),
          value: `${this.policy.customProperties.distcpMapBandwidth} MBps`,
          iconClass: 'fa-signal'
        });
      }
    }
    return summaryItems;
  }
}
