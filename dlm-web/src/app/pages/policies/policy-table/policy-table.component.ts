import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { Policy } from '../../../models/policy.model';

@Component({
  selector: 'dp-policy-table',
  templateUrl: './policy-table.component.html',
  styleUrls: ['./policy-table.component.scss']
})
export class PolicyTableComponent implements OnInit, AfterViewInit {
  columns: any[];

  // todo: DRY table component figure out how to extend it
  tableCssClasses = {
    sortAscending: 'caret',
    sortDescending: 'caret caret-up',
    pagerLeftArrow: 'fa fa-chevron-left',
    pagerRightArrow: 'fa fa-chevron-right',
  };

  @Input() policies: Policy[];

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.columns = [
      {prop: 'status'},
      {prop: 'name'},
      {prop: 'sourceclusters', name: 'Source'},
      {prop: 'targetclusters', name: 'Destination'},
      {prop: 'type'},
      {prop: 'startTime'},
      {prop: 'endTime'},
      {name: 'Actions'},
    ];
  }

}
