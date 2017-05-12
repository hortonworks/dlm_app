import {
  Component, Input, Output, ViewEncapsulation, ViewChild, TemplateRef, EventEmitter, HostBinding,
  OnChanges, OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { NavbarService } from 'services/navbar.service';
import {ColumnMode, DatatableComponent, DatatableRowDetailDirective} from '@swimlane/ngx-datatable';
import {CheckboxColumnComponent} from 'components/table-columns/checkbox-column/checkbox-column.component';
import {ActionColumnType, ActionItemType, ActionColumnComponent} from 'components/';
import {TableTheme, TableThemeSettings} from './table-theme.type';

export const SELECTED_KEY_NAME = '__selected';

@Component({
  selector: 'dlm-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent implements OnChanges, OnDestroy {
  private _columns: any[];
  private _rows: any[];
  private _headerHeight: string|number;
  private _rowHeight: string|number;
  private _footerHeight: string|number;
  private navbarCollapse$: Observable<boolean>;
  private navbarCollapseSubscription: Subscription;

  actions: ActionItemType[];
  @ViewChild(CheckboxColumnComponent) checkboxColumn: CheckboxColumnComponent;
  @ViewChild(ActionColumnComponent) actionsColumn: ActionColumnComponent;
  @ViewChild('table') table: DatatableComponent;
  @ViewChild('detailRow') detailRow: TemplateRef<any>;

  @Output() selectAction = new EventEmitter<ActionItemType>();

  @Input() rowDetailHeight = 200;
  /**
   * Table theme one of 'plain', 'cards'. 'plain' by default
   * @type {string}
   */
  @Input() theme = TableTheme.Plain;
  @Input() columnMode = ColumnMode.force;
  @Input() selectionType: any;
  @Input() cssClasses = {
    sortAscending: 'caret',
    sortDescending: 'caret caret-up',
    pagerLeftArrow: 'fa fa-chevron-left',
    pagerRightArrow: 'fa fa-chevron-right',
  };
  // hacky but seems like there is no other easy solution to set template for Row Detail
  @Input() set rowDetailTemplate(template: TemplateRef<any>) {
    if (template) {
      this.table.rowDetail.template = template;
    }
  };

  @Input() set headerHeight(value: string|number) {
    this._headerHeight = value;
  }

  get headerHeight(): string|number {
    return this._headerHeight || TableThemeSettings[this.theme].headerHeight;
  }

  @Input() set rowHeight(value: string|number) {
    this._rowHeight = value;
  }

  get rowHeight(): string|number {
    return this._rowHeight || TableThemeSettings[this.theme].rowHeight;
  }

  @Input() set footerHeight(value: string|number) {
    this._footerHeight = value;
  }

  get footerHeight(): string|number {
    return this._footerHeight || TableThemeSettings[this.theme].footerHeight;
  }

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

  @HostBinding('class') get className() { return TableThemeSettings[this.theme].className; };

  get rows(): any[] {
    return this._rows;
  }

  limit = 10;

  constructor(private navbar: NavbarService) {
    this.navbarCollapse$ = this.navbar.isCollapsed;
    this.navbarCollapseSubscription = this.navbarCollapse$
      .debounceTime(500)
      .subscribe(() => this.table.recalculate());
  }

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

  toggleRowDetail(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  ngOnChanges(changes) {
    if (changes.rows) {
      const {firstChange, currentValue, previousValue} = changes.rows;
      if (!firstChange && currentValue && previousValue && currentValue.length < previousValue.length) {
        this.table.offset = 0;
      }
    }
  }

  ngOnDestroy() {
    this.navbarCollapseSubscription.unsubscribe();
  }
}
