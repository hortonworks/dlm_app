/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  TemplateRef,
  OnDestroy,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { Policy } from 'models/policy.model';
import { Cluster } from 'models/cluster.model';
import { ActionItemType } from 'components';
import { TableTheme } from 'common/table/table-theme.type';
import { StatusColumnComponent } from 'components/table-columns/policy-status-column/policy-status-column.component';
import { PolicyInfoComponent } from './policy-info/policy-info.component';
import { IconColumnComponent } from 'components/table-columns/icon-column/icon-column.component';
import { TranslateService } from '@ngx-translate/core';
import { TableComponent } from 'common/table/table.component';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers/';
import { getJobsPage } from 'selectors/job.selector';
import { Observable } from 'rxjs/Observable';
import { Job } from 'models/job.model';
import { abortJob, rerunJob, loadJobsPageForPolicy } from 'actions/job.action';
import { deletePolicy, resumePolicy, suspendPolicy } from 'actions/policy.action';
import { OperationResponse } from 'models/operation-response.model';
import { getLastOperationResponse } from 'selectors/operation.selector';
import { getMergedProgress, getAllProgressStates } from 'selectors/progress.selector';
import { ProgressState } from 'models/progress-state.model';
import { PolicyContent } from '../policy-details/policy-content.type';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { POLICY_TYPES, SOURCE_TYPES } from 'constants/policy.constant';
import { loadDatabases, loadTables } from 'actions/hivelist.action';
import { HiveDatabase } from 'models/hive-database.model';
import { getDatabase } from 'selectors/hive.selector';
import { HiveService } from 'services/hive.service';
import { POLL_INTERVAL } from 'constants/api.constant';
import { LogService } from 'services/log.service';
import { EntityType } from 'constants/log.constant';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NOTIFICATION_TYPES, NOTIFICATION_CONTENT_TYPE } from 'constants/notification.constant';
import { confirmNextAction } from 'actions/confirmation.action';
import { TableFooterOptions } from 'common/table/table-footer/table-footer.type';
import {
  ConfirmationOptions,
  confirmationOptionsDefaults
} from 'components/confirmation-modal/confirmation-options.type';
import { suspendDisabled, activateDisabled } from 'utils/policy-util';
import { HiveBrowserTablesLoadingMap } from 'components/hive-browser';
import { isEqual, merge, cloneDeep } from 'utils/object-utils';
import { removeProgressState } from 'actions/progress.action';

const DATABASE_REQUEST = '[POLICY_TABLE] DATABASE_REQUEST';

