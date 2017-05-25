import {Component, Input, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../../../models/richDatasetModel";
import {Router} from "@angular/router";


@Component({
  selector: 'ds-tile-proxy',
  templateUrl: './tile-proxy.component.html',
  styleUrls: ['./tile-proxy.component.scss'],
})
export class DsTileProxy{

  @Input() dsModel: RichDatasetModel;

  constructor(private router: Router,) {
  }

  getID() {
    return 'dropDownIcon_' + this.dsModel.id;
  }

  showFullView($event) {
    if ($event.target.tagName != 'I') {
      this.router.navigate(['dataset/full-view/' + this.dsModel.id]);
    }
  }
}
