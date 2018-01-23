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
import {RichDatasetService} from "../../../services/RichDatasetService";
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

export class DsAssetsHolder {

  @Input() assetSetQueryModelsForAddition: AssetSetQueryModel[] = null;
  @Input() assetSetQueryModelsForSubtraction: AssetSetQueryModel[] = null;
  @Input() dsModel: RichDatasetModel = null;
  applicableListActions: AssetListActionsEnum[] = [AssetListActionsEnum.REMOVE, AssetListActionsEnum.ADD];
  showPopup: boolean = false;
  
  @Output('onNext') nextEE: EventEmitter<void> = new EventEmitter<void>();
  @Output('onCancel') cancelEE: EventEmitter<void> = new EventEmitter<void>();

  constructor(private richDatasetService: RichDatasetService){}

  get showList() {
    return (this.assetSetQueryModelsForAddition.length > 0);
  }

  actionDone(asqm: AssetSetQueryModel) {
    let futureRdataSet;
    console.log(asqm.selectionList.length);
    if(asqm.selectionList.length) 
      futureRdataSet = this.richDatasetService.addSelectedAssets(this.dsModel.id, this.dsModel.clusterId, asqm.selectionList);
    else
      futureRdataSet = this.richDatasetService.addAssets(this.dsModel.id, this.dsModel.clusterId, [asqm], asqm.exceptionList);
    
    futureRdataSet.subscribe(rData => {
        this.dsModel = rData;
        // this.assetSetQueryModelsForAddition.push(asqm);
        this.showPopup = false;
      })
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
    console.log("Remove all called!!!")
    this.richDatasetService
      .deleteAllAssets(this.dsModel.id)
      .subscribe(rData => {
        this.dsModel = rData;
        // this.assetSetQueryModelsForAddition.splice(0);
        // this.dsModel.counts=null;
      })
  }

  actionCancel() {
    this.showPopup = false;
  }

  onNext() {
    this.nextEE.emit();
  }

  onCancel() {
    this.cancelEE.emit();
  }
}
