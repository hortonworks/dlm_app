import { Component, OnInit, Input, Output, ViewChild, ViewEncapsulation, TemplateRef, OnDestroy, EventEmitter } from '@angular/core';
import { Policy } from 'models/policy.model';
import { Cluster } from 'models/cluster.model';
import { ActionItemType } from 'components';
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
import { abortJob, loadJobsForPolicy } from 'actions/job.action';
import { deletePolicy, resumePolicy, suspendPolicy } from 'actions/policy.action';
import { OperationResponse } from 'models/operation-response.model';
import { getLastOperationResponse } from 'selectors/operation.selector';
import { FlowStatusComponent } from './flow-status/flow-status.component';
import { PolicyContent } from '../policy-details/policy-content.type';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { POLICY_TYPES } from 'constants/policy.constant';
import { loadFullDatabases } from 'actions/hivelist.action';
import { HiveDatabase } from 'models/hive-database.model';
import { getDatabase } from 'selectors/hive.selector';
import { HiveService } from 'services/hive.service';
import { POLL_INTERVAL } from 'constants/api.constant';
import { LogService } from 'services/log.service';
import { EntityType } from 'constants/log.constant';

@Component({
  selector: 'dlm-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./policy-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyTableComponent implements OnInit, OnDestroy {
  columns: any[];
  tableTheme = TableTheme.Cards;
  jobs$: Observable<Job[]>;
  filteredJobs$: Observable<Job[]>;
  selectedPolicy$: BehaviorSubject<Policy> = new BehaviorSubject(<Policy>{});
  policyDatabase$: Observable<HiveDatabase>;
  policyContent = PolicyContent;

  private selectedAction: ActionItemType;
  private selectedForActionRow: Policy;
  private selectedJobsSort = {};
  private selectedJobsPage = {};
  private selectedJobsActions = {};
  private subscriptions: Subscription[] = [];
  private visibleActionMap = {};
  showActionConfirmationModal = false;

  lastOperationResponse: OperationResponse = <OperationResponse>{};
  showOperationResponseModal = false;
  operationResponseSubscription: Subscription;

  activeContentType: PolicyContent = PolicyContent.Jobs;
  sourceCluster: number;
  hdfsRootPath: string;

  @ViewChild(IconColumnComponent) iconColumn: IconColumnComponent;
  @ViewChild(StatusColumnComponent) statusColumn: StatusColumnComponent;
  @ViewChild(PolicyInfoComponent) policyInfoColumn: PolicyInfoComponent;
  @ViewChild('durationCell') durationCellRef: TemplateRef<any>;
  @ViewChild('lastGoodCell') lastGoodCellRef: TemplateRef<any>;
  @ViewChild('prevJobs') prevJobsRef: TemplateRef<any>;
  @ViewChild(FlowStatusComponent) flowStatusColumn: FlowStatusComponent;
  @ViewChild('rowDetail') rowDetailRef: TemplateRef<any>;
  @ViewChild('iconCellTemplate') iconCellTemplate: TemplateRef<any>;
  @ViewChild('pathCell') pathCellRef: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;
  @ViewChild('verbStatusCellTemplate') verbStatusCellTemplate: TemplateRef<any>;
  @ViewChild('clusterCellTemplate') clusterCellTemplateRef: TemplateRef<any>;
  @ViewChild('table') table: TemplateRef<any>;

  @ViewChild(TableComponent) tableComponent: TableComponent;

  @Input() policies: Policy[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() activePolicyId = '';
  @Output() detailsToggle = new EventEmitter<any>();

  rowActions = <ActionItemType[]>[
    {label: 'Delete', name: 'DELETE', disabledFor: ''},
    {label: 'Suspend', name: 'SUSPEND', disabledFor: 'SUSPENDED'},
    {label: 'Activate', name: 'ACTIVATE', disabledFor: 'RUNNING'},
    {label: 'View Log', name: 'LOG', disabledFor: ''}
  ];

  private initPolling() {
    const polling$ = Observable.interval(POLL_INTERVAL)
      .withLatestFrom(this.selectedPolicy$)
      .filter(([_, policy]) => Boolean(
        this.activeContentType === PolicyContent.Jobs && policy && policy.id && this.tableComponent.expandedRows[policy.id]
      ))
      .do(([_, policy]) => {
        this.store.dispatch(loadJobsForPolicy(policy));
      });
    this.subscriptions.push(polling$.subscribe());
  }

  constructor(private t: TranslateService,
              private store: Store<fromRoot.State>,
              private hiveService: HiveService,
              private logService: LogService) {
    this.jobs$ = store.select(getAllJobs);
    this.filteredJobs$ = Observable.combineLatest(this.jobs$, this.selectedPolicy$).map(([jobs, selectedPolicy]) => {
      return selectedPolicy ? jobs.filter(job => job.policyId === selectedPolicy.id) : [];
    });
    this.policyDatabase$ = this.selectedPolicy$
      .filter(policy => !!this.clusterByName(policy.sourceCluster))
      .mergeMap(policy => {
        const cluster = this.clusterByName(policy.sourceCluster);
        return store.select(getDatabase(this.hiveService.makeDatabaseId(policy.sourceDataset, cluster.id)));
      });
  }

  ngOnInit() {
    this.columns = [
      {...this.iconColumn.cellSettings, prop: 'type', cellTemplate: this.iconColumn.cellRef},
      {
        ...this.statusColumn.cellSettings,
        prop: 'status',
        name: ' ',
        cellTemplate: this.statusColumn.cellRef,
        sortable: false,
        ...TableComponent.makeFixedWith(25)
      },
      {
        prop: 'status',
        cellClass: 'text-cell',
        headerClass: 'text-header',
        cellTemplate: this.verbStatusCellTemplate,
        ...TableComponent.makeFixedWith(80)
      },
      {name: ' ', cellTemplate: this.policyInfoColumn.cellRef, sortable: false, minWidth: 200},
      {prop: 'sourceClusterResource', name: this.t.instant('common.source'), cellTemplate: this.clusterCellTemplateRef},
      {
        prop: 'status',
        name: ' ',
        cellTemplate: this.flowStatusColumn.cellRef,
        minWidth: 130,
        cellClass: 'flow-status-cell',
        sortable: false
      },
      {prop: 'targetClusterResource', name: this.t.instant('common.destination'), cellTemplate: this.clusterCellTemplateRef},
      {prop: 'sourceDataset', name: this.t.instant('common.path'), cellTemplate: this.pathCellRef, minWidth: 200},
      {cellTemplate: this.prevJobsRef, name: this.t.instant('page.jobs.prev_jobs')},
      {prop: 'jobs.0.trackingInfo.timeTaken', name: this.t.instant('common.duration'), cellTemplate: this.durationCellRef},
      {prop: 'lastGoodJobResource.startTime', name: 'Last Good', cellTemplate: this.lastGoodCellRef},
      {name: ' ', cellTemplate: this.actionsCellRef, maxWidth: 55, sortable: false}
    ];
    if (this.activePolicyId) {
      this.openJobsForPolicy();
    }
    this.initPolling();
  }

  openJobsForPolicy() {
    const policy = this.policies.find(p => p.id === this.activePolicyId);
    if (policy) {
      const index = this.policies.indexOf(policy) + 1;
      const pageSize = this.tableComponent.limit;
      const div = index % pageSize;
      const p = index / pageSize;
      const pageNumber = div ? Math.ceil(p) : Math.floor(p);
      if (pageNumber) {
        this.tableComponent.changePage(pageNumber);
      }
      this.toggleRowDetail(policy, PolicyContent.Jobs);
    }
  }

  clusterByName(clusterName: string): Cluster {
    return this.clusters.find(cluster => cluster.name === clusterName);
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
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Show confirmation modal before do action for selected policy
   */
  handleSelectedAction({row, action}) {
    this.selectedAction = action;
    this.selectedForActionRow = row;
    if (action.name === 'LOG') {
      this.logService.showLog(EntityType.policy, row.id);
    } else {
      this.showActionConfirmationModal = true;
    }
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
      case 'ABORT_JOB':
        return this.store.dispatch(abortJob(this.selectedForActionRow));
    }
  }

  abortJobAction(policy) {
    this.selectedAction = <ActionItemType>{name: 'ABORT_JOB'};
    this.selectedForActionRow = this.policies.find(p => p.policyId === policy.policyId);
    this.showActionConfirmationModal = true;
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
  toggleRowDetail(policy: Policy, contentType: PolicyContent) {
    this.toggleSelectedRow(policy, contentType);
    this.activatePolicy(policy, contentType);
    this.loadContentDetails(policy, contentType);
    this.detailsToggle.emit({
      policy: policy.id,
      expanded: this.tableComponent.expandedRows[policy.id],
      contentType
    });
  }

  activatePolicy(policy, contentType) {
    this.activeContentType = contentType;
    this.selectedPolicy$.next(policy);
  }

  toggleSelectedRow(nextPolicy, contentType) {
    const selectedPolicy = this.selectedPolicy$.getValue();
    const isContentChanged = contentType !== this.activeContentType;
    const isPolicyChanged = selectedPolicy.id !== nextPolicy.id;
    // always open details on сollapsed item
    if (!this.tableComponent.expandedRows[nextPolicy.id]) {
      this.tableComponent.toggleRowDetail(nextPolicy);
      // collapse active policy and show selected when non-active policy clicked
    } else if (isPolicyChanged) {
      this.tableComponent.toggleRowDetail(selectedPolicy);
      this.tableComponent.toggleRowDetail(nextPolicy);
      // collapse active policy when clicked on same content toggler e.g. policy name, prev jobs
    } else if (!isContentChanged) {
      this.tableComponent.toggleRowDetail(nextPolicy);
    }
  }

  loadContentDetails(policy, contentType) {
    if (!this.tableComponent.expandedRows[policy.id]) {
      return;
    }
    if (contentType === PolicyContent.Files) {
      const cluster = this.clusterByName(policy.sourceCluster);
      if (policy.type === POLICY_TYPES.HIVE) {
        this.store.dispatch(loadFullDatabases(cluster.id));
      } else {
        this.sourceCluster = cluster.id;
        this.hdfsRootPath = policy.sourceDataset;
      }
    } else {
      this.store.dispatch(loadJobsForPolicy(policy));
    }
  }

  handleOnSortJobs(sort, rowId) {
    this.selectedJobsSort[rowId] = sort.sorts;
  }

  getJobsSortForRow(rowId) {
    return rowId && rowId in this.selectedJobsSort ? this.selectedJobsSort[rowId] : [];
  }

  handleJobsPageChange(page, rowId) {
    this.selectedJobsPage[rowId] = page.offset;
  }

  getJobsPageForRow(rowId) {
    return rowId && rowId in this.selectedJobsPage ? this.selectedJobsPage[rowId] : 0;
  }

  handleActionOpenChange(event: {rowId: string, isOpen: boolean}) {
    const { rowId, isOpen } = event;
    if (rowId) {
      this.visibleActionMap[rowId] = isOpen;
    }
  }

  shouldShowAction(rowId) {
    return rowId in this.visibleActionMap && this.visibleActionMap[rowId];
  }

  handleOnSelectActionJobs(jobEvent: { rowId: string, isOpen: boolean}, rowId) {
    this.selectedJobsActions[rowId] = jobEvent;
  }

  getJobsActiveActionsForRow(rowId) {
    return rowId && rowId in this.selectedJobsActions ? this.selectedJobsActions[rowId] : {};
  }
}
