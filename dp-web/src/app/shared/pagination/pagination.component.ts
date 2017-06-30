import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'simple-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class SimplePaginationWidget implements OnChanges {
  infinity: number = Infinity;
  @Input() pageSize: number;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100, 200, 500];
  @Input() pageStartIndex: number;
  @Input() count: number;
  @Output('onPageChange') indexEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output('onPageSizeChange') pageSizeEmitter: EventEmitter<number> = new EventEmitter<number>();
  isInit = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['count'] && !this.isInit) {
      this.isInit = false;
      if (this.count < this.pageSize) {
        let startIndex = Math.floor(this.count / this.pageSize) * this.pageSize;
        this.indexEmitter.emit(this.pageStartIndex = startIndex);
      }
    }
  }

  get start(): number {
    return Math.min(this.count, this.pageStartIndex + 1);
  }

  get end(): number {
    return Math.min(this.count, this.pageSize + this.pageStartIndex);
  }

  get showPagination(): boolean {
    return this.count > this.pageSizeOptions[0];
  }

  pageSizeChange() {
    this.pageSizeEmitter.emit(this.pageSize = +this.pageSize);
  }

  previous() {
    (this.pageStartIndex > 1) && this.indexEmitter.emit(this.pageStartIndex -= this.pageSize);
  }

  next() {
    (this.pageStartIndex + this.pageSize <= this.count) && this.indexEmitter.emit(this.pageStartIndex += this.pageSize);
  }

  Math: any;

  constructor() {
    this.Math = Math;
  }
}
