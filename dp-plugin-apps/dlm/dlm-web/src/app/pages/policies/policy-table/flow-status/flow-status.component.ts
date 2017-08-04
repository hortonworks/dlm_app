/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';

import { TableColumn } from 'common/table/table-column.type';

// todo: Active, Unavailable are mocks. Active state is also hardcoded
@Component({
  selector: 'dlm-flow-status',
  template: `
    <ng-template #flowStatusCell let-value="value">
      <div class="flow-status">
        <div class="flow-status-chart">
          <div class="flow-current-state active">&nbsp;</div>
          <div class="flow-line"><span class="caret"></span></div>
          <div class="flow-desired-state">&nbsp;</div>
        </div>
        <div class="flow-status-text">
          <div class="flow-current-state">Active</div>
          <div class="flow-desired-state">Standby</div>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./flow-status.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FlowStatusComponent implements TableColumn {
  @ViewChild('flowStatusCell') cellRef: TemplateRef<any>;
}
