/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, ViewChild, TemplateRef, ViewEncapsulation, Input } from '@angular/core';
import { TableColumn } from 'common/table/table-column.type';

export const HIVE = 'HIVE';
export const HDFS = 'HDFS';
export const FS = 'FS';
export const FS_SNAPSHOT = 'FS_SNAPSHOT';
export const ICON_SIZE = 24;

@Component({
  selector: 'dlm-icon-column',
  template: `
    <ng-template #iconCell let-value="value">
      <div class="icon-column" [class.shifted]="showHexagon">
        <div class="icon-column-wrapper">
          <div *ngIf="showHexagon" [class]="getHexClassName(value)">
            <i [class]="getIconClassName(value)"></i>
          </div>
          <i *ngIf="!showHexagon" [class]="getIconClasses(value)"></i> <span *ngIf="showValue">{{value}}</span>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./icon-column.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IconColumnComponent implements TableColumn {
  @Input() showHexagon = true;
  @Input() showValue = false;
  @ViewChild('iconCell') cellRef: TemplateRef<any>;
  cellSettings = {
    width: ICON_SIZE,
    minWidth: ICON_SIZE,
    maxWidth: ICON_SIZE,
    name: ' ',
    sortable: false,
    cellClass: 'icon-cell'
  };

  getIconClassName(sourceType) {
    const iconSourceMap = {
      [HIVE]: 'fa fa-database',
      [HDFS]: 'fa fa-file-o',
      [FS_SNAPSHOT]: 'fa fa-file-o',
      [FS]: 'fa fa-file-o'
    };
    return iconSourceMap[sourceType];
  }

  getIconClasses(sourceType) {
    return `${this.getTextClassName(sourceType)} ${this.getIconClassName(sourceType)}`;
  }

  getTextClassName(sourceType) {
    const map = {
      [HIVE]: 'text-success',
      [FS_SNAPSHOT]: 'text-warning',
      [HDFS]: 'text-warning',
      [FS]: 'text-warning'
    };
    return map[sourceType];
  }

  getHexClassName(sourceType) {
    const hexagonSourceMap = {
      [HIVE]: 'hexagon-success',
      [HDFS]: 'hexagon-warning',
      [FS_SNAPSHOT]: 'hexagon-warning',
      [FS]: 'hexagon-warning'
    };
    return `hexagon ${hexagonSourceMap[sourceType]}`;
  }
}
