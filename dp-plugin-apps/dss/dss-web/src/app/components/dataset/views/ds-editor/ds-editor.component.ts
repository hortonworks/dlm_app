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

import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {DsTagsService} from "../../services/dsTagsService";
import {RichDatasetService} from "../../services/RichDatasetService";
import {AssetSetQueryFilterModel, AssetSetQueryModel} from "../ds-assets-list/ds-assets-list.component";
import {DataSetAndCategories, DataSetAndTags} from "../../../../models/data-set";

@Component({
  providers: [RichDatasetModel],
  selector: "ds-editor",
  styleUrls: ["./ds-editor.component.scss"],
  templateUrl: "./ds-editor.component.html"
})
export class DsEditor implements OnInit {

  @ViewChild("fillMandatoryMsg") fillMandatoryMsg: ElementRef;
  currentStage: number = 1;
  nextIsVisible: boolean = true;
  saveInProgress:boolean = false;
  tags: string[] = [];
  assetSetQueryModelsForAddition: AssetSetQueryModel[] = [];
  assetSetQueryModelsForSubtraction: AssetSetQueryModel[] = [];
  private datasetId: number = null;
  errorMessage: string;

  constructor(public dsModel: RichDatasetModel,
              private richDatasetService: RichDatasetService,
              private tagService: DsTagsService,
              private router: Router,
              private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => this.datasetId = +params["id"]);
    if (isNaN(this.datasetId)) {
      this.router.navigate(["dss/collections/add"]);
    }
    else {
      this.assetSetQueryModelsForAddition.push(
        new AssetSetQueryModel([new AssetSetQueryFilterModel("dataset.id", "=", this.datasetId, "-")])
      );
      this.richDatasetService.getById(this.datasetId)
        .subscribe(dsModel => {
          this.dsModel = dsModel;
          this.tags = dsModel.tags;
        });
    }
  }

  actionNext() {
    if (!this[`validateStage${this.currentStage}`]()) {
      this.fillMandatoryMsg.nativeElement.style.display="block";
      setTimeout(()=>this.fillMandatoryMsg.nativeElement.style.display="none", 3000);
      return;
    }
    this.fillMandatoryMsg.nativeElement.style.display="none";
    ++this.currentStage;
  }

  moveToStage(newStage: number) {
    if ((newStage < this.currentStage) && (this.currentStage = newStage)) {
      // clear error
      this.errorMessage = null;
    }
  }

  actionSave() {
    // if (this.saveInProgress) return;
    // this.saveInProgress = true;
    // this.richDatasetService
    //   .saveDatasetWithAssets(this.dsModel, this.assetSetQueryModelsForAddition, this.tags)
    //   .subscribe(
    //     () => this.actionCancel(),
    //     error => {
    //       this.saveInProgress = false;
    //       this.errorMessage = error.json().message
    //     }
    //   );
    this.router.navigate(["dss/collections"]);
  }

  actionCancel() {
    this.router.navigate(["dss/collections"]);
  }

  getDataSetAndTags() : DataSetAndTags {
    const rData:RichDatasetModel = this.dsModel, tags=this.tags;
    return {
      dataset : {
        "id": rData.id || 0,
        "name": rData.name,
        "description": rData.description,
//        "datalakeId": rData.datalakeId,
        "dpClusterId": parseInt(rData.datalakeId as any),
        "createdBy": rData.creatorId || 0,
        "createdOn": rData.createdOn,
        "lastModified": rData.lastModified,
        "active": true,
        "version": 1
      },
      tags : tags
    } as DataSetAndTags;
  }

  validateStage1() {
    if(!(this.dsModel.name && this.dsModel.description && this.dsModel.datalakeId)) return false;
    this.richDatasetService
      .saveDataset(this.getDataSetAndTags())
      .subscribe(rDataSet => {
        this.dsModel = rDataSet
        this.assetSetQueryModelsForAddition.push(
          new AssetSetQueryModel([new AssetSetQueryFilterModel("dataset.id", "=", rDataSet.id, "-")])
        );
      })
    return true;
  }

  validateStage2() {
    if(this.assetSetQueryModelsForAddition.length == 0) return false;
    return true;
  }

  validateStage3() {
    return true;
  }

}