import {Component, Input, OnInit, SimpleChange} from "@angular/core";
import {RichDatasetService} from "../../../services/RichDatasetService";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {DatasetTag} from "../../../../../models/dataset-tag";



@Component({
  selector: 'ds-nav-result-viewer',
  templateUrl: './ds-nav-result-viewer.component.html',
  styleUrls: ['./ds-nav-result-viewer.component.scss'],
})
export class DsNavResultViewer implements OnInit {

  @Input() currentDsTag : DatasetTag;
  public datasetModels : RichDatasetModel[] = null
  private currentPage : number = 1;

  constructor(
    private richDatasetService :RichDatasetService
  ){}

  ngOnInit () {
    console.log("ngOnInit of DsNavResultViewer called");
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['currentDsTag'] && this.currentDsTag) {
      this.datasetModels=null;
      this.richDatasetService.listByTag(this.currentDsTag.name).subscribe(richDsMdl => this.datasetModels=richDsMdl);
    }
  }
}
