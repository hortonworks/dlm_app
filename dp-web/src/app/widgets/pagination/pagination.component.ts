import {Component, Input, Output, OnInit, EventEmitter} from "@angular/core";

@Component({
  selector: 'dp-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit {

  @Input() total : number;
  @Input() pageSize : number;
  @Input() start : number = 1;
  @Input() label : string = "Rows Per Page";
  @Input() pageSizes: any[] = [10,20,50,100];

  @Output ('pageChanged') pageChangeEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output ('sizeChanged') sizeChangeEmitter: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit () {
    this.pageSize = this.pageSize ? this.pageSize : this.pageSizes[0];
  }

  get end() {
    let end = this.start + this.pageSize - 1
    if(end > this.total){
      end = this.total;
    }
    return end;
  }

  get page() {
    return Math.ceil(this.start / this.pageSize);
  }

  get noOfPages(){
    return Math.ceil(this.total / this.pageSize);
  }

  previous (){
    if(this.isFirst()){
      return;
    }
    this.start = this.start - this.pageSize;
    this.pageChangeEmitter.emit(this.start);
  }

  next () {
    if(this.isLast()){
      return;
    }
    this.start = this.start + this.pageSize;
    this.pageChangeEmitter.emit(this.start);
  }

  onPageSizeChange(pageSizeObj){
    this.start = 1;
    this.pageSize = pageSizeObj.size;
    this.sizeChangeEmitter.emit(this.pageSize);
  }

  isFirst(){
    return this.page === 1;
  }

  isLast(){
    return this.page === this.noOfPages;
  }
}
