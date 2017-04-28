import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';

import { TableColumn } from 'common/table/table-column.type';

// todo: Active, Unavailable are mocks. Active state is also hardcoded
@Component({
  selector: 'dlm-flow-status',
  template: `
    <ng-template #flowStatusCell let-value="value">
      <div class="flow-status">
        <div class="flow-status-chart">
          <div class="flow-current-state active">S</div>
          <div class="flow-line"><span class="caret"></span></div>
          <div class="flow-desired-state">D</div>
        </div>
        <div class="flow-status-text">
          <div class="flow-current-state">Active</div>
          <div class="flow-desired-state">Unavailable</div>
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
