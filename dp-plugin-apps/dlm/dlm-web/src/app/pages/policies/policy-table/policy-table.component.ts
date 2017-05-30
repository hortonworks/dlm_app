import { Component, OnInit, Input, ViewChild, ViewEncapsulation, TemplateRef, OnDestroy, HostBinding } from '@angular/core';
import { Policy } from 'models/policy.model';
import { ActionItemType, ActionColumnType } from 'components';
import { TableTheme } from 'common/table/table-theme.type';
import { StatusColumnComponent } from 'components/table-columns/status-column/status-column.component';
import { PolicyInfoComponent } from './policy-info/policy-info.component';
import { IconColumnComponent } from 'components/table-columns/icon-column/icon-column.component';
import { TranslateService } from '@ngx-translate/core';
import { TableComponent } from 'common/table/table.component';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers/';
import { getAllJobs } from 'selectors/job.selector';
import { Observable } from 'rxjs/Observable';
import { Job } from 'models/job.model';
import { loadJobsForPolicy } from 'actions/job.action';
import { deletePolicy, resumePolicy, suspendPolicy } from 'actions/policy.action';
import { OperationResponse } from 'models/operation-response.model';
import { getLastOperationResponse } from 'selectors/operation.selector';
import { FlowStatusComponent } from './flow-status/flow-status.component';
import { PolicyContent } from '../policy-details/policy-content.type';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'dp-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./policy-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyTableComponent implements OnInit, OnDestroy {
  columns: any[];
  tableTheme = TableTheme.Cards;
  jobs$: Observable<Job[]>;
  filteredJobs: Job[] = [];
  selectedPolicy: Policy;
  policyContent = PolicyContent;

  private selectedAction: ActionItemType;
  private selectedForActionRow: Policy;
  showActionConfirmationModal = false;

  lastOperationResponse: OperationResponse = <OperationResponse>{};
  showOperationResponseModal = false;
  operationResponseSubscription: Subscription;
  jobsSubscription: Subscription;

  activeContentType = 'jobs';

  @ViewChild(IconColumnComponent) iconColumn: IconColumnComponent;
  @ViewChild(StatusColumnComponent) statusColumn: StatusColumnComponent;
  @ViewChild(PolicyInfoComponent) policyInfoColumn: PolicyInfoComponent;
  @ViewChild('durationCell') durationCellRef: TemplateRef<any>;
  @ViewChild('lastGoodCell') lastGoodCellRef: TemplateRef<any>;
  @ViewChild('dataCell') dataCellRef: TemplateRef<any>;
  @ViewChild('prevJobs') prevJobsRef: TemplateRef<any>;
  @ViewChild(FlowStatusComponent) flowStatusColumn: FlowStatusComponent;
  @ViewChild('scheduleCellTemplate') scheduleCellTemplateRef: TemplateRef<any>;
  @ViewChild('rowDetail') rowDetailRef: TemplateRef<any>;
  @ViewChild('iconCellTemplate') iconCellTemplate: TemplateRef<any>;

  @ViewChild(TableComponent) tableComponent: TableComponent;

  @Input() policies: Policy[] = [];

  rowActions = <ActionItemType[]>[
    {label: 'Delete', name: 'DELETE'},
    {label: 'Suspend', name: 'SUSPEND'},
    {label: 'Activate', name: 'ACTIVATE'}
  ];

  constructor(private t: TranslateService, private store: Store<fromRoot.State>) {
    this.jobs$ = this.store.select(getAllJobs);
    this.jobsSubscription = this.jobs$.subscribe(jobs => {
      if (jobs && this.selectedPolicy) {
        this.filteredJobs = jobs.filter(job => job.name === this.selectedPolicy.id);
      }
    });
  }

  ngOnInit() {
    this.columns = [
      {...this.iconColumn.cellSettings, prop: 'type', cellTemplate: this.iconColumn.cellRef},
      {...this.statusColumn.cellSettings, prop: 'status', cellTemplate: this.statusColumn.cellRef},
      {name: ' ', cellTemplate: this.policyInfoColumn.cellRef, sortable: false},
      {prop: 'sourceCluster', name: this.t.instant('common.source')},
      {
        prop: 'status',
        name: ' ',
        cellTemplate: this.flowStatusColumn.cellRef,
        minWidth: 200,
        cellClass: 'flow-status-cell',
        sortable: false
      },
      {prop: 'targetCluster', name: this.t.instant('common.destination')},
      {prop: 'lastJobResource.sourceDataset', name: this.t.instant('common.path')},
      {cellTemplate: this.prevJobsRef, name: this.t.instant('page.jobs.prev_jobs')},
      {prop: 'frequency', name: this.t.instant('common.schedule'), cellTemplate: this.scheduleCellTemplateRef},
      {prop: 'lastJobResource.duration', name: this.t.instant('common.duration'), cellTemplate: this.durationCellRef},
      {prop: 'lastJobResource.startTime', name: 'Last Good', cellTemplate: this.lastGoodCellRef},
      {
        prop: 'targetClusterResource.stats.CapacityUsed',
        name: this.t.instant('common.data'),
        cellTemplate: this.dataCellRef
      },
      <ActionColumnType>{
        name: 'Actions',
        actionable: true,
        actions: this.rowActions
      }
    ];
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

  ngOnDestroy() {
    if (this.operationResponseSubscription) {
      this.operationResponseSubscription.unsubscribe();
    }
    this.jobsSubscription.unsubscribe();
  }

  /**
   * Show confirmation modal before do action for selected policy
   *
   * @param {Policy} policy
   * @param {ActionItemType} action
   */
  handleSelectedAction({row: policy, action}) {
    this.selectedAction = action;
    this.selectedForActionRow = policy;
    this.showActionConfirmationModal = true;
  }

  onActionConfirmation() {
    if (!this.operationResponseSubscription) {
      this.subscribeToOperation();
    }
    switch (this.selectedAction.name) {
      case 'DELETE':
        return this.store.dispatch(deletePolicy(this.selectedForActionRow));
      case 'SUSPEND':
        return this.store.dispatch(suspendPolicy(this.selectedForActionRow));
      case 'ACTIVATE':
        return this.store.dispatch(resumePolicy(this.selectedForActionRow));
    }
  }

  onCloseActionConfirmationModal() {
    this.showActionConfirmationModal = false;
  }

  onCloseOperationResponseModal() {
    this.showOperationResponseModal = false;
  }

  /**
   * Show/hide policy details
   * Depends on `contentType` value toggling may not be done
   *
   * @param {Policy} policy
   * @param {PolicyContent} contentType
   */
  toggleRowDetail(policy, contentType) {
    if (this.selectedPolicy && this.selectedPolicy.id === policy.id) {
      if (this.activeContentType === contentType) {
        this.tableComponent.toggleRowDetail(policy);
      } else {
        this.activeContentType = contentType;
        if (!this.tableComponent.expandedRows[policy.id]) {
          this.tableComponent.toggleRowDetail(policy);
        }
      }
    } else {
      this.activeContentType = contentType;
      this.selectedPolicy = policy;
      this.store.dispatch(loadJobsForPolicy(policy));
      this.tableComponent.toggleRowDetail(policy);
    }
  }

}
