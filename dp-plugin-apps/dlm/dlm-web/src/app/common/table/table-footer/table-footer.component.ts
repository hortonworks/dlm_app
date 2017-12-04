/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {DropdownItem} from 'components/dropdown/dropdown-item';
import { TableFooterOptions } from './table-footer.type';

@Component({
  selector: 'dlm-table-footer',
  templateUrl: './table-footer.component.html',
  styleUrls: ['./table-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFooterComponent {

  @Input() filteredRowsCount: number;
  @Input() rowsCount: number;
  @Input() pageSize: number;
  @Input() selectedCount: number;
  @Input() curPage: number;
  @Input() offset: number;
  @Input() limits: number[] = [10, 25, 50];
  @Input() showExtraNav = false;
  @Input() options: TableFooterOptions;
  @Output() changePageSize: EventEmitter<any> = new EventEmitter();
  @Output() changePage: EventEmitter<any> = new EventEmitter();

  get pageSizeOptions(): DropdownItem[] {
    return this.limits.map(limit => (<DropdownItem>{label: '' + limit, value: limit}));
  };

  get summary(): string {
    return this.translate.instant('common.table.summary', {shown: this.filteredRowsCount, count: this.rowsCount});
  };

  get pagesCount(): number {
    const pagesCount = this.filteredRowsCount / this.pageSize;
    return (0 === pagesCount % 1) ? pagesCount : (Math.floor(pagesCount) + 1);
  }

  get paging(): string {
    const start = this.filteredRowsCount ? this.offset * this.pageSize + 1 : 0;
    let end = start - 1 + this.pageSize;
    end = Math.min(end, this.filteredRowsCount);
    return this.translate.instant('common.table.paging', {start, end, count: this.filteredRowsCount});
  }

  get nextDisabled(): boolean {
    return this.curPage >= this.pagesCount;
  }

  get prevDisabled(): boolean {
    return this.curPage === 1;
  }

  constructor(private translate: TranslateService) {
  }

  get pageButtons(): number[] {
    if (!this.showExtraNav) {
      return [];
    }
    const current = this.curPage;
    const all = this.pagesCount;
    const numbers = [];
    for (let i = Math.max(1, current - 5); i < current; i++) {
      numbers.push(i);
    }
    numbers.push(current);
    for (let i = current + 1; i < Math.min(current + 5, all); i++) {
      numbers.push(i);
    }
    return numbers;
  }

  handleChangeLimit({value}) {
    this.changePageSize.emit(value);
    this.goToPage(1);
  }

  handleGoToNext() {
    this.goToPage(this.curPage + 1);
  }

  handleGoToPrev() {
    this.goToPage(this.curPage - 1);
  }

  handleGoToFirst() {
    this.goToPage(1);
  }

  handleGoToLast() {
    this.goToPage(this.pagesCount);
  }

  goToPage(pageNumber) {
    this.changePage.emit(pageNumber);
  }

}
