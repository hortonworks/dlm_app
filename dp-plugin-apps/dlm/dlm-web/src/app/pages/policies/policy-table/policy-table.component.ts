import { Component, OnInit, Input, ViewChild, ViewEncapsulation, TemplateRef } from '@angular/core';
import { Policy } from 'models/policy.model';
import { ActionItemType } from 'components';
import { TableTheme } from 'common/table/table-theme.type';
import { StatusColumnComponent } from 'components/table-columns/status-column/status-column.component';
import { FlowStatusComponent } from './flow-status/flow-status.component';
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

@Component({
  selector: 'dp-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./policy-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyTableComponent implements OnInit {
  columns: any[];
  tableTheme = TableTheme.Cards;
  jobs$: Observable<Job[]>;
  filteredJobs: Job[] = [];
  selectedPolicy: Policy;

  @ViewChild(IconColumnComponent) iconColumn: IconColumnComponent;
  @ViewChild(StatusColumnComponent) statusColumn: StatusColumnComponent;
  @ViewChild(PolicyInfoComponent) policyInfoColumn: PolicyInfoComponent;
  @ViewChild(FlowStatusComponent) flowStatusColumn: FlowStatusComponent;
  @ViewChild('durationCell') durationCellRef: TemplateRef<any>;
  @ViewChild('lastGoodCell') lastGoodCellRef: TemplateRef<any>;
  @ViewChild('dataCell') dataCellRef: TemplateRef<any>;
  @ViewChild('expandActionCell') expandActionCellRef: TemplateRef<any>;
  @ViewChild('scheduleCellTemplate') scheduleCellTemplateRef: TemplateRef<any>;
  @ViewChild('rowDetail') rowDetailRef: TemplateRef<any>;
  @ViewChild('iconCellTemplate') iconCellTemplate: TemplateRef<any>;

  @ViewChild(TableComponent) tableComponent: TableComponent;

  @Input() policies: Policy[] = [];

  // todo: labels and actions are subject to change
  rowActions = <ActionItemType[]>[
    {label: 'Remove', name: 'REMOVE'},
    {label: 'Rerun', name: 'RERUN'}
  ];

  constructor(private t: TranslateService, private store: Store<fromRoot.State>) {
    this.jobs$ = this.store.select(getAllJobs);
    this.jobs$.subscribe(jobs => {
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
      {cellTemplate: this.iconCellTemplate, maxWidth: 25, minWidth: 25},
      {prop: 'targetCluster', name: this.t.instant('common.destination')},
      {prop: 'lastJobResource.path', name: this.t.instant('common.path')},
      {prop: 'frequency', name: this.t.instant('common.schedule'), cellTemplate: this.scheduleCellTemplateRef},
      {prop: 'lastJobResource.duration', name: this.t.instant('common.duration'), cellTemplate: this.durationCellRef},
      {prop: 'lastJobResource.startTime', name: 'Last Good', cellTemplate: this.lastGoodCellRef},
      {
        prop: 'targetClusterResource.stats.CapacityUsed',
        name: this.t.instant('common.data'),
        cellTemplate: this.dataCellRef
      },
      {name: ' ', sortable: false, cellTemplate: this.expandActionCellRef}
    ];
  }

  handleSelectedAction({row, action}) {
  }

  toggleRowDetail(policy) {
    this.selectedPolicy = policy;
    this.store.dispatch(loadJobsForPolicy(policy));
    this.tableComponent.toggleRowDetail(policy);
  }
}
