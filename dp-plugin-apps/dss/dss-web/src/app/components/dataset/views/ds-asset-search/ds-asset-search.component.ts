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

import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {
  AssetSetQueryFilterModel, AssetSetQueryModel, AssetTypeEnum, AssetTypeEnumString,
  DsAssetList, AssetListActionsEnum
} from "../ds-assets-list/ds-assets-list.component";
import {AdvanceQueryEditor} from "./queryEditors/advance/advance-query-editor.component";
import {BasicQueryEditor, SimpleQueryObjectModel} from "./queryEditors/basic/basic-query-editor.component";

export enum DsAssetSearchTabEnum { NORMAL, ADVANCE}

@Component({
  selector: "asset-search",
  styleUrls: ["./ds-asset-search.component.scss"],
  templateUrl: "./ds-asset-search.component.html"
})
export class DsAssetSearch {
  tabEnum = DsAssetSearchTabEnum;
  activeTab = this.tabEnum.NORMAL;
  queryObj: SimpleQueryObjectModel = new SimpleQueryObjectModel("");
  queryModel: AssetSetQueryModel = new AssetSetQueryModel([]);
  showQueryResults: boolean = false;

  allSelected:boolean=false;
  cherryPicked:number=0;
  cherryDroped:number=0;

  @ViewChild("outerCont") outerCont: ElementRef;
  @ViewChild("tabCont") tabCont: ElementRef;
  @ViewChild("emptySearchMsg") emptySearchMsg: ElementRef;
  @ViewChild("queryResultCont") queryResultCont: ElementRef;
  @ViewChild("dsAssetList") dsAssetList: DsAssetList;
  @ViewChild("basicQueryEditor") basicQueryEditor: BasicQueryEditor;
  @ViewChild("advanceQueryEditor") advanceQueryEditor: AdvanceQueryEditor;

  @Input() hideActionButtons : boolean = false;
  @Input() clusterId:number;
  @Input() showBelongsToColumn = false;
  @Output("addNotification") addNotificationEmitter: EventEmitter<AssetSetQueryModel> = new EventEmitter<AssetSetQueryModel>();
  @Output("cancelNotification") cancelNotificationEmitter: EventEmitter<null> = new EventEmitter<null>();

  get showDone () {
    return (this.allSelected || this.cherryPicked || this.cherryDroped);
  }

  setActiveTab (tabEnum:DsAssetSearchTabEnum) {
    if(this.activeTab == tabEnum) return;
    this.actionReset();
    this.activeTab = tabEnum;
  }

  actionCancel() {
    this.cancelNotificationEmitter.emit();
  }

  onListAction (action) {
    switch (action) {
      case AssetListActionsEnum.RELOADED :
          // this.resultStartIndx = this.dsAssetList.pageStartIndex;
          // this.resultEndIndx = this.dsAssetList.pageEndIndex;
          break;  

      case AssetListActionsEnum.SELECTIONCHANGE :
          this.cherryPicked = this.cherryDroped = 0; this.allSelected=false;
          if(this.dsAssetList.selectState !== this.dsAssetList.selStates.CHECKSOME)
            (this.allSelected = true) && (this.cherryDroped = this.dsAssetList.selExcepList.length)
          else
            this.cherryPicked = this.dsAssetList.selExcepList.length
    }
  }
  actionDone () {
    if(!this.allSelected && !this.cherryPicked && !this.cherryDroped) return this.actionCancel();
    this.dsAssetList.updateQueryModels();
    this.addNotificationEmitter.emit(this.queryModel);
  }

  actionSearch() {
    this.showQueryResults = true;
    setTimeout(() => this._actionSearch(), 0);
  }

  _actionSearch() {
    switch (this.activeTab) {
      case this.tabEnum.NORMAL :
        if(!this.queryModel.filters.length) return this.onEmptySearch();
        this.basicQueryEditor.hideFilterCont();
        this.dsAssetList.freshFetch();
        break;
      case this.tabEnum.ADVANCE:
        this.advanceQueryEditor.updateQueryModel();
        if(!this.queryModel.filters.length) return this.onEmptySearch();
        this.dsAssetList.freshFetch();
        break;
    }
  }

  actionReset() {
    switch (this.activeTab) {
      case this.tabEnum.NORMAL :
        this.basicQueryEditor.reset();
        break;
      case this.tabEnum.ADVANCE:
        this.advanceQueryEditor.reset();
        break;
    }
    this.dsAssetList && this.dsAssetList.clearResults();
    this.showQueryResults = false;
  }

  onQueryEditorResize() {
    const padding = this.queryResultCont.nativeElement.offsetTop - this.outerCont.nativeElement.offsetTop;
    console.log(padding, this.queryResultCont.nativeElement.offsetTop, this.outerCont.nativeElement.offsetTop)
    this.tabCont.nativeElement.style.marginTop = `-${padding}px`; // -10 for padding from border
    this.outerCont.nativeElement.style.paddingTop = `${padding}px`;
    this.dsAssetList && this.dsAssetList.resize();
  }

  onEmptySearch () {
    this.actionReset();
    this.emptySearchMsg.nativeElement.style.display='inline-block';
    setTimeout(()=>this.emptySearchMsg.nativeElement.style.display='none', 2000);
  }
}
