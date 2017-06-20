import {Component, Input, OnInit, SimpleChange} from "@angular/core";
import {DatasetTag} from "../../../../../models/dataset-tag";
import {ViewsEnum} from "../../../../../shared/utils/views";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {RichDatasetService} from "../../../services/RichDatasetService";

@Component({
  selector: "ds-nav-result-viewer",
  styleUrls: ["./ds-result-viewer.component.scss"],
  templateUrl: "./ds-result-viewer.component.html",
})
export class DsNavResultViewer {

  @Input() currentDsTag: DatasetTag;
  @Input() view;
  @Input() dsNameSearch:string = "";
  datasetModels: RichDatasetModel[] = null;
  views = ViewsEnum;
  start: number = 1;
  limit: number = 10;

  private currentPage: number = 1;

  constructor(private richDatasetService: RichDatasetService) {
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if ((changes["dsNameSearch"] && !changes["dsNameSearch"].firstChange)
      || changes["currentDsTag"] && !changes["currentDsTag"].firstChange) {
      this.getDataset();
    }
  }

  getDataset() {
    this.datasetModels = null;
    this.richDatasetService.listByTag(this.currentDsTag.name, this.dsNameSearch, this.start-1, this.limit)
      .subscribe(result => this.datasetModels = result);
  }

  onPageChange(start) {
    this.start = start;
    this.getDataset();
  }

  onSizeChange(limit) {
    this.start = 1;
    this.limit = limit;
    this.getDataset();
  }
}
