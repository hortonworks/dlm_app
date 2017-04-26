import {Component, Input, Output, ViewEncapsulation, ViewChild, TemplateRef, EventEmitter} from '@angular/core';
import {ColumnMode, DatatableComponent} from '@swimlane/ngx-datatable';
import {CheckboxColumnComponent} from '../../components/table-columns/checkbox-column/checkbox-column.component';
import {ActionColumnType, ActionItemType, ActionColumnComponent} from '../../components';

export const TABLE_ROW_HEIGHT = 36;
export const SELECTED_KEY_NAME = '__selected';

@Component({
  selector: 'dlm-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent {
  private _columns: any[];
  private _rows: any[];

  actions: ActionItemType[];
  @ViewChild(CheckboxColumnComponent) checkboxColumn: CheckboxColumnComponent;
  @ViewChild(ActionColumnComponent) actionsColumn: ActionColumnComponent;
  @ViewChild('table') table: DatatableComponent;

  @Output() selectAction = new EventEmitter<ActionItemType>();

  @Input() headerHeight = TABLE_ROW_HEIGHT;
  @Input() footerHeight = TABLE_ROW_HEIGHT;
  @Input() rowHeight = TABLE_ROW_HEIGHT;
  @Input() columnMode = ColumnMode.force;
  @Input() selectionType: any;
  @Input() cssClasses = {
    sortAscending: 'caret',
    sortDescending: 'caret caret-up',
    pagerLeftArrow: 'fa fa-chevron-left',
    pagerRightArrow: 'fa fa-chevron-right',
  };

  @Input() set columns(val: any[]) {
    if (!val) {
      return;
    }
    const actionableColumn = val.find((column: any): column is ActionColumnType => column.actionable);
    if (actionableColumn) {
      this.actions = actionableColumn.actions;
      actionableColumn.cellTemplate = this.actionsColumn.cellRef;
      actionableColumn.sortable = false;
    }
    if (this.selectionType === 'checkbox') {
      this._columns = val.concat({
        sortable: false,
        prop: SELECTED_KEY_NAME,
        cellTemplate: this.checkboxColumn.cellRef,
        headerTemplate: this.checkboxColumn.headerRef,
      });
    } else {
      this._columns = val;
    }
  }

  get columns(): any[] {
    return this._columns;
  }

  @Input() set rows(val: any[]) {
    if (!val) {
      return;
    }
    if (this.selectionType === 'checkbox') {
      this._rows = val.map(row => Object.assign({}, row, {[SELECTED_KEY_NAME]: false}));
    } else {
      this._rows = val;
    }
  }

  get rows(): any[] {
    return this._rows;
  }

  limit = 10;

  handleSelectedCell({row, column, checked}) {
    row[SELECTED_KEY_NAME] = !checked;
  }

  handleAllChecked(checked) {
    this._rows = this._rows.map(row => Object.assign({}, row, {[SELECTED_KEY_NAME]: checked}));
  }

  changePageSize(newLimit) {
    /* TODO currently ngx-datatable doesn't supports bound `limit` changes.
     * TODO Replace this code after ngx-datatable is updated with dynamic page size selection
     */
    this.table.limit = newLimit;
    this.table.recalculate();
  }

  changePage(page) {
    this.table.onFooterPage({page});
  }
}
