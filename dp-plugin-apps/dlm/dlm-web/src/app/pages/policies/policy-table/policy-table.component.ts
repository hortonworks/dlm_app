import { Component, OnInit, Input, ViewChild, AfterViewInit, ViewEncapsulation, TemplateRef, ContentChild } from '@angular/core';
import { Policy } from '../../../models/policy.model';
import { ActionItemType, ActionColumnType } from '../../../components';
import { TableTheme } from 'common/table/table-theme.type';
import { StatusColumnComponent } from 'components/table-columns/status-column/status-column.component';
import { FlowStatusComponent } from './flow-status/flow-status.component';
import { PolicyInfoComponent } from './policy-info/policy-info.component';
import { IconColumnComponent } from 'components/table-columns/icon-column/icon-column.component';
import { TranslateService } from '@ngx-translate/core';
import { DatatableRowDetailDirective } from '@swimlane/ngx-datatable';
import { TableComponent } from 'common/table/table.component';

@Component({
  selector: 'dp-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./policy-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyTableComponent implements OnInit {
  columns: any[];
  tableTheme = TableTheme.Cards;

  @ViewChild(IconColumnComponent) iconColumn: IconColumnComponent;
  @ViewChild(StatusColumnComponent) statusColumn: StatusColumnComponent;
  @ViewChild(PolicyInfoComponent) policyInfoColumn: PolicyInfoComponent;
  @ViewChild(FlowStatusComponent) flowStatusColumn: FlowStatusComponent;
  @ViewChild('durationCell') durationCellRef: TemplateRef<any>;
  @ViewChild('lastGoodCell') lastGoodCellRef: TemplateRef<any>;
  @ViewChild('dataCell') dataCellRef: TemplateRef<any>;
  @ViewChild('expandActionCell') expandActionCellRef: TemplateRef<any>;
  @ViewChild('rowDetail') rowDetailRef: TemplateRef<any>;

  @ViewChild(TableComponent) tableComponent: TableComponent;

  @Input() policies: Policy[];

  // todo: labels and actions are subject to change
  rowActions = <ActionItemType[]>[
    { label: 'Remove', name: 'REMOVE'},
    { label: 'Rerun', name: 'RERUN'}
  ];

  constructor(private t: TranslateService) {}

  ngOnInit() {
    this.columns = [
      {...this.iconColumn.cellSettings, prop: 'type', cellTemplate: this.iconColumn.cellRef},
      {...this.statusColumn.cellSettings, prop: 'status', cellTemplate: this.statusColumn.cellRef},
      {name: ' ', cellTemplate: this.policyInfoColumn.cellRef, sortable: false},
      {prop: 'sourceclusters', name: this.t.instant('common.source')},
      {
        prop: 'status',
        name: ' ',
        cellTemplate: this.flowStatusColumn.cellRef,
        minWidth: 200,
        cellClass: 'flow-status-cell',
        sortable: false
      },
      {prop: 'targetclusters', name: this.t.instant('common.destination')},
      {prop: 'lastJobResource.duration', name: this.t.instant('common.duration'), cellTemplate: this.durationCellRef},
      {prop: 'lastJobResource.startTime', name: 'Last Good', cellTemplate: this.lastGoodCellRef},
      {prop: 'targetClusterResource.volumeGB', name: this.t.instant('common.data'), cellTemplate: this.dataCellRef},
      {name: ' ', sortable: false, cellTemplate: this.expandActionCellRef}
    ];
  }

  handleSelectedAction({ row, action}) { }

  toggleRowDetail(row) {
    this.tableComponent.toggleRowDetail(row);
  }
}
