import {Component, Input, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {AssetListActionsEnum} from "../../ds-assets-list/ds-assets-list.component";


@Component({
  selector: 'ds-assets-holder',
  templateUrl: './ds-assets-holder.component.html',
  styleUrls: ['./ds-assets-holder.component.scss'],
  providers:[RichDatasetModel]
})

export class DsAssetsHolder implements OnInit {

  @Input() dsModel: RichDatasetModel;
  public applicableListActions:AssetListActionsEnum[] = [AssetListActionsEnum.ADD, AssetListActionsEnum.REMOVE];

  constructor () {}
  ngOnInit() {}
}
