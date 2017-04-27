import { Component, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { TableColumn } from 'common/table/table-column.type';

export const HIVE = 'HIVE';
export const HDFS = 'HDFS';
export const ICON_SIZE = 24;

@Component({
  selector: 'dlm-icon-column',
  template: `
    <ng-template #iconCell let-value="value">
      <div class="icon-column">
        <div class="icon-column-wrapper">
          <div [class]="getHexClassName(value)">
            <i [class]="getIconClassName(value)"></i>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./icon-column.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IconColumnComponent implements TableColumn {
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

  getHexClassName(sourceType) {
    const hexagonSourceMap = {
      [HIVE]: 'hexagon-success',
      [HDFS]: 'hexagon-warning'
    };
    return `hexagon ${hexagonSourceMap[sourceType]}`;
  }
}
