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
import {Bookmark, Favourite, RichDatasetModel} from "../../models/richDatasetModel";
import {RichDatasetService} from "../../services/RichDatasetService";
import {DsTagsService} from "../../services/dsTagsService";
import {DataSetService} from "../../../../services/dataset.service";
import {
  AssetListActionsEnum,
  AssetSetQueryFilterModel,
  AssetSetQueryModel,
  DsAssetList
} from "../ds-assets-list/ds-assets-list.component";
import {AuthUtils} from "../../../../shared/utils/auth-utils";
import {FavouriteService} from "../../../../services/favourite.service";
import {BookmarkService} from "../../../../services/bookmark.service";
import {RatingService} from "../../../../services/rating.service";
import {DataSet} from "../../../../models/data-set";

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
  systemTags: string[] = [];
  objectType: string = "assetCollection";
  avgRating: number = 0;

  assetPrefix = isDevMode() ? ' ' : 'dss';

  constructor(private richDatasetService: RichDatasetService,
              private dataSetService: DataSetService,
              private tagService: DsTagsService,
              private favouriteService: FavouriteService,
              private bookmarkService: BookmarkService,
              private ratingService: RatingService,
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
        this.tagService.listAtlasTags(+params["id"]).subscribe(tags => this.systemTags=tags)
        this.getAverageRating(params["id"]);
      });
    this.ratingService.dataChanged$.subscribe(avgRating => {
      this.avgRating = avgRating;
    });
  }
  updateDsModel = (rData) => {
    this.dsModel = rData;
    this.tagService.listAtlasTags(+rData["id"]).subscribe(tags => this.systemTags=tags)
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

  getFavCount(id){
    if(this.dsModel.favouriteCount){
      return this.dsModel.favouriteCount;
    }
    return 0;
  }

  onFavIconClick(){
    let userId = Number(AuthUtils.getUser().id)
    if(!this.dsModel.favouriteId){
      let favourite = new Favourite();
      favourite.userId = userId;
      favourite.objectId = this.dsModel.id;
      favourite.objectType = this.objectType;
      this.favouriteService.add(favourite).subscribe(favWithTotal => {
        this.dsModel.favouriteId = favWithTotal.favourite.id;
        this.dsModel.favouriteCount = favWithTotal.totalFavCount;
      })
    }else{
      this.favouriteService.delete(this.dsModel.favouriteId, this.dsModel.id, this.objectType).subscribe(msg => {
        this.dsModel.favouriteId = null;
        this.dsModel.favouriteCount = msg.totalFavCount;
      })
    }
  }

  onBookmarkIconClick(){
    let userId = Number(AuthUtils.getUser().id)
    if(!this.dsModel.bookmarkId){
      let bookmark = new Bookmark();
      bookmark.userId = userId;
      bookmark.objectType = this.objectType;
      bookmark.objectId = this.dsModel.id;
      this.bookmarkService.add(bookmark).subscribe(bm => {
        this.dsModel.bookmarkId = bm.id;
      })
    }else{
      this.bookmarkService.delete(this.dsModel.bookmarkId).subscribe(_ => {
        this.dsModel.bookmarkId = null;
      })
    }
  }

  onLockClick(){
    if(this.isLoggedInUser(this.dsModel.creatorId)){
      let dataset = new DataSet();
      dataset.id = this.dsModel.id;
      dataset.createdBy = this.dsModel.creatorId;
      dataset.createdOn = this.dsModel.createdOn;
      dataset.dpClusterId = this.dsModel.clusterId;
      dataset.datalakeId = this.dsModel.datalakeId;
      dataset.description = this.dsModel.description;
      dataset.lastModified = this.dsModel.lastModified;
      dataset.name = this.dsModel.name;
      dataset.active = this.dsModel.active;
      dataset.version = this.dsModel.version;
      dataset.customProps = this.dsModel.customProps;
      dataset.sharedStatus = (this.dsModel.sharedStatus % 2) + 1;
      this.dataSetService.update(dataset).subscribe( ds => {
        this.dsModel.sharedStatus = ds.sharedStatus;
        this.dsModel.lastModified = ds.lastModified;
      })
    }
  }

  isLoggedInUser(datasetUserId: number){
    return Number(AuthUtils.getUser().id) === datasetUserId;
  }

  viewComments(){
    this.router.navigate([{outlets: {'sidebar': ['comments','assetCollection',true]}}], { relativeTo: this.activeRoute, skipLocationChange: true, queryParams: { returnURl: this.router.url }});
  }

  getAverageRating(datasetId: string) {
    this.ratingService.getAverage(datasetId, this.objectType).subscribe( averageAndVotes => {
      this.avgRating = averageAndVotes.average;
    });
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
      this.updateDsModel(rData)
      // this.assetSetQueryModelsForAddition.push(asqm);
      this.showPopup = false;
    })
  }

}
