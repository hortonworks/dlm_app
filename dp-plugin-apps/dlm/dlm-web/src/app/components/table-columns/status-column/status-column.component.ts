import { Component, ViewChild, TemplateRef } from '@angular/core';

import { TableColumn } from 'common/table/table-column.type';

export const COLUMN_WIDTH = 100;

@Component({
  selector: 'dlm-status-column',
  template: `
    <ng-template #statusCell let-value="value">
      <span [class]="getStatusClassNames(value)">{{value}}</span>
    </ng-template>
  `,
  styleUrls: ['./status-column.component.scss']
})
export class StatusColumnComponent implements TableColumn {
  @ViewChild('statusCell') cellRef: TemplateRef<any>;
  cellSettings = {
    maxWidth: COLUMN_WIDTH,
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH
  };
  // todo: move statuses to constant enum? when all possible values will be known
  statusClassMap = {
    RUNNING: 'status-running',
    SUBMITTED: 'status-submitted',
    FAILED: 'status-failed'
  };

  getStatusClassNames(status: string) {
    return this.statusClassMap[status] || '';
  }
}
