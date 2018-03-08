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

import {Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild} from "@angular/core";
import {TaggingWidgetTagModel} from "../../../../../../shared/tagging-widget/tagging-widget.component";
import {AssetTypeEnum} from "../../../ds-assets-list/ds-assets-list.component";
import {SearchWidget} from "./search-widget/search-widget.component";
import {AssetSetQueryFilterModel, AssetSetQueryModel} from "../../../ds-assets-list/ds-assets-list.component";
import {DsAssetsService} from "../../../../services/dsAssetsService";

export class SimpleQueryObjectModel {
  type: AssetTypeEnum = AssetTypeEnum.ALL;

  constructor(public searchText: string) {
  }
}

const TagModel = TaggingWidgetTagModel;

@Component({
  selector: "normlal-query-editor",
  styleUrls: ["basic-query-editor.component.scss"],
  templateUrl: "basic-query-editor.component.html"
})
export class BasicQueryEditor implements OnInit {
  createdFilOptns: string[] = ["Whenever", "Last 1 day", "Last 7 days", "Last 30 days"];
  createdIndxToDaysMap: number[] = [0,1,7,30];
  createdValueIndx: number = 0;
  ownerName:string = "";
  dbName:string = "";
  selectedTag:string = "";
  searchText:string = "";

  filterTags: TaggingWidgetTagModel[] = [];
  filterStateFlag: boolean = false;
  tagsAvailable: string[] = [];

  @ViewChild("outerCont") outerCont: ElementRef;
  @ViewChild("searchWidget") searchWidget: SearchWidget;

  @Input() queryObj: SimpleQueryObjectModel;
  @Input() queryModel: AssetSetQueryModel;
  @Input() clusterId:number;

  @Output("onQueryObjUpdate") notificationEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output("onHeightChange") heightEmitter: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild("searchInput") searchInput: ElementRef;

  constructor(private assetService: DsAssetsService) {}

  ngOnInit() {
    this.reset();
    this.assetService.tagsQuery(this.clusterId).subscribe(tags => {
      this.tagsAvailable = tags;
    });
  }

  onKeyDownAtSearch(event) {
    if(event.target.className.indexOf("searchWidgetCont") != -1)
      this.searchInput.nativeElement.focus();

  }

  onKeyUp(event){
    let keyCode = event.keyCode || event.which;
    if(keyCode === 13){
      this.notificationEmitter.emit("");
    }
  }

  reset() {
    this.clear_search();
    this.clear_ownerName();
    this.clear_tag();
    this.createdValueIndx = 0;
    this._fillFilterTags();
  }

  _fillFilterTags() {
    this.filterTags.splice(0, this.filterTags.length);
    if (this.createdValueIndx > 0) {
      this.filterTags.push(new TagModel(`Created: ${this.createdFilOptns[this.createdValueIndx]}`, "createdValueIndx"));
    }
    if (this.ownerName) {
      this.filterTags.push(new TagModel(`Owner: ${this.ownerName}`, "ownerName"));
    }
    if (this.dbName) {
      this.filterTags.push(new TagModel(`Db-Name: ${this.dbName}`, "dbName"));
    }
    if (this.selectedTag) {
      this.filterTags.push(new TagModel(`Tag: ${this.selectedTag}`, "tag"));
    }

  }

  removeFilter(deletedTagObj: TaggingWidgetTagModel) {
    console.log(deletedTagObj);
    this["clear_"+deletedTagObj.data]();
    this._fillFilterTags();
  }

  toggleFilterCont() {
    this.filterStateFlag = !this.filterStateFlag;
    (thisObj => setTimeout(() => thisObj.heightEmitter.emit(thisObj.outerCont.nativeElement.offsetHeight), 0))(this);
  }
  hideFilterCont() {
    this.filterStateFlag = true;
    this.toggleFilterCont();
  }

  onCreateTimeChange() {
    this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "createTime");
    if(this.createdValueIndx){
      var date = new Date();
      date.setDate(date.getDate() - this.createdIndxToDaysMap[this.createdValueIndx]);
      this.queryModel.filters.push({column: "createTime", operator: "gt", value: "'"+date.toISOString()+"'", dataType:"date"});
    }
    this._fillFilterTags();
  }
  clear_createdValueIndx() {
    this.createdValueIndx=0;
  }

  onSearchChange(e) {
    this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "name");
    if(this.searchText){
      this.queryModel.filters.push({column: "name", operator: "contains", value: this.searchText, dataType:"string"});
    }
  }
  clear_search() {
    this.searchText="";
    this.onSearchChange(null);
  }

  onOwnerNameChange(e) {
    this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "owner");
    if(this.ownerName){
      this.queryModel.filters.push({column: "owner", operator: "contains", value: this.ownerName, dataType:"string"});
    }
    this._fillFilterTags();
  }
  clear_ownerName() {
    this.ownerName="";
    this.onOwnerNameChange(null);
  }

  onDbNameChange(e) {
    this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "db.name");
    if(this.dbName){
      this.queryModel.filters.push({column: "db.name", operator: "contains", value: this.dbName, dataType:"string"});
    }
    this._fillFilterTags();
  }
  clear_dbName() {
    this.dbName="";
    this.onOwnerNameChange(null);
  }

  onTagSelectionChange (e) {
    this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "tag");
    if(this.selectedTag){
      if(this.tagsAvailable.indexOf(this.selectedTag) == -1) {
        this.selectedTag="";
        this._fillFilterTags();
        return;
      }
      this.queryModel.filters.push({column: "tag", operator: "equals", value: this.selectedTag, dataType:"tag"});
    }
    this._fillFilterTags();
  }
  clear_tag() {
    this.selectedTag="";
    this.onTagSelectionChange(null);
  }

}
