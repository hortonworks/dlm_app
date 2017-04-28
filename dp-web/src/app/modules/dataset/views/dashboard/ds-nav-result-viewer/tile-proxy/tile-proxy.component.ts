import {Component, Input, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../../../models/richDatasetModel";


@Component({
  selector: 'ds-tile-proxy',
  templateUrl: './tile-proxy.component.html',
  styleUrls: ['./tile-proxy.component.scss'],
})
export class DsTileProxy implements OnInit {

  @Input() dsModel : RichDatasetModel;
  ngOnInit () {}

  getID() {
    return 'dropDownIcon_' + this.dsModel.id;
  }
}
