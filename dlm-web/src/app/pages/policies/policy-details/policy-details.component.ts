/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import {
  Component, Input, Output, EventEmitter, HostBinding, HostListener, ChangeDetectorRef, TemplateRef, ViewChild, AfterViewInit, OnChanges,
  SimpleChange
} from '@angular/core';
import { Policy, SummaryTreeItem } from 'models/policy.model';
import { Job } from 'models/job.model';
import { PolicyContent, PolicyDetailsEditEvent } from './policy-content.type';
import { POLICY_TYPES, SOURCE_TYPES } from 'constants/policy.constant';
import { HiveDatabase } from 'models/hive-database.model';
import { ProgressState } from 'models/progress-state.model';
import { TranslateService } from '@ngx-translate/core';
import { TableFooterOptions } from 'common/table/table-footer/table-footer.type';
import { HiveBrowserTablesLoadingMap } from 'components/hive-browser';
import { FrequencyPipe } from 'pipes/frequency.pipe';
import { Cluster } from 'models/cluster.model';
import { FmtTzPipe } from 'pipes/fmt-tz.pipe';
import { TimeZoneService } from 'services/time-zone.service';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { contains } from 'utils/array-util';
import { FeatureService } from 'services/feature.service';
import { SummaryField } from 'pages/policies/policy-table/policy-table.type';
import { InlineEditWidgetType, InlineEditRadioOptions } from 'components/inline-edit/inline-edit.type';
import { FEATURES, POLICY_SNAPSHOTABLE_EDIT } from 'models/features.model';
import { canEdit } from 'utils/policy-util';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'dlm-policy-details',
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.scss']
})
export class PolicyDetailsComponent implements AfterViewInit, OnChanges {

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
  @Output() editField = new EventEmitter<PolicyDetailsEditEvent>();
  @Output() editInlineField = new EventEmitter<PolicyDetailsEditEvent>();

  @HostBinding('class') className = 'dlm-policy-details';

  @Input()
  policy: Policy;

  @Input()
  beaconStatuses: BeaconAdminStatus[] = [];

  @Input()
  jobs: Job[] = [];

  @Input()
  jobsOverallCount: number;

  @Input()
  jobsOffset: number;

  @Input()
  contentType = PolicyContent.Jobs;

  @Input()
  sourceCluster: Cluster;

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

  @ViewChild('editableHeaderTemplate') editableHeaderTemplate: TemplateRef<any>;
  @ViewChild('editableDetailsTemplate') editableDetailsTemplate: TemplateRef<any>;

  summaryHeader = this.t.instant('page.policies.settings');
  fmtTzPipe = new FmtTzPipe(this.cdRef, this.timezoneService);
  activeInlineEdits = {};
  features = FEATURES;

  @HostListener('window:resize') onWindowResize() {
    this.calculatePopupArrowPosition();
  }

  constructor(
    private t: TranslateService,
    private frequencyPipe: FrequencyPipe,
    private cdRef: ChangeDetectorRef,
    private timezoneService: TimeZoneService,
    private featureService: FeatureService,
    private userService: UserService
  ) {

  }

