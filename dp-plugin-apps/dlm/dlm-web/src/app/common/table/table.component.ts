/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
    AfterViewChecked,
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { NavbarService } from 'services/navbar.service';
import { ColumnMode, DatatableComponent, DatatableRowDetailDirective } from '@swimlane/ngx-datatable';
import { CheckboxColumnComponent } from 'components/table-columns/checkbox-column/checkbox-column.component';
import { ActionColumnType, ActionItemType, ActionColumnComponent } from 'components/';
import { TableTheme, TableThemeSettings } from './table-theme.type';
import { TableFooterOptions } from 'common/table/table-footer/table-footer.type';

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
  private footerOptsDefault = {
    showPageSizeMenu: true,
    showFilterSummary: false,
    pagerDropup: false
  } as TableFooterOptions;
  private footerOpts: TableFooterOptions = this.footerOptsDefault;

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
  @Output() pageChange = new EventEmitter<{}>();

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
  @Input() externalPaging = false;
  @Input() scrollbarV = false;
  @Input() scrollbarH = false;
  @Input() reorderable = true;
  @Input() count = 0;

  /**
   * Rows count before any filter is applied
   * Used for `table-footer.summary`
   *
   * @type {number}
   */
  @Input() rowsCount = 0;
  @Input() cssClasses = {
    sortAscending: 'caret',
    sortDescending: 'caret caret-up',
    pagerLeftArrow: 'fa fa-chevron-left',
    pagerRightArrow: 'fa fa-chevron-right',
  };
  @Input() sorts = [];
  @Input() offset = 0;
  @Input('footerOptions')

  set footerOptions(options: TableFooterOptions) {
    this.footerOpts = {
      ...this.footerOptsDefault,
      ...options
    };
  }

  get footerOptions(): TableFooterOptions {
    return this.footerOpts;
  }

  @Input()
  rowDetailTemplate: TemplateRef<any>;

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

  @Input() selectCheck = () => true;

  @HostBinding('class') get className() {
    return TableThemeSettings[this.theme].className;
  }

  @HostListener('window:resize') onWindowResize() {
    this.recalculateTable();
  }

  get rows(): any[] {
    return this._rows;
  }

  constructor(private navbar: NavbarService,
              private cdRef: ChangeDetectorRef,
              private elementRef: ElementRef) {
    this.navbarCollapse$ = this.navbar.isCollapsed;
    this.navbarCollapseSubscription = this.navbarCollapse$
      .debounceTime(500)
      .subscribe(() => {
        this.recalculateTable();
        this.cdRef.detectChanges();
      });
  }

  /**
   * This is the really bad but the only way to change default progress indicator
   * ngx-datatable doesn't support custom progress indicator template
   *
   * @param show
   */
  private toggleLoadingSpinner(show: boolean): void {
    const spinnerClass = 'fa fa-spin fa-spinner';
    const progressSelector = 'datatable-progress .container div:eq(0)';
    setTimeout(() => {
      const selfEl = this.elementRef.nativeElement;
      if (selfEl) {
        $(selfEl).find(progressSelector).removeClass().addClass(show ? spinnerClass : '');
      }
    }, 200);
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
    this.recalculateTable();
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

  onPage(page) {
    this.pageChange.emit(page);
  }

  /**
   * Expand or collapse selected row
   * If `multiExpand` is false, previously expanded row will be collapsed
   */
  toggleRowDetail(row) {
    if (!this.multiExpand && !this.isRowExpanded(row)) {
      this.table.rowDetail.collapseAllRows();
    }
    this.table.rowDetail.toggleExpandRow(row);
  }

  ngOnChanges(changes) {
    if (changes.rows) {
      const { firstChange, currentValue, previousValue } = changes.rows;
      if (!firstChange && currentValue && previousValue && currentValue.length < previousValue.length) {
        this.table.offset = 0;
      }
    }
    if (changes.loadingIndicator) {
      const loadingIndicator = changes.loadingIndicator.currentValue;
      this.toggleLoadingSpinner(loadingIndicator);
    }
  }

  recalculateTable() {
    this.table.recalculate();
  }

  ngAfterViewInit() {
    // this will avoid issue on initial calculation when parent for this component is not properly rendered
    this.recalculateTable();
    this.cdRef.detectChanges();
  }

  ngAfterViewChecked() {
    // Check if the table size has changed,
    if (this.table && this.table.recalculate && (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth)) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      this.recalculateTable();
      this.cdRef.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.navbarCollapseSubscription) {
      this.navbarCollapseSubscription.unsubscribe();
    }
  }

  isRowExpanded(row): boolean {
    return this.table.bodyComponent.getRowExpanded(row);
  }

}
