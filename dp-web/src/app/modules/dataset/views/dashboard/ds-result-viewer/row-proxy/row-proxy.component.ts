import {Component, Input, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {RichDatasetModel} from "../../../../models/richDatasetModel";

@Component({
  selector: "ds-row-proxy",
  styleUrls: ["./row-proxy.component.scss"],
  templateUrl: "./row-proxy.component.html"
})
export class DsRowProxy {

  @Input() datasetModels: RichDatasetModel[];
  hoveredIndex: number;

  constructor(private router: Router) {
  }

  showFullView(dsModel) {
    this.router.navigate([`dataset/full-view/${dsModel.id}`]);
  }
}
