import {Component, Input, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../../models/richDatasetModel";

@Component({
  providers: [RichDatasetModel],
  selector: "ds-summary-holder",
  styleUrls: ["./ds-summary-holder.component.scss"],
  templateUrl: "./ds-summary-holder.component.html"
})
export class DsSummaryHolder {
  @Input() dsModel: RichDatasetModel;
  @Input() tags: string[] = [];
}
