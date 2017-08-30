/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Component, EventEmitter, Input, OnInit, Output, SimpleChange} from "@angular/core";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {
  AssetListActionsEnum, AssetSetQueryFilterModel,
  AssetSetQueryModel
} from "../../ds-assets-list/ds-assets-list.component";

@Component({
  providers: [RichDatasetModel],
  selector: "ds-assets-holder",
  styleUrls: ["./ds-assets-holder.component.scss"],
  templateUrl: "./ds-assets-holder.component.html"
})

export class DsAssetsHolder implements OnInit {

  @Input() assetSetQueryModelsForAddition: AssetSetQueryModel[] = null;
  @Input() assetSetQueryModelsForSubtraction: AssetSetQueryModel[] = null;
  @Input() dsModel: RichDatasetModel = null;
//  applicableListActions: AssetListActionsEnum[] = [AssetListActionsEnum.ADD, AssetListActionsEnum.REMOVE];
  applicableListActions: AssetListActionsEnum[] = [AssetListActionsEnum.REMOVE];
  showPopup: boolean = false;
  showList: boolean = false;
  @Output("onDoneAction") actionEmitter: EventEmitter<AssetListActionsEnum> = new EventEmitter<AssetListActionsEnum>();

  ngOnInit() {
    this.setShowListFlag();
  }

  setShowListFlag() {
    this.showList = (this.assetSetQueryModelsForAddition.length > 0);
  }

  actionDone(asqm: AssetSetQueryModel) {
    this.assetSetQueryModelsForAddition.push(asqm);
    this.actionEmitter.emit();
    this.showPopup = false;
    this.setShowListFlag();
  }

  onListAction(action: AssetListActionsEnum) {
    if (action == AssetListActionsEnum.ADD) {
      this.showPopup = true;
    }
    if (action == AssetListActionsEnum.REMOVE) {
      this.actionRemoveAll();
    }
  }

  actionRemoveAll() {
    this.assetSetQueryModelsForAddition.splice(0);
    this.dsModel.counts=null;
    this.setShowListFlag();
    this.actionEmitter.emit();
  }

  actionCancel() {
    this.showPopup = false;
  }
}
