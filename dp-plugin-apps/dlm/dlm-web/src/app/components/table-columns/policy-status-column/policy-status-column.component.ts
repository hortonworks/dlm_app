/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, ViewChild, TemplateRef, Input } from '@angular/core';
import { POLICY_UI_STATUS } from 'constants/status.constant';

import { TableColumn } from 'common/table/table-column.type';

export const COLUMN_WIDTH = 100;

@Component({
  selector: 'dlm-policy-status-column',
  template: `
    <div>
      <span *ngIf="showText">{{status}}</span>
    </div>
  `,
  styleUrls: ['./policy-status-column.component.scss']
})
export class StatusColumnComponent implements TableColumn {
  @Input()
  showText = true;
  @Input() status: string;
  @ViewChild('statusCell') cellRef: TemplateRef<any>;
  cellSettings = {
    maxWidth: COLUMN_WIDTH,
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH
  };
  // todo: move statuses to constant enum? when all possible values will be known
  statusClassMap = {
    [POLICY_UI_STATUS.ACTIVE]: 'status status-running fa fa-play-circle-o',
    [POLICY_UI_STATUS.SUSPENDED]: 'status status-suspended fa fa-pause-circle-o',
    [POLICY_UI_STATUS.ENDED]: 'status status-ended fa fa-stop-circle'
  };

  getStatusClassNames(status: string) {
    return this.statusClassMap[status] || '';
  }
}
