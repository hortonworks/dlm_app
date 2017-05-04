import {Component, Input, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../../../models/richDatasetModel";

@Component({
  selector: 'ds-row-proxy',
  templateUrl: './row-proxy.component.html',
  styleUrls: ['./row-proxy.component.scss'],
})
export class DsRowProxy implements OnInit {

  @Input() datasetModels : RichDatasetModel[];
  ngOnInit () {
    this.page = 1;
    this.size = 10;
  }
  private static PAGE_SIZE = 10;
  sizes: any[] = [{ size: 10 }, { size: 20 }, { size: 50 }, { size: 100 }];
  page: number;
  size: number;
  hoveredIndex:number;

  get end() {
    let end = this.start + this.size - 1
    if(end > this.datasetModels.length){
      end = this.datasetModels.length;
    }
    return end;
  }

  get paginatedDatasetModels(){
    return this.datasetModels.slice(this.start - 1, this.end)
  }

  get start() {
    return (this.size * (this.page - 1) + 1);
  }

  get noOfPages(){
    return Math.ceil(this.datasetModels.length / this.size);
  }
  previous (){
    if(this.page === 1){
      return;
    }
    this.page = this.page - 1;
  }
  next () {
    if(this.page === this.noOfPages){
      return;
    }
    this.page = this.page + 1;
  }

  onSizeChange(sizeObj){
    this.page = 1;
    this.size = sizeObj.size;
  }

  isFirst(){
    return this.page === 1;
  }

  isLast(){
    return this.page === this.noOfPages;
  }
}
