/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, OnInit, Output, ViewChild, TemplateRef, ViewEncapsulation, EventEmitter, HostBinding, Input
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import * as fromRoot from 'reducers/';
import { ActionItemType } from 'components';
import { JobsTableComponent } from 'pages/jobs/jobs-table/jobs-table.component';
import { TableComponent } from 'common/table/table.component';
import { deletePolicy, resumePolicy, suspendPolicy } from 'actions/policy.action';
import { abortJob, rerunJob } from 'actions/job.action';
import { Policy } from 'models/policy.model';
import { LogService } from 'services/log.service';
import { JOB_STATUS } from 'constants/status.constant';
import { PolicyService } from 'services/policy.service';
import { confirmNextAction } from 'actions/confirmation.action';
import { NOTIFICATION_TYPES, NOTIFICATION_CONTENT_TYPE } from 'constants/notification.constant';
import { JobTrackinfoProgress } from 'models/job-tracking-info.model';
import { UNIT_LABELS } from 'constants/job.constant';
import { activateDisabled, suspendDisabled } from 'utils/policy-util';
import { confirmationOptionsDefaults, ConfirmationOptions } from 'components/confirmation-modal';

@Component({
  selector: 'dlm-jobs-overview-table',
  templateUrl: './jobs-overview-table.component.html',
  styleUrls: ['./jobs-overview-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JobsOverviewTableComponent extends JobsTableComponent implements OnInit {
  private selectedAction: ActionItemType;
  private selectedForActionRow: Policy;
  JOB_STATUS = JOB_STATUS;

  @Input() jobsCount = 0;

  @ViewChild('clusterNameCellRef') clusterNameCellRef: TemplateRef<any>;
  @ViewChild('destinationIconCell') destinationIconCellRef: TemplateRef<any>;
  @ViewChild('verbStatusCellTemplate') verbStatusCellTemplate: TemplateRef<any>;
  @ViewChild('policyNameCellTemplate') policyNameCellTemplate: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;
  @ViewChild('prevJobs') prevJobsRef: TemplateRef<any>;
  @ViewChild('serviceNameCellTemplate') serviceNameCellRef: TemplateRef<any>;

  @HostBinding('class') className = 'dlm-jobs-overview-table';

  @Output() onShowPolicyLog = new EventEmitter<any>();

  constructor(protected t: TranslateService,
              protected store: Store<fromRoot.State>,
              private router: Router,
              protected logService: LogService) {
    super(store, logService, t);
  }

  protected translateColumn(columnName: string): string {
    return this.t.instant(`page.overview.table.column.${columnName}`);
  }

  private getClusterName(policyClusterName: string) {
    return PolicyService.getClusterName(policyClusterName);
  }

  private getDatacenterName(policyClusterName: string) {
    return PolicyService.getDatacenterName(policyClusterName);
  }

  private generateNotification() {
    const actionName = this.selectedAction.name.toLowerCase();
    return {
      [NOTIFICATION_TYPES.SUCCESS]: {
        title: `common.action_notifications.${actionName}.success.title`,
        body: this.t.instant(`common.action_notifications.${actionName}.success.body`, {
          policyName: this.selectedForActionRow.name
        })
      },
      [NOTIFICATION_TYPES.ERROR]: {
        title: `common.action_notifications.${actionName}.error.title`,
        contentType: NOTIFICATION_CONTENT_TYPE.MODAL_LINK
      },
      levels: [NOTIFICATION_TYPES.SUCCESS, NOTIFICATION_TYPES.ERROR]
    };
  }

  ngOnInit() {
    const actionLabel = name => this.t.instant(`page.overview.table.actions.${name}`);
    this.rowActions = <ActionItemType[]>[
      {label: actionLabel('abort_job'), name: 'ABORT_JOB', enabledFor: 'RUNNING', qeAttr: 'abort-job'},
      {label: actionLabel('rerun_job'), name: 'RERUN_JOB', disableFn: this.isRerunDisabled.bind(this), qeAttr: 'rerun-job'},
      {label: actionLabel('delete_policy'), name: 'DELETE_POLICY', disabledFor: '', qeAttr: 'delete-policy'},
      {label: actionLabel('suspend_policy'), name: 'SUSPEND_POLICY', disableFn: suspendDisabled, qeAttr: 'suspend-policy'},
      {label: actionLabel('activate_policy'), name: 'ACTIVATE_POLICY', disableFn: activateDisabled, qeAttr: 'activate-policy'}
    ];
    this.columns = [
      {cellTemplate: this.statusCellTemplate, maxWidth: 25, minWidth: 25},
      {
        prop: 'lastJobResource',
        cellClass: 'text-cell',
        headerClass: 'text-header',
        cellTemplate: this.verbStatusCellTemplate,
        name: this.translateColumn('job_status'),
        comparator(job1, job2) {
          return job1.status > job2.status ? 1 : -1;
        }
      },
      {prop: 'sourceCluster', name: this.translateColumn('source_cluster'), cellTemplate: this.clusterNameCellRef},
      {...TableComponent.makeFixedWith(20), name: '',
        cellTemplate: this.destinationIconCellRef, cellClass: 'arrow-cell'},
      {prop: 'targetCluster', name: this.translateColumn('destination_cluster'), cellTemplate: this.clusterNameCellRef},
      {prop: 'service', name: this.t.instant('common.service'),
        cellTemplate: this.serviceNameCellRef, cellClass: 'service-cell'},
      {
        prop: 'name',
        cellClass: 'text-cell',
        headerClass: 'text-header',
        name: this.t.instant('common.policy'),
        cellTemplate: this.policyNameCellTemplate
      },
      {cellTemplate: this.prevJobsRef, name: this.translateColumn('last_ten_jobs'), prop: 'lastTenJobs', sortable: false},
      {
        ...TableComponent.makeFixedWith(160),
        prop: 'lastJobResource.trackingInfo.progress',
        cellTemplate: this.transferredFormattedTemplate,
        name: this.translateColumn('transferred'),
        cellClass: 'date-cell',
        headerClass: 'date-header',
        sortable: false
      },
      {
        prop: 'lastJobResource.duration',
        cellTemplate: this.runTimeTemplate,
        name: this.translateColumn('runtime'),
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'lastJobResource.startTime',
        cellTemplate: this.agoTemplate,
        name: this.translateColumn('started'),
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'lastJobResource.endTime',
        cellTemplate: this.agoTemplate,
        name: this.translateColumn('ended'),
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {name: ' ', cellTemplate: this.actionsCellRef, maxWidth: 55, sortable: false}
    ];
  }

  handleSelectedAction({row, action}) {
    this.selectedAction = action;
    this.selectedForActionRow = row;
    const nextAction = {
      DELETE_POLICY: deletePolicy,
      SUSPEND_POLICY: suspendPolicy,
      ACTIVATE_POLICY: resumePolicy,
      ABORT_JOB: abortJob,
      RERUN_JOB: rerunJob
    }[this.selectedAction.name];
    if (nextAction) {
      this.store.dispatch(confirmNextAction(
        nextAction(this.selectedForActionRow, { notification: this.generateNotification() }),
        {
          ...confirmationOptionsDefaults,
          qeAttr: `confirmation-${this.selectedAction.qeAttr}`
        } as ConfirmationOptions
      ));
    }
  }

  goToPolicy(policy: Policy) {
    this.router.navigate(['/policies'], {queryParams: {policy: policy.name}});
  }

  showPolicyLog(policy) {
    this.onShowPolicyLog.emit(policy);
  }

  isHDFS(serviceName): boolean {
    return serviceName.toLowerCase() === 'hdfs';
  }

  isRerunDisabled(policy: Policy, action): boolean {
    return this.cannotRerun(policy, policy.lastJobResource);
  }

  getTransferredTooltip(progress: JobTrackinfoProgress): string {
    let tooltip = '';
    if (progress.filesCopied) {
      tooltip = `${UNIT_LABELS[progress.unit]}: ${progress.filesCopied}`;
    }
    return tooltip;
  }
}
