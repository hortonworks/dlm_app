/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Directive, Output, Input, EventEmitter, ElementRef, AfterViewInit} from '@angular/core';
import {Sort} from '../utils/enums';

export interface SortEvent {
  sortBy: string;
  type: string;
  sortOrder: Sort;
}

@Directive({
  selector: '[dp-config-table]'
})

export class DpTableDirective {

  @Output() onSort = new EventEmitter<SortEvent>();
  @Input() data: any[] = [];
  @Input() cellSelectable = false;
  rowhighlightColor = '#333333';
  highlightColor = '#0F4450';
  border = '1px solid #1B596C';

  onSortColumnChange = new EventEmitter<SortEvent>();

  constructor(private element: ElementRef) { }


  public setSort(sortEvent: SortEvent): void {
    this.onSortColumnChange.emit(sortEvent);
    if (this.onSort.observers.length === 0 ) {
      this.sort(sortEvent);
    } else {
      this.onSort.emit(sortEvent);
    }
  }

  private sort($event) {
    this.data.sort((obj1: any, obj2: any) => {
      if ($event.sortOrder === Sort.ASC) {
        if ($event.type === 'string') {
          return obj1[$event.sortBy].localeCompare(obj2[$event.sortBy]);
        }
        if ($event.type === 'number') {
          return obj1[$event.sortBy] - obj2[$event.sortBy];
        }
      }

      if ($event.type === 'string') {
        return obj2[$event.sortBy].localeCompare(obj1[$event.sortBy]);
      }
      if ($event.type === 'number') {
        return obj2[$event.sortBy] - obj1[$event.sortBy];
      }
    });
  }
}