  ngAfterViewInit () {
    this.calculatePopupArrowPosition();
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['contentType']) {
      this.calculatePopupArrowPosition();
    }
  }

  calculatePopupArrowPosition() {
    let leftOffset = 0;
    const rowOffset = $($('div.datatable-row-center')[0]).offset();
    if (this.contentType === this.policyContent.Files) {
      leftOffset = Math.round($('p[qe-attr=policy-info-0]').offset().left - rowOffset.left + 5);
    } else {
      const jobsOffset = $('span[qe-attr=policy-jobs-0]').offset();
      if (jobsOffset && rowOffset) {
        leftOffset = Math.round(jobsOffset.left - rowOffset.left + 5);
      }
    }
    $('.datatable-row-detail .popup-arrow').css({'left': leftOffset});
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

  canEdit(summaryItem: SummaryTreeItem): boolean {
    const canEditPolicy = canEdit(this.policy);
    let customEdit = true;
    switch (summaryItem.id) {
      case SummaryField.snapshot:
        customEdit = this.userService.isUserInfraAdmin;
        break;
      default:
        customEdit = !this.userService.isUserReadOnly;
    }
    return canEditPolicy && customEdit;
  }

  get isSourceCluster() {
    return this.sourceCluster && this.sourceCluster.id;
  }

  get snapshotEnabled() {
    return this.policy.customProperties && this.policy.customProperties.enableSnapshotBasedReplication &&
      this.policy.customProperties.enableSnapshotBasedReplication === 'true';
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
    return this.snapshotEnabled ?
      this.t.instant('common.enabled') : this.t.instant('common.disabled');
  }

  /**
   * Returns an array of summary items to display policy settings
   * in the left pane
   */
  get summaryItems(): SummaryTreeItem[]  {
    const summaryItems: SummaryTreeItem[] = [];
    if (this.policy) {
      if (this.featureService.isEnabled('policy_edit') || this.policy.description) {
        summaryItems.push({
          id: SummaryField.description,
          label: this.t.instant('common.description'),
          value: this.policy.description,
          iconClass: 'fa-file-text',
          headerTemplate: this.editableHeaderTemplate,
          detailsTemplate: this.editableDetailsTemplate,
          detailsTemplateContext: {
            type: InlineEditWidgetType.Textarea,
            value: this.policy.description,
            qeAttr: 'policy-description'
          }
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
        this.fmtTzPipe.transform(this.policy.startTime, 'MMM DD, Y HH:mm') : '';
      const endTime = this.policy.endTime ? this.fmtTzPipe.transform(this.policy.endTime, 'MMM DD, Y HH:mm') : '';
      let frequencyText = `${frequency}`;
      if (startTime) {
        frequencyText += ` from ${startTime}`;
      }
      if (endTime) {
        frequencyText += ` until ${endTime}`;
      }

      summaryItems.push({
        id: SummaryField.source,
        label: this.t.instant('common.source'),
        value: `${sourceName} ${this.policy.sourceDataset}`,
        iconClass: sourceIcon
      });

      summaryItems.push({
        id: SummaryField.destination,
        label: this.t.instant('common.destination'),
        value: `${destinationName} ${this.policy.targetDataset}`,
        iconClass: destinationIcon
      });

      summaryItems.push({
        id: SummaryField.frequency,
        label: this.t.instant('common.frequency.self'),
        value: frequencyText,
        iconClass: 'fa-clock-o'
      });

      if (this.policy.executionType && !this.databaseBasedPolicy() && this.policy.sourceType === SOURCE_TYPES.CLUSTER) {
        summaryItems.push({
          id: SummaryField.snapshot,
          label: this.t.instant('common.snapshot'),
          value: this.snapshotEnabledStatus,
          iconClass: 'fa-clone',
          headerTemplate: this.featureService.isEnabled(POLICY_SNAPSHOTABLE_EDIT) ? this.editableHeaderTemplate : null,
          detailsTemplate: this.editableDetailsTemplate,
          detailsTemplateContext: {
            type: InlineEditWidgetType.Checkbox,
            value: this.snapshotEnabled,
            qeAttr: 'policy-snapshot-enabled',
            options: {
              label: this.t.instant('page.policies.form.help.toggle_snapshot_text'),
            }
          }
        });
      }

      if ('customProperties' in this.policy && this.policy.customProperties.queueName) {
        summaryItems.push({
          id: SummaryField.queueName,
          label: this.t.instant('common.queue_name'),
          value: this.policy.customProperties.queueName,
          iconClass: 'fa-list',
          headerTemplate: this.editableHeaderTemplate
        });
      }

      if ('customProperties' in this.policy && 'distcpMapBandwidth' in this.policy.customProperties) {
        summaryItems.push({
          id: SummaryField.maxBandwidth,
          label: this.t.instant('common.max_bandwidth'),
          value: `${this.policy.customProperties.distcpMapBandwidth} MBps`,
          iconClass: 'fa-signal',
          headerTemplate: this.editableHeaderTemplate
        });
      }
      if ('customProperties' in this.policy && 'distcpMaxMaps' in this.policy.customProperties) {
        summaryItems.push({
          id: SummaryField.maxMaps,
          label: this.t.instant('common.max_maps'),
          value: this.policy.customProperties.distcpMaxMaps,
          iconClass: 'fa-tasks',
          headerTemplate: this.editableHeaderTemplate
        });
      }
      if ('customProperties' in this.policy && this.policy.customProperties['tde.enabled'] === 'true') {
        const tdeLabels = {
          sameKey: this.t.instant('common.tde.options.same'),
          differentKey: this.t.instant('common.tde.options.different')
        };
        const tdeValue = this.policy.customProperties['tde.sameKey'] === 'true';
        summaryItems.push({
          id: SummaryField.tdeKey,
          label: this.t.instant('page.policies.form.fields.destinationCluster.tdeKey'),
          value: tdeValue ? tdeLabels.sameKey : tdeLabels.differentKey,
          iconClass: 'fa-lock',
          headerTemplate: this.editableHeaderTemplate,
          detailsTemplate: this.editableDetailsTemplate,
          detailsTemplateContext: {
            type: InlineEditWidgetType.Radio,
            value: tdeValue,
            qeAttr: 'tde-encryption-types',
            options: {
              items: [
                { value: true, label: tdeLabels.sameKey },
                { value: false, label: tdeLabels.differentKey }
              ]
            } as InlineEditRadioOptions
          }
        });
      }
    }
    return summaryItems;
  }

  handleEdit(item: SummaryTreeItem): void {
    const inlineEditable = [SummaryField.description, SummaryField.tdeKey, SummaryField.snapshot];
    if (contains(inlineEditable, item.id)) {
      this.toggleInlineEdit(item);
    } else {
      this.editField.emit({item});
    }
  }

  toggleInlineEdit(item: SummaryTreeItem): void {
    this.activeInlineEdits[item.id] = !this.activeInlineEdits[item.id];
  }

  showEditWidget(itemId: string): boolean {
    return itemId in this.activeInlineEdits && this.activeInlineEdits[itemId];
  }

  handleConfirmValue(item: SummaryTreeItem, value): void {
    this.toggleInlineEdit(item);
    this.editInlineField.emit({item, value});
  }

  handleCancel(item, value): void {
    this.toggleInlineEdit(item);
  }

  placeholder(item: SummaryTreeItem): string {
    if (item.id === SummaryField.description) {
      return this.t.instant('page.policies.no_description');
    }
    return item.value;
  }

}
