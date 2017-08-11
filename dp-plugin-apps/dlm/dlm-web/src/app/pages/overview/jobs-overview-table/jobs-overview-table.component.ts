/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, OnInit, Output, ViewChild, TemplateRef, OnDestroy, ViewEncapsulation, EventEmitter, HostBinding
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

import * as fromRoot from 'reducers/';
import { ActionItemType } from 'components';
import { JobsTableComponent } from 'pages/jobs/jobs-table/jobs-table.component';
import { TableComponent } from 'common/table/table.component';
import { getLastOperationResponse } from 'selectors/operation.selector';
import { OperationResponse } from 'models/operation-response.model';
import { deletePolicy, resumePolicy, suspendPolicy } from 'actions/policy.action';
import { abortJob, rerunJob } from 'actions/job.action';
import { StatusColumnComponent } from 'components/table-columns/status-column/status-column.component';
import { Policy } from 'models/policy.model';
import { LogService } from 'services/log.service';
import { JOB_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { PolicyService } from 'services/policy.service';
import { contains } from 'utils/array-util';

@Component({
  selector: 'dlm-jobs-overview-table',
  templateUrl: './jobs-overview-table.component.html',
  styleUrls: ['./jobs-overview-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JobsOverviewTableComponent extends JobsTableComponent implements OnInit, OnDestroy {
  private selectedAction: ActionItemType;
  private selectedForActionRow: any;
  JOB_STATUS = JOB_STATUS;
  showOperationResponseModal = false;
  showActionConfirmationModal = false;
  operationResponseSubscription: Subscription;
  lastOperationResponse: OperationResponse = <OperationResponse>{};

  @ViewChild('clusterNameCellRef') clusterNameCellRef: TemplateRef<any>;
  @ViewChild('destinationIconCell') destinationIconCellRef: TemplateRef<any>;
  @ViewChild('verbStatusCellTemplate') verbStatusCellTemplate: TemplateRef<any>;
  @ViewChild('policyNameCellTemplate') policyNameCellTemplate: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;
  @ViewChild(StatusColumnComponent) statusColumn: StatusColumnComponent;
  @ViewChild('prevJobs') prevJobsRef: TemplateRef<any>;
  @ViewChild('serviceNameCellTemplate') serviceNameCellRef: TemplateRef<any>;

  @HostBinding('class') className = 'dlm-jobs-overview-table';

  @Output() onShowPolicyLog = new EventEmitter<any>();

  constructor(private t: TranslateService,
              protected store: Store<fromRoot.State>,
              private router: Router,
              protected logService: LogService) {
    super(store, logService);
  }

  private translateColumn(columnName: string): string {
    return this.t.instant(`page.overview.table.column.${columnName}`);
  }

  private getClusterName(policyClusterName: string) {
    return PolicyService.getClusterName(policyClusterName);
  }

  private getDatacenterName(policyClusterName: string) {
    return PolicyService.getDatacenterName(policyClusterName);
  }

  ngOnInit() {
    const actionLabel = name => this.t.instant(`page.overview.table.actions.${name}`);
    this.rowActions = <ActionItemType[]>[
      {label: actionLabel('abort_job'), name: 'ABORT_JOB', enabledFor: 'RUNNING'},
      {label: actionLabel('rerun_job'), name: 'RERUN_JOB', disableFn: this.isRerunDisabled},
      {label: actionLabel('delete_policy'), name: 'DELETE_POLICY', disabledFor: ''},
      {label: actionLabel('suspend_policy'), name: 'SUSPEND_POLICY', disabledFor: 'SUSPENDED'},
      {label: actionLabel('activate_policy'), name: 'ACTIVATE_POLICY', disabledFor: 'RUNNING'}
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
        prop: 'lastJobResource.trackingInfo',
        cellTemplate: this.transferredFormattedTemplate,
        name: this.translateColumn('transferred'),
        cellClass: 'date-cell',
        headerClass: 'date-header',
        sortable: false
      },
      {
        prop: 'lastJobResource.trackingInfo.timeTaken',
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

  ngOnDestroy() {
    if (this.operationResponseSubscription) {
      this.operationResponseSubscription.unsubscribe();
    }
  }

  handleSelectedAction({row, action}) {
    this.selectedAction = action;
    this.selectedForActionRow = row;
    this.showActionConfirmationModal = true;
  }

  onActionConfirmation() {
    if (!this.operationResponseSubscription) {
      this.subscribeToOperation();
    }
    switch (this.selectedAction.name) {
      case 'ABORT_JOB':
        return this.store.dispatch(abortJob(this.selectedForActionRow));
      case 'RERUN_JOB':
        return this.store.dispatch(rerunJob(this.selectedForActionRow));
      case 'DELETE_POLICY':
        return this.store.dispatch(deletePolicy(this.selectedForActionRow));
      case 'SUSPEND_POLICY':
        return this.store.dispatch(suspendPolicy(this.selectedForActionRow));
      case 'ACTIVATE_POLICY':
        return this.store.dispatch(resumePolicy(this.selectedForActionRow));
    }
  }

  /**
   * Subscription to the last operation result should be done only some operation initiated
   * It SHOULD NOT be added in the constructor or ngOnInit
   */
  subscribeToOperation() {
    this.operationResponseSubscription = this.store.select(getLastOperationResponse).subscribe(op => {
      if (op && op.status) {
        this.showOperationResponseModal = true;
        this.lastOperationResponse = op;
      }
    });
  }

  onCloseActionConfirmationModal() {
    this.showActionConfirmationModal = false;
  }

  onCloseOperationResponseModal() {
    this.showOperationResponseModal = false;
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
    const lastJob = policy.lastJobResource;
    return !lastJob || policy.status === POLICY_STATUS.SUSPENDED || contains([JOB_STATUS.SUCCESS, JOB_STATUS.RUNNING], lastJob.status);
  }
}
