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
  @Input() options: TableFooterOptions;
  @Input() dropdownContainer = '';
  @Output() changePageSize: EventEmitter<any> = new EventEmitter();
  @Output() changePage: EventEmitter<any> = new EventEmitter();

  get pageSizeOptions(): DropdownItem[] {
    return this.limits.map(limit => (<DropdownItem>{label: '' + limit, value: limit}));
  }

  get summary(): string {
    return this.translate.instant('common.table.summary', {shown: this.filteredRowsCount, count: this.rowsCount});
  }

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

  handleChangeLimit({value}) {
    this.changePageSize.emit(value);
    this.changePage.emit(1);
  }

  handleGoToNext() {
    this.changePage.emit(this.curPage + 1);
  }

  handleGoToPrev() {
    this.changePage.emit(this.curPage - 1);
  }

}
