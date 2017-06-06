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
  datasetModels: RichDatasetModel[] = null;
  views = ViewsEnum;
  start: number = 1;
  limit: number = 10;

  private currentPage: number = 1;

  constructor(private richDatasetService: RichDatasetService) {
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes["currentDsTag"] && this.currentDsTag) {
      this.getDataset();
    }
  }

  get paginationLabel() {
    if (this.view === ViewsEnum.grid) {
      return "Results Per Page";
    } else {
      return "Rows Per Page";
    }
  }

  getDataset() {
    this.datasetModels = null;
    this.richDatasetService.listByTag(this.currentDsTag.name, this.start, this.limit)
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
