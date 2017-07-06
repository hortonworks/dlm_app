import {
  Component, Input, Output, ViewEncapsulation, ViewChild, TemplateRef, EventEmitter, HostBinding,
  OnChanges, OnDestroy, AfterViewInit, HostListener, ChangeDetectorRef, AfterViewChecked
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { NavbarService } from 'services/navbar.service';
import { ColumnMode, DatatableComponent, DatatableRowDetailDirective } from '@swimlane/ngx-datatable';
import { CheckboxColumnComponent } from 'components/table-columns/checkbox-column/checkbox-column.component';
import { ActionColumnType, ActionItemType, ActionColumnComponent } from 'components/';
import { TableTheme, TableThemeSettings } from './table-theme.type';

export const SELECTED_KEY_NAME = '__selected';

@Component({
  selector: 'dlm-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent implements OnChanges, AfterViewChecked, OnDestroy, AfterViewInit {
  private _columns: any[];
  private _rows: any[];
  private _headerHeight: string | number;
  private _rowHeight: string | number;
  private _footerHeight: string | number;
  private navbarCollapse$: Observable<boolean>;
  private navbarCollapseSubscription: Subscription;
  private currentComponentWidth;

  /**
   * Map for expanded rows
   * Keys - model's ids
   * Values - true for expanded, false for collapsed
   *
   * This map is need because ngx-datatable stores info about expanded rows in the rows itself (`$$expanded`-property)
   * After table data is updated from store all `$$expanded` markers are removed and rows becomes collapsed
   */
  expandedRows = {};

  actions: ActionItemType[];
  limit = 10;

  @ViewChild(CheckboxColumnComponent) checkboxColumn: CheckboxColumnComponent;
  @ViewChild(ActionColumnComponent) actionsColumn: ActionColumnComponent;
  @ViewChild('tableWrapper') tableWrapper;
  @ViewChild('table') table: DatatableComponent;

  @Output() selectColumnAction = new EventEmitter<{}>();
  @Output() selectRowAction = new EventEmitter<{}>();
  @Output() doubleClickAction = new EventEmitter<{}>();
  @Output() sortAction = new EventEmitter<{}>();

  @Input() showPageSizeMenu = true;
  @Input() multiExpand = false;
  @Input() rowDetailHeight = 200;
  /**
   * Table theme one of 'plain', 'cards'. 'plain' by default
   * @type {string}
   */
  @Input() theme = TableTheme.Plain;
  @Input() columnMode = ColumnMode.force;
  @Input() selectionType: any;
  @Input() loadingIndicator = true;
  @Input() externalSorting = false;
  @Input() scrollbarV = false;
  @Input() scrollbarH = false;
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

  @Input() trackByProp = 'id';

  static makeFixedWith(size: number) {
    return { width: size, maxWidth: size, minWidth: size};
  }

  @Input() set headerHeight(value: string | number) {
    this._headerHeight = value;
  }

  get headerHeight(): string | number {
    return this._headerHeight || TableThemeSettings[this.theme].headerHeight;
  }

  @Input() set rowHeight(value: string | number) {
    this._rowHeight = value;
  }

  get rowHeight(): string | number {
    return this._rowHeight || TableThemeSettings[this.theme].rowHeight;
  }

  @Input() set footerHeight(value: string | number) {
    this._footerHeight = value;
  }

  get footerHeight(): string | number {
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

  @HostBinding('class') get className() {
    return TableThemeSettings[this.theme].className;
  };

  @HostListener('window:resize') onWindowResize() {
    this.table.recalculate();
  }

  get rows(): any[] {
    return this._rows;
  }

  constructor(private navbar: NavbarService, private cdRef: ChangeDetectorRef) {
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

  onSelectAction({ selected }) {
    this.selectRowAction.emit(selected);
  }

  onActivate({type, row}) {
    if (type === 'dblclick') {
      this.doubleClickAction.emit(row);
    }
  }

  onSort(object) {
    this.sortAction.emit(object);
  }

  /**
   * Expand or collapse selected row
   * If `multiExpand` is false, previously expanded row will be collapsed
   */
  toggleRowDetail(row) {
    const expandedRows = Object.keys(this.expandedRows).filter(k => !!this.expandedRows[k]);
    if (!this.multiExpand && !this.expandedRows[row.id] && expandedRows.length) {
      this.table.rowDetail.collapseAllRows();
      this.expandedRows = {};
    }
    this.table.rowDetail.toggleExpandRow(row);
    this.expandedRows[row.id] = !this.expandedRows[row.id];
  }

  ngOnChanges(changes) {
    if (changes.rows) {
      const {firstChange, currentValue, previousValue} = changes.rows;
      if (!firstChange && currentValue && previousValue && currentValue.length < previousValue.length) {
        this.table.offset = 0;
      }
      // restore expanded rows after data update
      Object.keys(this.expandedRows).forEach(id => {
        if (this.expandedRows[id]) {
          const policy = this.rows.find(p => p.id === id);
          if (policy) {
            this.table.rowDetail.toggleExpandRow(policy);
          }
        }
      });
    }
  }

  ngAfterViewInit() {
    // this will avoid issue on initial calculation when parent for this component is not properly rendered
    this.table.recalculate();
  }

  ngAfterViewChecked() {
    // Check if the table size has changed,
    if (this.table && this.table.recalculate && (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth)) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      this.table.recalculate();
      this.cdRef.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.navbarCollapseSubscription) {
      this.navbarCollapseSubscription.unsubscribe();
    }
  }
}
