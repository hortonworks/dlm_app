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

import {Component, OnInit, ViewChild, ElementRef, isDevMode} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import * as DialogPolyfill from 'dialog-polyfill';
import {RichDatasetModel} from "../../models/richDatasetModel";
import {RichDatasetService} from "../../services/RichDatasetService";
import {DataSetService} from "../../../../services/dataset.service";
import {
  AssetListActionsEnum,
  AssetSetQueryFilterModel,
  AssetSetQueryModel,
  DsAssetList
} from "../ds-assets-list/ds-assets-list.component";

@Component({
  selector: "ds-full-view",
  styleUrls: ["./ds-full-view.component.scss"],
  templateUrl: "./ds-full-view.component.html",
})
export class DsFullView implements OnInit {

  @ViewChild('dialogConfirm') dialogConfirm: ElementRef;
  @ViewChild("dsAssetList") dsAssetList: DsAssetList;
  dsModel: RichDatasetModel = null;
  applicableListActions: AssetListActionsEnum[] = [AssetListActionsEnum.EDIT, AssetListActionsEnum.DELETE];
  dsAssetQueryModel: AssetSetQueryModel;
  clusterId: any;
  selectionAllowed : boolean = false;
  showPopup: boolean = false;
  hidePopupActionButtons: boolean = false;
  showConfirmationSticker: boolean = false;
  systemTags: string[] = [];
  objectType: string = "assetCollection";
  avgRating: number = 0;
  assetCountDiff:number = 0;

  assetPrefix = isDevMode() ? ' ' : 'dss';

  constructor(private richDatasetService: RichDatasetService,
              private dataSetService: DataSetService,
              private router: Router,
              private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.params
      .subscribe(params => {
        this.clusterId = params["id"];
        this.richDatasetService
          .getById(+params["id"])
          .subscribe(dsObj => this.dsModel = dsObj);
        this.dsAssetQueryModel = new AssetSetQueryModel([
          new AssetSetQueryFilterModel("dataset.id", "=", +params["id"], "-")
        ]);
      });
  }
  get confirmationStickerText() {
    return `${Math.abs(this.assetCountDiff)} Assets successfully ${(this.assetCountDiff < 0)?"removed from":"added to"} ${this.dsModel.name}.`;
  }

  updateDsModel = (rData) => {
    this.assetCountDiff = rData.counts.hiveCount - this.dsModel.counts.hiveCount;
    this.showConfirmationSticker=true;
    setTimeout(()=>this.showConfirmationSticker=false, 3000);
    this.dsModel = rData;
    this.dsAssetList.clearSelection();
    // this.tagService.listAtlasTags(+rData["id"]).subscribe(tags => this.systemTags=tags)
  }

  private onAction(action: AssetListActionsEnum) {
    if(action === AssetListActionsEnum.DELETE)
      return this.onDeleteDataset();
    if(action === AssetListActionsEnum.EDIT){
      this.applicableListActions = [AssetListActionsEnum.REMOVE, AssetListActionsEnum.ADD, AssetListActionsEnum.DONE];
      return this.selectionAllowed = true;
    }
    if(action === AssetListActionsEnum.DONE){
      this.applicableListActions = [AssetListActionsEnum.EDIT, AssetListActionsEnum.DELETE];
      return this.selectionAllowed = false;
    }
    if (action == AssetListActionsEnum.REMOVE) {
      if(this.dsAssetList.checkedAllState())
        this.actionRemoveAll();
      else
        this.actionRemoveSelected(this.dsAssetList.selExcepList);
    }
    if (action == AssetListActionsEnum.ADD) {
      this.showPopup = true;
    }
//    this.router.navigate(['dss/collections', this.dsModel.id, 'edit']);
  }

  actionRemoveAll() {
    console.log("Remove all called!!!")
    this.richDatasetService
      .deleteAllAssets(this.dsModel.id)
      .subscribe(this.updateDsModel)
  }
  actionRemoveSelected (ids:string[]) {
    if(!ids.length) return;
    this.richDatasetService
      .deleteSelectedAssets(this.dsModel.id, ids)
      .subscribe(this.updateDsModel)
  }


  onDeleteDataset() {
    DialogPolyfill.registerDialog(this.dialogConfirm.nativeElement);
    this.dialogConfirm.nativeElement.showModal();
  }

  doConfirmDelete() {
    const delete$ = this.dataSetService.delete(this.dsModel.id).share();
    delete$
      .subscribe(() => {
        this.dialogConfirm.nativeElement.close();

        this.router.navigate([`dss/collections`]);
      });
  }

  doCancelDelete() {
    this.dialogConfirm.nativeElement.close();
  }

  popupActionCancel() {
    this.showPopup = false;
  }

  popupActionDone() {
    this.showPopup = false;
  }

  popupActionAdd(asqm: AssetSetQueryModel) {
    this.hidePopupActionButtons = true;
    let futureRdataSet;

    if(asqm.selectionList.length)
      futureRdataSet = this.richDatasetService.addSelectedAssets(this.dsModel.id, this.dsModel.clusterId, asqm.selectionList);
    else
      futureRdataSet = this.richDatasetService.addAssets(this.dsModel.id, this.dsModel.clusterId, [asqm], asqm.exceptionList);

    futureRdataSet.subscribe(rdata=> {
      this.hidePopupActionButtons = false;
      this.updateDsModel(rdata);  
    })
  }
}
