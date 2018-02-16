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
import {Bookmark, Favourite, RichDatasetModel} from "../../models/richDatasetModel";
import {RichDatasetService} from "../../services/RichDatasetService";
import {DataSetService} from "../../../../services/dataset.service";
import {
  AssetListActionsEnum,
  AssetSetQueryFilterModel,
  AssetSetQueryModel
} from "../ds-assets-list/ds-assets-list.component";
import {AuthUtils} from "../../../../shared/utils/auth-utils";
import {FavouriteService} from "../../../../services/favourite.service";
import {BookmarkService} from "../../../../services/bookmark.service";

@Component({
  selector: "ds-full-view",
  styleUrls: ["./ds-full-view.component.scss"],
  templateUrl: "./ds-full-view.component.html",
})
export class DsFullView implements OnInit {

  @ViewChild('dialogConfirm') dialogConfirm: ElementRef;
  dsModel: RichDatasetModel = null;
  applicableListActions: AssetListActionsEnum[] = [];//[AssetListActionsEnum.EDIT];
  dsAssetQueryModel: AssetSetQueryModel;
  clusterId: any;
  objectType = "assetCollection";

  constructor(private richDatasetService: RichDatasetService,
              private dataSetService: DataSetService,
              private favouriteService: FavouriteService,
              private bookmarkService: BookmarkService,
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

  private onEdit(action: AssetListActionsEnum) {
    if(action !== AssetListActionsEnum.EDIT) return;
    this.router.navigate(['dss/collections', this.dsModel.id, 'edit']);
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
      this.favouriteService.delete(userId, this.dsModel.favouriteId, this.dsModel.id, this.objectType).subscribe(msg => {
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
      this.bookmarkService.delete(userId,this.dsModel.bookmarkId, this.objectType, this.dsModel.id).subscribe(_ => {
        this.dsModel.bookmarkId = null;
      })
    }
  }

  viewComments(){
    this.router.navigate([{outlets: {'sidebar': ['comments','assetCollection',true]}}], { relativeTo: this.activeRoute, skipLocationChange: true, queryParams: { returnURl: this.router.url }});
  }

}
