import {Component, Input, OnInit, SimpleChange} from "@angular/core";
import {RichDatasetService} from "../../../services/RichDatasetService";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {DatasetTag} from "../../../../../models/dataset-tag";
import {ViewsEnum} from "../../../../../shared/utils/views";


@Component({
  selector: 'ds-nav-result-viewer',
  templateUrl: './ds-result-viewer.component.html',
  styleUrls: ['./ds-result-viewer.component.scss'],
})
export class DsNavResultViewer implements OnInit {

  @Input() currentDsTag : DatasetTag;
  public datasetModels : RichDatasetModel[] = null
  private currentPage : number = 1;
  public views = ViewsEnum;
  @Input() view;

  start : number = 1;
  limit : number = 10;

  constructor(
    private richDatasetService :RichDatasetService
  ){}

  ngOnInit () {

  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['currentDsTag'] && this.currentDsTag) {
      this.getDataset();
    }
  }

  get paginationLabel(){
    if(this.view === ViewsEnum.grid){
        return 'Results Per Page';
    }else{
        return 'Rows Per Page';
     }
  }

  getDataset(){
     this.datasetModels=null;
      this.richDatasetService.listByTag(this.currentDsTag.name, this.start, this.limit)
        .subscribe(result => this.datasetModels = result);
  }


  onPageChange(start){
    this.start = start;
    this.getDataset();
  }

  onSizeChange(limit){
    this.start = 1;
    this.limit = limit;
    this.getDataset();
  }
}
