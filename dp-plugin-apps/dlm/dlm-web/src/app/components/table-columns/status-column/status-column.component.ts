/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, ViewChild, TemplateRef, Input } from '@angular/core';
import { RUNNING, SUSPENDED } from 'constants/status.constant';

import { TableColumn } from 'common/table/table-column.type';

export const COLUMN_WIDTH = 100;

@Component({
  selector: 'dlm-policy-status-column',
  template: `
    <ng-template #statusCell let-value="value">
      <span [class]="getStatusClassNames(value)"></span>
      <span *ngIf="showText">{{value}}</span>
    </ng-template>
  `,
  styleUrls: ['./status-column.component.scss']
})
export class StatusColumnComponent implements TableColumn {
  @Input()
  showText = true;
  @ViewChild('statusCell') cellRef: TemplateRef<any>;
  cellSettings = {
    maxWidth: COLUMN_WIDTH,
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH
  };
  // todo: move statuses to constant enum? when all possible values will be known
  statusClassMap = {
    [RUNNING]: 'status status-running fa fa-play-circle-o',
    [SUSPENDED]: 'status status-suspended fa fa-pause-circle-o'
  };

  getStatusClassNames(status: string) {
    return this.statusClassMap[status] || '';
  }
}
