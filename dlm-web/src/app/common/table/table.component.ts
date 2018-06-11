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
import { genId } from 'utils/string-utils';

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
  @Input() limit = 10;

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
  @Input() showFooter = true;
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
   * `body` or ``
   * @type {string}
   */
  @Input() footerDropdownContainer = '';

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

  static makeFixedWidth(size: number) {
    return { width: size, maxWidth: size, minWidth: size};
  }

  static paddingColumn(padding: number) {
    return {
      prop: '_',
      name: ' ',
      ...TableComponent.makeFixedWidth(padding)
    };
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
    if (!this.showFooter) {
      return 0;
    }
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
  @Input() rowClass = _ => '';

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
    if (changes.loadingIndicator) {
      const loadingIndicator = changes.loadingIndicator.currentValue;
      this.toggleLoadingSpinner(loadingIndicator);
    }
  }

  recalculateTable() {
    // this will call change detection checker inside of ngx-datatable component
    // and trigger resize. Add random attribute here because it's cheaper than deep copy
    if (this.rows) {
      this.rows = [...this.rows.map(i => ({...i, __tmpCache: genId()}))];
      this.table.recalculate();
    }
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
