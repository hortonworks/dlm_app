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

import {Component, OnInit, ViewChild,ElementRef} from "@angular/core";
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
  showSummary : boolean = true;
  selectionAllowed : boolean = false;
  showPopup: boolean = false;

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
      .subscribe(rData => {
        this.dsModel = rData;
      })
  }
  actionRemoveSelected (ids:string[]) {
    console.log("Remove selected called!!!")
    if(!ids.length) return console.log("cannot remove without selection")
    this.richDatasetService
      .deleteSelectedAssets(this.dsModel.id, ids)
      .subscribe(rData => {
        this.dsModel = rData;
      })
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

  viewComments(){
    this.router.navigate([{outlets: {'sidebar': ['comments','assetCollection',true]}}], { relativeTo: this.activeRoute, skipLocationChange: true, queryParams: { returnURl: this.router.url }});
  }

  toggleSummaryWidget () {
    this.showSummary = !this.showSummary;
  }

  popupActionCancel() {
    this.showPopup = false;
  }

  popupActionDone(asqm: AssetSetQueryModel) {
    let futureRdataSet;

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

}
