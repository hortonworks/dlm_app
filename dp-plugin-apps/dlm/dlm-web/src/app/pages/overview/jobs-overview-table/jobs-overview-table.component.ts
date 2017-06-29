import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ViewEncapsulation } from '@angular/core';
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
import { abortJob } from 'actions/job.action';
import { StatusColumnComponent } from 'components/table-columns/status-column/status-column.component';
import { Policy } from 'models/policy.model';

@Component({
  selector: 'dlm-jobs-overview-table',
  templateUrl: './jobs-overview-table.component.html',
  styleUrls: ['./jobs-overview-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JobsOverviewTableComponent extends JobsTableComponent implements OnInit, OnDestroy {
  private selectedAction: ActionItemType;
  private selectedForActionRow: any;
  showOperationResponseModal = false;
  showActionConfirmationModal = false;
  operationResponseSubscription: Subscription;
  lastOperationResponse: OperationResponse = <OperationResponse>{};

  @ViewChild('destinationIconCell') destinationIconCellRef: TemplateRef<any>;
  @ViewChild('verbStatusCellTemplate') verbStatusCellTemplate: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;
  @ViewChild(StatusColumnComponent) statusColumn: StatusColumnComponent;
  @ViewChild('prevJobs') prevJobsRef: TemplateRef<any>;

  constructor(private t: TranslateService, protected store: Store<fromRoot.State>, private router: Router) {
    super(store);
  }

  private translateColumn(columnName: string): string {
    return this.t.instant(`page.overview.table.column.${columnName}`);
  }

  ngOnInit() {
    const actionLabel = name => this.t.instant(`page.overview.table.actions.${name}`);
    this.rowActions = <ActionItemType[]>[
      {label: actionLabel('abort_job'), name: 'ABORT_JOB', enabledFor: 'RUNNING'},
      {label: actionLabel('delete_policy'), name: 'DELETE_POLICY', disabledFor: ''},
      {label: actionLabel('suspend_policy'), name: 'SUSPEND_POLICY', disabledFor: 'SUSPENDED'},
      {label: actionLabel('activate_policy'), name: 'ACTIVATE_POLICY', disabledFor: 'RUNNING'}
    ];
    this.columns = [
      {
        ...this.statusColumn.cellSettings,
        prop: 'status',
        cellTemplate: this.statusColumn.cellRef,
        name: ' ',
        sortable: false,
        ...TableComponent.makeFixedWith(25)
      },
      {prop: 'status', cellClass: 'text-cell', headerClass: 'text-header', cellTemplate: this.verbStatusCellTemplate},
      {prop: 'name', cellClass: 'text-cell', headerClass: 'text-header', name: this.t.instant('common.policy')},
      {prop: 'sourceCluster', name: this.translateColumn('source_cluster')},
      {...TableComponent.makeFixedWith(20), name: '', cellTemplate: this.destinationIconCellRef},
      {prop: 'targetCluster', name: this.translateColumn('destination_cluster')},
      {prop: 'service', name: this.t.instant('common.service')},
      {cellTemplate: this.prevJobsRef, name: this.t.instant('page.jobs.prev_jobs')},
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
      {
        prop: 'lastJobResource.trackingInfo.timeTaken',
        cellTemplate: this.runTimeTemplate,
        name: this.translateColumn('runtime'),
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'lastJobResource.trackingInfo.bytesCopied',
        cellTemplate: this.transferredFormattedTemplate,
        name: this.translateColumn('transferred'),
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

  handleSelectedAction({policy, action}) {
    this.selectedAction = action;
    this.selectedForActionRow = policy;
    this.showActionConfirmationModal = true;
  }

  onActionConfirmation() {
    if (!this.operationResponseSubscription) {
      this.subscribeToOperation();
    }
    switch (this.selectedAction.name) {
      case 'ABORT_JOB':
        return this.store.dispatch(abortJob(this.selectedForActionRow));
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
    this.router.navigate(['/policies'], {queryParams: {policy: policy.id}});
  }
}
