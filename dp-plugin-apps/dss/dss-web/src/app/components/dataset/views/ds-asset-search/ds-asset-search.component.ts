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
  DsAssetList
} from "../ds-assets-list/ds-assets-list.component";
import {AdvanceQueryEditor} from "./queryEditors/advance/advance-query-editor.component";
import {BasicQueryEditor, SimpleQueryObjectModel} from "./queryEditors/basic/basic-query-editor.component";

export enum DsAssetSearchTabEnum { NORMAL, ADVANCE}

@Component({
  selector: "asset-search-old",
  styleUrls: ["./ds-asset-search.component.scss"],
  templateUrl: "./ds-asset-search.component.html"
})
export class DsAssetSearch_Old {
  tabEnum = DsAssetSearchTabEnum;
  activeTab = this.tabEnum.NORMAL;
  queryObj: SimpleQueryObjectModel = new SimpleQueryObjectModel("");
  queryModel: AssetSetQueryModel = new AssetSetQueryModel([]);
  showQueryResults: boolean = false;
  hideActionButtonCont : boolean = false;

  @ViewChild("outerCont") outerCont: ElementRef;
  @ViewChild("tabCont") tabCont: ElementRef;
  @ViewChild("emptySearchMsg") emptySearchMsg: ElementRef;
  @ViewChild("queryResultCont") queryResultCont: ElementRef;
  @ViewChild("dsAssetList") dsAssetList: DsAssetList;
  @ViewChild("basicQueryEditor") basicQueryEditor: BasicQueryEditor;
  @ViewChild("advanceQueryEditor") advanceQueryEditor: AdvanceQueryEditor;

  @Input() clusterId:number;
  @Input() saveButton = false;
  @Input() showBelongsToColumn = false;
  @Output("doneNotification") doneNotificationEmitter: EventEmitter<AssetSetQueryModel> = new EventEmitter<AssetSetQueryModel>();
  @Output("cancelNotification") cancelNotificationEmitter: EventEmitter<null> = new EventEmitter<null>();

  onSimpleQueryObjUpdate(flag: any) {
    this.queryModel = new AssetSetQueryModel([]);
    if(this.queryObj.searchText){
      this.queryModel.filters.push({column: "name", operator: "contains", value: this.queryObj.searchText, dataType:"string"});
      // this.queryModel.filters.push({column: "asset.source", operator: "==", value: AssetTypeEnumString[this.queryObj.type], dataType:"-"});
    }
    if(!this.queryModel.filters.length) return this.onEmptySearch();
    if (!this.showQueryResults) (setTimeout(() => this._actionSearch(), 0));
    this.showQueryResults = true;

  }

  get showDone () {
    switch (this.activeTab) {
      case this.tabEnum.NORMAL :
        if(this.queryObj.searchText) return true;
        break;
      case this.tabEnum.ADVANCE:
        if(this.queryModel.filters.length) return true;
        break;
    }
    return false;
  }

  actionCancel() {
    this.cancelNotificationEmitter.emit();
  }

  actionDone() {
    this.hideActionButtonCont = true;
    this.dsAssetList.updateQueryModels();
    this.doneNotificationEmitter.emit(this.queryModel);
  }

  actionSearch() {
    this.showQueryResults = true;
    setTimeout(() => this._actionSearch(), 0);
  }

  _actionSearch() {
    switch (this.activeTab) {
      case this.tabEnum.NORMAL :
        this.onSimpleQueryObjUpdate(false);
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
        this.queryObj = new SimpleQueryObjectModel("");
        break;
      case this.tabEnum.ADVANCE:
        this.advanceQueryEditor.reset();
        break;
    }
    this.dsAssetList.clearResults();
    this.showQueryResults = false;
  }

  onQueryEditorResize() {
    const padding = this.queryResultCont.nativeElement.offsetTop - this.outerCont.nativeElement.offsetTop;
    this.tabCont.nativeElement.style.marginTop = `-${(padding - 10)}px`; // -10 for padding from border
    this.outerCont.nativeElement.style.paddingTop = `${padding}px`;
    this.dsAssetList && this.dsAssetList.resize();
  }

  onEmptySearch () {
    this.actionReset();
    this.emptySearchMsg.nativeElement.style.display='inline-block';
    setTimeout(()=>this.emptySearchMsg.nativeElement.style.display='none', 2000);
  }
}
