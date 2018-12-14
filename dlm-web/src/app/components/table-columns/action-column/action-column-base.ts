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

import { EventEmitter, Output, HostListener, ElementRef, Input } from '@angular/core';
import { ActionItemType } from './action-item.type';
import { ActionColumnType } from './action-column.type';

export class ActionColumnBase<Row = any> implements ActionColumnType<Row> {
  @Input() actionable = true;
  @Input() actions: ActionItemType<Row>[];
  @Input() rowId: any;
  @Input() row: Row;
  @Input() isOpen = false;
  @Output() handler: EventEmitter<any> = new EventEmitter();
  @Output() openChange: EventEmitter<any> = new EventEmitter();

  @HostListener('document:click', ['$event'])
  outsideClickHandler(e) {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.isOpen = false;
      this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
    }
  }

  constructor(protected elementRef: ElementRef) { }

  protected actionDisabled(row: Row, action: ActionItemType<Row>): boolean {
    if (action.disableFn && typeof action.disableFn === 'function') {
      return action.disableFn(row, action);
    }
    return false;
  }

  protected actionHidden(row: Row, action: ActionItemType<Row>) {
    if (action.hiddenFn && typeof action.hiddenFn === 'function') {
      return action.hiddenFn(row, action);
    }
    return false;
  }

  handleSelectedAction(row: Row, action) {
    this.toggleDropDown();
    if (!this.actionDisabled(row, action)) {
      this.handler.emit({row: row, action});
    }
  }

  toggleDropDown() {
    this.isOpen = !this.isOpen;
    this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
  }
}
