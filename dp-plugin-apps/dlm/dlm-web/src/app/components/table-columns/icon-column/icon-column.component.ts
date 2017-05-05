import { Component, ViewChild, TemplateRef, ViewEncapsulation, Input } from '@angular/core';
import { TableColumn } from 'common/table/table-column.type';

export const HIVE = 'HIVE';
export const HDFS = 'HDFS';
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
      [HDFS]: 'fa fa-file-o'
    };
    return iconSourceMap[sourceType];
  }

  getIconClasses(sourceType) {
    return `${this.getTextClassName(sourceType)} ${this.getIconClassName(sourceType)}`;
  }

  getTextClassName(sourceType) {
    const map = {
      [HIVE]: 'text-success',
      [HDFS]: 'text-warning'
    };
    return map[sourceType];
  }

  getHexClassName(sourceType) {
    const hexagonSourceMap = {
      [HIVE]: 'hexagon-success',
      [HDFS]: 'hexagon-warning'
    };
    return `hexagon ${hexagonSourceMap[sourceType]}`;
  }
}
