import {Component, OnInit, Input, ViewChild, TemplateRef} from '@angular/core';
import {Job} from '../../../models/job.model';
import {ActionItemType, ActionColumnType} from '../../../components';

@Component({
  selector: 'dp-jobs-table',
  templateUrl: './jobs-table.component.html',
  styleUrls: ['./jobs-table.component.scss']
})
export class JobsTableComponent implements OnInit {
  columns: any[];
  @ViewChild('statusCellTemplate') statusCellTemplate: TemplateRef<any>;
  @ViewChild('iconCellTemplate') iconCellTemplate: TemplateRef<any>;
  @ViewChild('prevRunsTemplate') prevRunsTemplate: TemplateRef<any>;
  @ViewChild('agoTemplate') agoTemplate: TemplateRef<any>;
  @ViewChild('nextRunTemplate') nextRunTemplate: TemplateRef<any>;
  @ViewChild('runTimeTemplate') runTimeTemplate: TemplateRef<any>;
  @ViewChild('transferredTemplate') transferredTemplate: TemplateRef<any>;
  @ViewChild('transferredFormattedTemplate') transferredFormattedTemplate: TemplateRef<any>;
  @Input() jobs: Job[];

  // todo: labels and actions are subject to change
  rowActions = <ActionItemType[]>[
    {label: 'Remove', name: 'REMOVE'},
    {label: 'Rerun', name: 'RERUN'}
  ];

  ngOnInit() {
    this.columns = [
      {cellTemplate: this.statusCellTemplate, maxWidth: 25, minWidth: 25},
      {prop: 'status'},
      {prop: 'source', name: 'Source Cluster'},
      {cellTemplate: this.iconCellTemplate, maxWidth: 25, minWidth: 25},
      {prop: 'target', name: 'Destination'},
      {prop: 'service'},
      {prop: 'policy'},
      {prop: 'startTime', cellTemplate: this.agoTemplate, name: 'Latest Run'},
      {cellTemplate: this.prevRunsTemplate, name: 'Previous Runs', sortable: false},
      {prop: 'runTime', cellTemplate: this.runTimeTemplate, name: 'Run Time'},
      {prop: 'transferred', cellTemplate: this.transferredTemplate, name: 'Transferred'},
      {prop: 'transferred', cellTemplate: this.transferredFormattedTemplate, name: '&nbsp;'},
      {prop: 'endTime', cellTemplate: this.agoTemplate, name: 'Ended'},
      {prop: 'nextRun', cellTemplate: this.nextRunTemplate, name: 'Next Run'},
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
