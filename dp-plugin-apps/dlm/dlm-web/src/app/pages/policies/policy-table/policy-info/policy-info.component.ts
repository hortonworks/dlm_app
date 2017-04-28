import { Component, Output, ViewChild, TemplateRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { TableColumn } from 'common/table/table-column.type';

// todo: row.startTime is actually incorrect need to get schedule interval here
@Component({
  selector: 'dlm-policy-info',
  template: `
    <ng-template #policyInfoCell let-row="row">
      <div class="policy-info">
        <p class="policy-name text-primary actionable" (click)="onNameClick(row)">{{row.name}}</p>
        <p class="text-muted">{{row.startTime | date}}</p>
      </div>
    </ng-template>
  `,
  styleUrls: ['./policy-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyInfoComponent implements TableColumn {
  @ViewChild('policyInfoCell') cellRef: TemplateRef<any>;
  @Output() nameClick = new EventEmitter<any>();

  onNameClick(row) {
    this.nameClick.emit(row);
  }
}
