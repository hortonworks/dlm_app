import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector:"simple-pagination",
  templateUrl:"./pagination.component.html",
  styleUrls:["./pagination.component.scss"]
})
export class SimplePaginationWidget {
  @Input() pageSize:number;
  @Input() pageSizeOptions:number[]=[10,20,50,100,200,500];
  @Input() pageStartIndex:number;
  @Input() count:number;
  @Output("onPageChange") indexEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output("onPageSizeChange") pageSizeEmitter: EventEmitter<number> = new EventEmitter<number>();
  pageSizeChange() {this.pageSizeEmitter.emit(this.pageSize=+this.pageSize);}
  previous() {(this.pageStartIndex > 1) && this.indexEmitter.emit(this.pageStartIndex -= this.pageSize);}
  next() {(this.pageStartIndex + this.pageSize  <= this.count) && this.indexEmitter.emit(this.pageStartIndex += this.pageSize);}
  Math:any;
  constructor(){this.Math=Math;}
}
