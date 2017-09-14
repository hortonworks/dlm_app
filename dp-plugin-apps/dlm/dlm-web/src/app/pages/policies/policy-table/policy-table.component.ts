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
  EventEmitter
} from '@angular/core';
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
import { getJobsPage } from 'selectors/job.selector';
import { Observable } from 'rxjs/Observable';
import { Job } from 'models/job.model';
import { abortJob, rerunJob, loadJobsPageForPolicy } from 'actions/job.action';
import { deletePolicy, resumePolicy, suspendPolicy } from 'actions/policy.action';
import { PolicyService } from 'services/policy.service';
import { OperationResponse } from 'models/operation-response.model';
import { getLastOperationResponse } from 'selectors/operation.selector';
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
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NOTIFICATION_TYPES, NOTIFICATION_CONTENT_TYPE } from 'constants/notification.constant';
import { confirmNextAction } from 'actions/confirmation.action';

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
  policyContent = PolicyContent;
  tablesSearchPattern = '';

  private selectedAction: ActionItemType;
  private selectedForActionRow: Policy;
  private selectedJobsSort = {};
  private selectedJobsPage = {};
  private selectedJobsActions = {};
  private subscriptions: Subscription[] = [];
  private visibleActionMap = {};
  private selectedFileBrowserPage = {};

  lastOperationResponse: OperationResponse = <OperationResponse>{};
  showOperationResponseModal = false;
  operationResponseSubscription: Subscription;

  activeContentType: PolicyContent = PolicyContent.Jobs;
  sourceCluster: number;
  hdfsRootPath: string;

  jobs: Job[] = [];
  jobsOffset: number;
  jobsOverallCount: number;
  jobsPolicyId: number;
  loadingJobs = false;

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
  @ViewChild('clusterCellTemplate') clusterCellTemplateRef: TemplateRef<any>;
  @ViewChild('table') table: TemplateRef<any>;

  @ViewChild(TableComponent) tableComponent: TableComponent;

  @Input() clusters: Cluster[] = [];
  @Input() activePolicyId = '';
  @Input() policies: Policy[] = [];
  @Output() detailsToggle = new EventEmitter<any>();

  rowActions = <ActionItemType[]>[
    {label: 'Delete', name: 'DELETE_POLICY', disabledFor: ''},
    {label: 'Suspend', name: 'SUSPEND_POLICY', disabledFor: 'SUSPENDED'},
    {label: 'Activate', name: 'ACTIVATE_POLICY', disabledFor: 'RUNNING'},
    {label: 'View Log', name: 'LOG', disabledFor: ''}
  ];

  private initPolling() {
    const polling$ = Observable.interval(POLL_INTERVAL)
      .withLatestFrom(this.selectedPolicy$)
      .filter(([_, policy]) => Boolean(
        this.activeContentType === PolicyContent.Jobs && policy && policy.id && this.tableComponent.expandedRows[policy.id]
      ))
      .do(([_, policy]) => {
        this.store.dispatch(loadJobsPageForPolicy(policy, this.selectedJobsPage[policy.id] || 0, this.selectedJobsSort[policy.id] || []));
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

  constructor(private t: TranslateService,
              private store: Store<fromRoot.State>,
              private hiveService: HiveService,
              private logService: LogService) {
    this.subscriptions.push(store.select(getJobsPage).subscribe(jobsPage => {
      if (this.jobsPolicyId !== jobsPage.policyId) {
        this.jobs = [];
      }
      this.jobsPolicyId = jobsPage.policyId;
      this.jobs = jobsPage.jobs;
      this.jobsOffset = jobsPage.offset;
      this.jobsOverallCount = jobsPage.overallRecords;
      this.loadingJobs = false;
    }));
    this.policyDatabase$ = this.selectedPolicy$
      .filter(policy => !!this.clusterByDatacenterId(policy.sourceCluster))
      .mergeMap(policy => {
        const cluster = this.clusterByDatacenterId(policy.sourceCluster);
        return store.select(getDatabase(this.hiveService.makeDatabaseId(policy.sourceDataset, cluster.id)));
      });
  }

  ngOnInit() {
    this.columns = [
      {name: ' ', prop: 'type', cellClass: 'icon-cell',
        cellTemplate: this.iconColumn.cellRef, sortable: false, flexGrow: 1},
      {
        prop: 'status',
        name: ' ',
        cellTemplate: this.statusColumn.cellRef,
        sortable: false,
        flexGrow: 1,
        headerClass: 'no-sort-cell',
        cellClass: 'icon-cell'
      },
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
        flexGrow: 6
      },
      {
        prop: 'accessMode',
        name: ' ',
        cellTemplate: this.flowStatusCellRef,
        cellClass: 'flow-status-cell',
        sortable: false,
        flexGrow: 7
      },
      {prop: 'sourceClusterResource', name: this.t.instant('common.source'), flexGrow: 6,
        cellTemplate: this.clusterCellTemplateRef, comparator: this.clusterResourceComparator.bind(this)},
      {prop: 'targetClusterResource', name: this.t.instant('common.destination'), flexGrow: 6,
        cellTemplate: this.clusterCellTemplateRef, comparator: this.clusterResourceComparator.bind(this)},
      {prop: 'sourceDataset', name: this.t.instant('common.path'),
        cellTemplate: this.pathCellRef, flexGrow: 9, sortable: false},
      {cellTemplate: this.prevJobsRef, name: this.t.instant('page.jobs.prev_jobs'),
        sortable: false, flexGrow: 4},
      {prop: 'jobs.0.duration', name: this.t.instant('common.duration'),
        cellTemplate: this.durationCellRef, flexGrow: 5},
      {prop: 'lastGoodJobResource.startTime', name: 'Last Good',
        cellTemplate: this.lastGoodCellRef, flexGrow: 5},
      {name: ' ', cellTemplate: this.actionsCellRef, flexGrow: 2, sortable: false}
    ];
    if (this.activePolicyId) {
      this.openJobsForPolicy();
    }
    this.initPolling();
  }

  clusterResourceComparator(cluster1: Cluster, cluster2: Cluster) {
    return cluster1.name.toLowerCase() > cluster2.name.toLowerCase() ? 1 : -1;
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
        this.store.dispatch(confirmNextAction(
          nextAction(this.selectedForActionRow, { notification: this.generateNotification()})
        ));
      }
    }
  }

  abortJobAction(job) {
    const policy = this.policies.find(p => p.policyId === job.policyId);
    const action = <ActionItemType>{name: 'ABORT_JOB'};
    this.handleSelectedAction({ row: policy, action });
  }

  rerunJobAction(job) {
    const policy = this.policies.find(p => p.policyId === job.policyId);
    const action = <ActionItemType>{name: 'RERUN_JOB'};
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
    this.toggleSelectedRow(policy, contentType);
    this.activatePolicy(policy, contentType);
    this.loadContentDetails(policy, contentType);
    this.handleJobsPageChange({offset: 0}, policy.id);
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
      const cluster = this.clusterByDatacenterId(policy.sourceCluster);
      if (policy.type === POLICY_TYPES.HIVE) {
        this.store.dispatch(loadFullDatabases(cluster.id));
      } else {
        this.sourceCluster = cluster.id;
        this.hdfsRootPath = policy.sourceDataset;
      }
    }
  }

  loadPageForPolicy(rowId) {
    const policy = this.selectedPolicy$.getValue();
    if (policy) {
      this.loadingJobs = true;
      this.store.dispatch(loadJobsPageForPolicy(policy, this.selectedJobsPage[rowId], this.selectedJobsSort[rowId]));
    }
  }

  handleOnSortJobs(sort, rowId) {
    this.selectedJobsSort[rowId] = sort.sorts;
    this.loadPageForPolicy(rowId);
  }

  getJobsSortForRow(rowId) {
    return rowId && rowId in this.selectedJobsSort ? this.selectedJobsSort[rowId] : [];
  }

  handleJobsPageChange(page, rowId) {
    this.selectedJobsPage[rowId] = page.offset;
    this.loadPageForPolicy(rowId);
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

  handleOnOpenDirectory(path) {
    this.hdfsRootPath = path;
  }

  getFilesPageForRow(rowId) {
    return rowId && rowId in this.selectedFileBrowserPage ? this.selectedFileBrowserPage[rowId] : 0;
  }

  handleFilesPageChange(page, rowId) {
    this.selectedFileBrowserPage[rowId] = page.offset;
  }

  isPrevJobsActive(rowId) {
    return this.tableComponent.expandedRows[rowId] && this.activeContentType === PolicyContent.Jobs;
  }

  handleTablesFilterApplied(event) {
    this.tablesSearchPattern = event;
  }
}
