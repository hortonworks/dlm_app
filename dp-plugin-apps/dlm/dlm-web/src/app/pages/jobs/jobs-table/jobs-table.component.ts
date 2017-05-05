import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Job } from '../../../models/job.model';
import { ActionItemType, ActionColumnType } from '../../../components';
import { IconColumnComponent } from '../../../components/table-columns/icon-column/icon-column.component';
import { TableComponent } from '../../../common/table/table.component';

@Component({
  selector: 'dp-jobs-table',
  templateUrl: './jobs-table.component.html',
  styleUrls: ['./jobs-table.component.scss']
})
export class JobsTableComponent implements OnInit {
  columns: any[];
  @ViewChild('statusCellTemplate') statusCellTemplate: TemplateRef<any>;
  @ViewChild('iconCellTemplate') iconCellTemplate: TemplateRef<any>;
  @ViewChild('agoTemplate') agoTemplate: TemplateRef<any>;
  @ViewChild('nextRunTemplate') nextRunTemplate: TemplateRef<any>;
  @ViewChild('runTimeTemplate') runTimeTemplate: TemplateRef<any>;
  @ViewChild('transferredTemplate') transferredTemplate: TemplateRef<any>;
  @ViewChild('transferredFormattedTemplate') transferredFormattedTemplate: TemplateRef<any>;
  @ViewChild('serviceTemplate') serviceTemplate: TemplateRef<any>;
  @ViewChild(IconColumnComponent) iconColumn: IconColumnComponent;
  @ViewChild('jobsTable') jobsTable: TableComponent;
  @Input() jobs: Job[];

  // todo: labels and actions are subject to change
  rowActions = <ActionItemType[]>[
    {label: 'Remove', name: 'REMOVE'},
    {label: 'Rerun', name: 'RERUN'}
  ];

  ngOnInit() {
    this.columns = [
      {cellTemplate: this.statusCellTemplate, maxWidth: 25, minWidth: 25},
      {prop: 'status', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'source', name: 'Source', cellClass: 'text-cell', headerClass: 'text-header'},
      {cellTemplate: this.iconCellTemplate, maxWidth: 25, minWidth: 25},
      {prop: 'target', name: 'Destination', cellClass: 'text-cell', headerClass: 'text-header'},
      {
        ...this.iconColumn.cellSettings, width: 90, minWidth: 90, maxWidth: 90, prop: 'service',
        cellTemplate: this.iconColumn.cellRef, name: 'Service', cellClass: 'text-cell', headerClass: 'text-header'
      },
      {prop: 'path', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'policy', cellClass: 'text-cell', headerClass: 'text-header', minWidth: 120},
      {
        prop: 'startTime',
        cellTemplate: this.agoTemplate,
        name: 'Started',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'endTime',
        cellTemplate: this.agoTemplate,
        name: 'Ended',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'runTime',
        cellTemplate: this.runTimeTemplate,
        name: 'Runtime',
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

  handleSelectedAction({row, action}) {
  }
}
