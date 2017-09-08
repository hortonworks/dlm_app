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

import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'simple-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class SimplePaginationWidget {
  infinity: number = Infinity;
  @Input() pageSize: number;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100, 200, 500];
  @Input() pageStartIndex: number;
  @Input() count: number;
  @Output('onPageChange') indexEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output('onPageSizeChange') pageSizeEmitter: EventEmitter<number> = new EventEmitter<number>();

  get start(): number {
    return Math.min(this.count, this.pageStartIndex);
  }

  get end(): number {
    return Math.min(this.count, this.pageSize + this.pageStartIndex - 1);
  }

  get showPagination(): boolean {
    return this.count > this.pageSizeOptions[0];
  }

  pageSizeChange() {
    this.pageSizeEmitter.emit(this.pageSize = +this.pageSize);
  }

  previous() {
    if (this.start > 1) {
      this.pageStartIndex = this.pageStartIndex - this.pageSize;
      this.indexEmitter.emit(this.pageStartIndex);
    }
  }

  next() {
    if (this.end !== this.count) {
      this.pageStartIndex = this.pageStartIndex + this.pageSize;
      this.indexEmitter.emit(this.pageStartIndex);
    }
  }
}
