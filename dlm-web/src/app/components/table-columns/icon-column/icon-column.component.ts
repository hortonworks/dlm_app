/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
