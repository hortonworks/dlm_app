import { Component, Output, Input, TemplateRef, ViewChild, EventEmitter } from '@angular/core';

@Component({
  selector: 'dlm-checkbox-column',
  template: `
  <ng-template #checkboxHeader let-column="column">
    <dlm-checkbox
      [ngModel]="allSelected"
      (onSelect)="handleSelectAll()">
    </dlm-checkbox>
  </ng-template>
  <ng-template #checkboxCell let-row="row" let-value="value" let-column="column">
    <dlm-checkbox
      [ngModel]="value"
      (onSelect)="handleSelect(row, column, value)">
    </dlm-checkbox>
  </ng-template>
  `,
  styleUrls: ['./checkbox-column.component.scss']
})
export class CheckboxColumnComponent {
  @Input() allSelected = false;
  @Output() selectCell = new EventEmitter<any>();
  @Output() selectHeader = new EventEmitter<boolean>();
  @ViewChild('checkboxCell') cellRef: TemplateRef<any>;
  @ViewChild('checkboxHeader') headerRef: TemplateRef<any>;

  handleSelect(row, column, checked) {
    this.selectCell.emit({ row, column, checked });
  }

  handleSelectAll() {
    this.allSelected = !this.allSelected;
    this.selectHeader.emit(this.allSelected);
  }
}
