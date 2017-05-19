import { Component, Input, Output, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { ActionItemType } from './action-item.type';
import { ActionColumnType } from './action-column.type';
import { TableColumn } from 'common/table/table-column.type';

@Component({
  selector: 'dlm-action-column',
  template: `
    <ng-template #actionCell let-row="row">
      <div class="table-actions">
        <dlm-dropdown [items]="actions" [alignRight]="true" (onSelectItem)="handleSelectedAction(row, $event)">
          <i class="fa fa-ellipsis-v text-primary"></i>
        </dlm-dropdown>
      </div>
    </ng-template>
  `,
  styleUrls: ['./action-column.component.scss']
})
export class ActionColumnComponent implements TableColumn {
  @Output() selectAction = new EventEmitter<any>();
  @ViewChild('actionCell') cellRef: TemplateRef<any>;
  @Input() actions: ActionItemType[];

  handleSelectedAction(row, action) {
    this.selectAction.emit({row, action});
  }
}