@Component({
  selector: 'dlm-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./policy-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyTableComponent implements OnInit, OnDestroy {
  columns: any[];
  tableTheme = TableTheme.Cards;
  columnMode = ColumnMode.flex;
  selectedPolicy$: BehaviorSubject<Policy> = new BehaviorSubject(<Policy>{});
  policyDatabase$: Observable<HiveDatabase>;
  databaseRequest$: Observable<ProgressState>;
  policyContent = PolicyContent;
  tablesSearchPattern = '';
  tablesLoadingMap: HiveBrowserTablesLoadingMap = {};

  private selectedAction: ActionItemType;
  private selectedForActionRow: Policy;
  private selectedJobsSort = {};
  private selectedJobsSort$: BehaviorSubject<any> = new BehaviorSubject({});
  private selectedJobsPage = {};
  private selectedJobsPage$: BehaviorSubject<any> = new BehaviorSubject(0);
  private selectedJobsFilters = {};
  private selectedJobsFilters$: BehaviorSubject<any> = new BehaviorSubject([]);
  private selectedJobsInput = {};
  private selectedJobsInput$: BehaviorSubject<any> = new BehaviorSubject('');
  private selectedJobsActions = {};
  private subscriptions: Subscription[] = [];
  private selectedFileBrowserPage = {};
  private loadedDatabaseTables = {};
  private tableRequestPrefix = '[PolicyTableComponent] LOAD_TABLES ';

  lastOperationResponse: OperationResponse = <OperationResponse>{};
  showOperationResponseModal = false;
  operationResponseSubscription: Subscription;

  activeContentType: PolicyContent = PolicyContent.Jobs;
  sourceCluster: number;
  hdfsRootPath: string;

  jobs: Job[] = [];
  jobsOffset: number;
  jobsOverallCount: number;
  jobsPolicyId: string;
  loadingJobs = false;
  tableFooterOptions = {
    showFilterSummary: true,
    pagerDropup: true
  } as TableFooterOptions;

  @ViewChild(IconColumnComponent) iconColumn: IconColumnComponent;
  @ViewChild(StatusColumnComponent) statusColumn: StatusColumnComponent;
  @ViewChild(PolicyInfoComponent) policyInfoColumn: PolicyInfoComponent;
  @ViewChild('flowStatusCell') flowStatusCellRef: TemplateRef<any>;
  @ViewChild('durationCell') durationCellRef: TemplateRef<any>;
  @ViewChild('lastGoodCell') lastGoodCellRef: TemplateRef<any>;
  @ViewChild('prevJobs') prevJobsRef: TemplateRef<any>;
  @ViewChild('rowDetail') rowDetailRef: TemplateRef<any>;
  @ViewChild('iconCellTemplate') iconCellTemplate: TemplateRef<any>;
  @ViewChild('pathCell') pathCellRef: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;
  @ViewChild('verbStatusCellTemplate') verbStatusCellTemplate: TemplateRef<any>;
  @ViewChild('sourceCellTemplate') sourceCellTemplateRef: TemplateRef<any>;
  @ViewChild('targetCellTemplate') targetCellTemplateRef: TemplateRef<any>;
  @ViewChild('table') table: TemplateRef<any>;

  @ViewChild(TableComponent) tableComponent: TableComponent;

  @Input() clusters: Cluster[] = [];
  @Input() activePolicyId = '';
  @Input() policies: Policy[] = [];
  @Input() policiesCount: 0;
  @Output() detailsToggle = new EventEmitter<any>();

  rowActions = <ActionItemType[]>[
    {label: 'Delete', name: 'DELETE_POLICY', disabledFor: '', qeAttr: 'delete-policy'},
    {label: 'Suspend', name: 'SUSPEND_POLICY', disableFn: suspendDisabled, qeAttr: 'suspend-policy'},
    {label: 'Activate', name: 'ACTIVATE_POLICY', disableFn: activateDisabled, qeAttr: 'activate-policy'},
    {label: 'View Log', name: 'LOG', disabledFor: '', qeAttr: 'policy-log'}
  ];

  private initPolling() {
    const polling$ = Observable.interval(POLL_INTERVAL)
      .withLatestFrom(this.selectedPolicy$)
      .filter(([_, policy]) => Boolean(
        this.activeContentType === PolicyContent.Jobs && policy && policy.id && this.tableComponent.isRowExpanded(policy)
      ))
      .do(([_, policy]) => {
        this.store.dispatch(loadJobsPageForPolicy(
          policy,
          this.selectedJobsPage[policy.id] || 0,
          this.selectedJobsSort[policy.id] || [],
          10,
          this.selectedJobsFilters[policy.id] || []));
      });
    this.subscriptions.push(polling$.subscribe());
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

  private resetJobsData(): void {
    this.jobs = [];
    this.jobsOffset = 0;
    this.jobsOverallCount = 0;
  }

  private setupDatabase(): void {
    this.policyDatabase$ = this.selectedPolicy$
      .filter(policy => !!this.clusterByDatacenterId(policy.sourceCluster))
      .switchMap(policy => {
        const cluster = this.clusterByDatacenterId(policy.sourceCluster);
        return this.store.select(getDatabase(this.hiveService.makeDatabaseId(policy.sourceDataset, cluster.id)));
      });

    const loadTablesData = this.policyDatabase$
      .filter(db => !!db)
      .distinctUntilKeyChanged('entityId')
      .subscribe(db => {
        if (!(db.entityId in this.tablesLoadingMap)) {
          const id = db.entityId;
          this.tablesLoadingMap[id] = null;
          this.store.dispatch(loadTables({
            clusterId: db.clusterId,
            databaseId: db.name
          }, {requestId: this.tableRequestPrefix + db.entityId}));
        }
      });

    const updateTablesLoadingProgress = this.store.select(getAllProgressStates)
      .subscribe(progressList => {
        const updates: {[databaseId: string]: ProgressState}  = progressList
          .reduce((all, progressState: ProgressState) => {
            if (progressState.requestId.startsWith(this.tableRequestPrefix)) {
              const databaseId = progressState.requestId.replace(this.tableRequestPrefix, '');
              return {
                ...all,
                [databaseId]: progressState
              };
            }
            return all;
          }, {});
        this.tablesLoadingMap = merge(this.tablesLoadingMap, updates);
      });

    this.subscriptions.push(updateTablesLoadingProgress);
    this.subscriptions.push(loadTablesData);
  }

  constructor(private t: TranslateService,
              private store: Store<fromRoot.State>,
              private hiveService: HiveService,
              private logService: LogService) {
    this.databaseRequest$ = store.select(getMergedProgress(DATABASE_REQUEST))
      .distinctUntilKeyChanged('isInProgress');
    const updateJobsPaging = store.select(getJobsPage).subscribe(jobsPage => {
      if (this.jobsPolicyId !== jobsPage.policyId) {
        this.jobs = [];
      }
      this.jobsPolicyId = jobsPage.policyId;
      this.jobs = jobsPage.jobs;
      this.jobsOffset = jobsPage.offset;
      this.jobsOverallCount = jobsPage.overallRecords;
      this.loadingJobs = false;
    });
    this.subscriptions.push(updateJobsPaging);
  }

  ngOnInit() {
    this.columns = [
      {name: ' ', prop: 'type', cellClass: 'icon-cell',
        cellTemplate: this.iconColumn.cellRef, sortable: false, flexGrow: 1},
      {
        prop: 'displayStatus',
        name: this.t.instant('common.status.self'),
        cellClass: 'text-cell',
        headerClass: 'text-header',
        cellTemplate: this.verbStatusCellTemplate,
        flexGrow: 4
      },
      {
        name: this.t.instant('common.name'),
        cellTemplate: this.policyInfoColumn.cellRef,
        sortable: false,
        flexGrow: 8
      },
      {
        prop: 'sourceDataset',
        name: this.t.instant('common.source'),
        cellTemplate: this.sourceCellTemplateRef,
        comparator: this.clusterResourceComparator.bind(this),
        flexGrow: 9
      },
      {
        prop: 'accessMode',
        name: ' ',
        cellTemplate: this.flowStatusCellRef,
        cellClass: 'flow-status-cell',
        sortable: false,
        flexGrow: 7
      },
      {prop: 'targetDataset', name: this.t.instant('common.destination'), flexGrow: 9,
        cellTemplate: this.targetCellTemplateRef, comparator: this.clusterResourceComparator.bind(this)},
      {cellTemplate: this.prevJobsRef, name: this.t.instant('page.jobs.prev_jobs'),
        sortable: false, flexGrow: 4},
      {prop: 'lastJobDuration', name: this.t.instant('common.duration'),
        cellTemplate: this.durationCellRef, flexGrow: 3},
      {prop: 'lastSucceededJobTime', name: 'Last Good',
        cellTemplate: this.lastGoodCellRef, flexGrow: 3},
      {name: ' ', cellTemplate: this.actionsCellRef, flexGrow: 2, sortable: false}
    ];
    if (this.activePolicyId) {
      this.openJobsForPolicy();
    }
    this.initPolling();
    this.setupDatabase();
    this.initJobsLoading();
  }

  clusterResourceComparator(cluster1: Cluster, cluster2: Cluster) {
    return cluster1.name.toLowerCase() > cluster2.name.toLowerCase() ? 1 : -1;
  }

  initJobsLoading() {
    this.subscriptions.push(
      Observable.combineLatest(this.selectedJobsFilters$, this.selectedJobsPage$, this.selectedJobsSort$, this.selectedPolicy$)
      .distinctUntilChanged(isEqual)
      .subscribe(([filters, page, sorts, policy]) => {
        if (policy.id) {
          this.loadingJobs = true;
          this.store.dispatch(loadJobsPageForPolicy(policy, page, sorts, 10, filters));
        }
      }));
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

  /**
   * Returns cluster instance by policy's sourceCluster or targetCluster value
   *
   * @param idByDatacenter {string} - cluster id in format <datacenter>$<clusterName>
   */
  clusterByDatacenterId(idByDatacenter: string): Cluster {
    return this.clusters.find(cluster => cluster.idByDatacenter === idByDatacenter);
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
    const requestIds = Object.keys(this.tablesLoadingMap).map(id => this.tableRequestPrefix + id);
    this.store.dispatch(removeProgressState(requestIds));
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
      const nextAction = {
        DELETE_POLICY: deletePolicy,
        SUSPEND_POLICY: suspendPolicy,
        ACTIVATE_POLICY: resumePolicy,
        ABORT_JOB: abortJob,
        RERUN_JOB: rerunJob
      }[this.selectedAction.name];
      if (nextAction) {
        const body = ['DELETE_POLICY', 'SUSPEND_POLICY', 'ACTIVATE_POLICY'].indexOf(this.selectedAction.name) === -1 ?
          confirmationOptionsDefaults.body :
          this.t.instant(`page.policies.perform_action.${this.selectedAction.name.toLowerCase()}.body`, {policyName: row.name});
        this.store.dispatch(confirmNextAction(
          nextAction(this.selectedForActionRow, { notification: this.generateNotification()}),
          {
            ...confirmationOptionsDefaults,
            body,
            confirmBtnText: this.t.instant('common.yes'),
            qeAttr: `confirmation-${this.selectedAction.qeAttr}`
          } as ConfirmationOptions
        ));
      }
    }
  }

  abortJobAction(job) {
    const policy = this.policies.find(p => p.policyId === job.policyId);
    const action = <ActionItemType>{name: 'ABORT_JOB', qeAttr: 'abort-job'};
    this.handleSelectedAction({ row: policy, action });
  }

  rerunJobAction(job) {
    const policy = this.policies.find(p => p.policyId === job.policyId);
    const action = <ActionItemType>{name: 'RERUN_JOB', qeAttr: 'rerun-job'};
    this.handleSelectedAction({ row: policy, action });
  }

  /**
   * Show/hide policy details
   * Depends on `contentType` value toggling may not be done
   *
   * @param {Policy} policy
   * @param {PolicyContent} contentType
   */
  toggleRowDetail(policy: Policy, contentType: PolicyContent) {
    if (this.jobsPolicyId !== policy.id) {
      this.resetJobsData();
    }
    this.toggleSelectedRow(policy, contentType);
    this.activatePolicy(policy, contentType);
    this.loadContentDetails(policy, contentType);
    this.handleJobsPageChange({offset: 0}, policy.id);
    this.detailsToggle.emit({
      policy: policy.id,
      expanded: this.tableComponent.isRowExpanded(policy),
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
    if (!this.tableComponent.isRowExpanded(nextPolicy)) {
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

  loadContentDetails(policy: Policy, contentType) {
    if (!this.tableComponent.isRowExpanded(policy)) {
      return;
    }
    if (contentType === PolicyContent.Files) {
      if (policy.sourceType === SOURCE_TYPES.CLUSTER) {
        const cluster = this.clusterByDatacenterId(policy.sourceCluster);
        if (policy.type === POLICY_TYPES.HIVE) {
          this.store.dispatch(loadDatabases(cluster.id, {requestId: DATABASE_REQUEST}));
        } else {
          this.sourceCluster = cluster.id;
          this.hdfsRootPath = policy.sourceDataset;
        }
      } else {
        this.sourceCluster = null;
      }
    }
  }

  handleOnSortJobs(sort, rowId) {
    this.selectedJobsSort[rowId] = sort.sorts;
    this.selectedJobsSort$.next(sort.sorts);
  }

  handleOnFilterJobs(filters, rowId) {
    const f = Object.keys(filters).map(propertyName => ({propertyName, value: filters[propertyName].slice()}));
    this.selectedJobsFilters[rowId] = cloneDeep(f);
    this.selectedJobsFilters$.next(cloneDeep(f));
  }

  handleOnInput(filter, rowId) {
    this.selectedJobsInput[rowId] = filter;
    this.selectedJobsInput$.next(filter);
  }

  getJobsSortForRow(rowId) {
    return rowId && rowId in this.selectedJobsSort ? this.selectedJobsSort[rowId] : [];
  }

  getJobsFiltersForRow(rowId) {
    return rowId && rowId in this.selectedJobsFilters ? this.selectedJobsFilters[rowId] : [];
  }

  handleJobsPageChange(page, rowId) {
    this.selectedJobsPage[rowId] = page.offset;
    this.selectedJobsPage$.next(page.offset);
  }

  getJobsPageForRow(rowId) {
    return rowId && rowId in this.selectedJobsPage ? this.selectedJobsPage[rowId] : 0;
  }

  handleOnSelectActionJobs(jobEvent: { rowId: string, isOpen: boolean}, rowId) {
    this.selectedJobsActions[rowId] = jobEvent;
  }

  getJobsActiveActionsForRow(rowId) {
    return rowId && rowId in this.selectedJobsActions ? this.selectedJobsActions[rowId] : {};
  }

  handleOnOpenDirectory(path) {
    this.hdfsRootPath = path;
  }

  getFilesPageForRow(rowId) {
    return rowId && rowId in this.selectedFileBrowserPage ? this.selectedFileBrowserPage[rowId] : 0;
  }

  getJobsInputForRow(rowId) {
    return rowId && rowId in this.selectedJobsInput ? this.selectedJobsInput[rowId] : '';
  }

  handleFilesPageChange(page, rowId) {
    this.selectedFileBrowserPage[rowId] = page.offset;
  }

  isPrevJobsActive(row) {
    return this.tableComponent.isRowExpanded(row) && this.activeContentType === PolicyContent.Jobs;
  }

  handleTablesFilterApplied(event) {
    this.tablesSearchPattern = event;
  }

  getSourceName(policy: Policy) {
    if (policy.sourceType === SOURCE_TYPES.CLUSTER) {
      return policy.sourceClusterResource.name;
    }
    return policy.cloudCredentialResource.name;
  }

  getTargetName(policy: Policy) {
    if (policy.targetType === SOURCE_TYPES.CLUSTER) {
      return policy.targetClusterResource.name;
    }
    return policy.cloudCredentialResource.name;
  }
}
