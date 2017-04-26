import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { Policy } from '../../../models/policy.model';
import { ActionItemType, ActionColumnType } from '../../../components';

@Component({
  selector: 'dp-policy-table',
  template: `
    <dlm-table
      [columns]="columns"
      [rows]="policies"
      (selectAction)="handleSelectedAction($event)"
      selectionType="checkbox">
    </dlm-table>
  `,
  styleUrls: ['./policy-table.component.scss']
})
export class PolicyTableComponent implements OnInit {
  columns: any[];
  @Input() policies: Policy[];
  // todo: labels and actions are subject to change
  rowActions = <ActionItemType[]>[
    { label: 'Remove', name: 'REMOVE'},
    { label: 'Rerun', name: 'RERUN'}
  ];

  ngOnInit() {
    this.columns = [
      {prop: 'status'},
      {prop: 'name'},
      {prop: 'sourceclusters', name: 'Source'},
      {prop: 'targetclusters', name: 'Destination'},
      {prop: 'type'},
      {prop: 'startTime'},
      {prop: 'endTime'},
      <ActionColumnType>{
        name: 'Actions',
        actionable: true,
        actions: this.rowActions
      }
    ];
  }

  handleSelectedAction({ row, action}) { }
}
