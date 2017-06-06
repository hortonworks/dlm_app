import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

import * as fromRoot from 'reducers/';
import { ActionItemType, ActionColumnType } from 'components';
import { JobsTableComponent } from 'pages/jobs/jobs-table/jobs-table.component';
import { TableComponent } from 'common/table/table.component';
import { getLastOperationResponse } from 'selectors/operation.selector';
import { OperationResponse } from 'models/operation-response.model';
import { deletePolicy, resumePolicy, suspendPolicy } from 'actions/policy.action';
import { abortJob } from 'actions/job.action';

@Component({
  selector: 'dlm-jobs-overview-table',
  templateUrl: './jobs-overview-table.component.html',
  styleUrls: ['./jobs-overview-table.component.scss']
})
export class JobsOverviewTableComponent extends JobsTableComponent implements OnInit, OnDestroy {
  private selectedAction: ActionItemType;
  private selectedForActionRow: any;
  showOperationResponseModal = false;
  showActionConfirmationModal = false;
  operationResponseSubscription: Subscription;
  lastOperationResponse: OperationResponse = <OperationResponse>{};

  @ViewChild('destinationIconCell') destinationIconCellRef: TemplateRef<any>;

  constructor(private t: TranslateService, private store: Store<fromRoot.State>) {
    super();
  }

  ngOnInit() {
    const actionLabel = name => this.t.instant(`page.overview.table.actions.${name}`);
    this.rowActions = <ActionItemType[]>[
      {label: actionLabel('abort_job'), name: 'ABORT_JOB'},
      {label: actionLabel('delete_policy'), name: 'DELETE_POLICY'},
      {label: actionLabel('suspend_policy'), name: 'SUSPEND_POLICY'},
      {label: actionLabel('activate_policy'), name: 'ACTIVATE_POLICY'}
    ];
    this.columns = [
      {cellTemplate: this.statusCellTemplate, maxWidth: 25, minWidth: 25},
      {prop: 'status', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'name', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'sourceCluster', name: this.t.instant('page.overview.table.column.source_cluster')},
      {...TableComponent.makeFixedWith(20), name: '', cellTemplate: this.destinationIconCellRef},
      {prop: 'targetCluster', name: this.t.instant('page.overview.table.column.destination_cluster')},
      {prop: 'service', name: this.t.instant('common.service')},
      {
        prop: 'lastJobResource.startTime',
        cellTemplate: this.agoTemplate,
        name: 'Started',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'lastJobResource.endTime',
        cellTemplate: this.agoTemplate,
        name: 'Ended',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'lastJobResource.duration',
        cellTemplate: this.runTimeTemplate,
        name: 'Runtime',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'transferred',
        cellTemplate: this.transferredFormattedTemplate,
        name: 'Transferred',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'nextRun',
        cellTemplate: this.nextRunTemplate,
        name: 'Next Run',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      <ActionColumnType>{
        name: 'Actions',
        actionable: true,
        actions: this.rowActions
      }
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

}
