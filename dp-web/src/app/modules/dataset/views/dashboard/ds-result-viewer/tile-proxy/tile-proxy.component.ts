import {Component, Input, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {RichDatasetModel} from "../../../../models/richDatasetModel";

@Component({
  selector: "ds-tile-proxy",
  styleUrls: ["./tile-proxy.component.scss"],
  templateUrl: "./tile-proxy.component.html"
})

export class DsTileProxy {

  @Input() dsModel: RichDatasetModel;

  constructor(private router: Router,) {
  }

  getID() {
    return `dropDownIcon_${this.dsModel.id}`;
  }

  showFullView($event) {
    if ($event.target.tagName != "I") {
      this.router.navigate([`dataset/full-view/${this.dsModel.id}`]);
    }
  }
}
