/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Output, Input, TemplateRef, ViewChild, EventEmitter } from '@angular/core';

import { TableHeader } from 'common/table/table-header.type';
import { TableColumn } from 'common/table/table-column.type';

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
export class CheckboxColumnComponent implements TableHeader, TableColumn {
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
