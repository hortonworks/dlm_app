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
  createdFilOptns: string[] = ["Whenever", "Last 30 days", "Last 60 days", "Last 90 days"];
  typeFilOptns: string[] = ["Any", "HIVE", "HDFS"];
  sizeFilOptns: string[] = ["Any", "> 100 rows", "> 1000 rows", "> 10000 rows"];
  dlFilOptns: string[] = ["Any", "Lake-1", "Lake-2"];
  ownerFilOptn: string[] = ["Whoever", "root", "Amit", "Vivek", "Kishore"];

  createdValueIndx: number = 0;
  typeValueIndx: number = 0;
  sizeValueIndx: number = 0;
  dLakeIndx: number = 0;
  ownerIndx: number = 0;

  filterTags: TaggingWidgetTagModel[] = [];
  filterStateFlag: boolean = false;

  @ViewChild("outerCont") outerCont: ElementRef;
  @ViewChild("searchWidget") searchWidget: SearchWidget;

  @Input() queryObj: SimpleQueryObjectModel;

  @Output("onQueryObjUpdate") notificationEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output("onHeightChange") heightEmitter: EventEmitter<number> = new EventEmitter<number>();

  ngOnInit() {
    this.copyQryObjToWidget();
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes["queryObj"]) {
      this.copyQryObjToWidget();
    }
  }

  copyQryObjToWidget() {
    const enm = AssetTypeEnum, type = this.queryObj.type;
    this.typeValueIndx = (type == enm.ALL) ? 0 : ((type == enm.HIVE) ? 1 : ((type == enm.HDFS) ? 2 : 0));
    this.ownerIndx = 0;
    this.createdValueIndx = 0;
    this.sizeValueIndx = 0;
    this.dLakeIndx = 0;
    this._fillFilterTags();
  }

  onNewSearch(text: string) {
    this.queryObj.searchText = text;
    this.notificationEmitter.emit("");
  }

  _fillFilterTags() {
    this.filterTags.splice(0, this.filterTags.length);
    if (this.createdValueIndx > 0) {
      this.filterTags.push(new TagModel(`Created: ${this.createdFilOptns[this.createdValueIndx]}`, "createdValueIndx"));
    }
    if (this.typeValueIndx > 0) {
      this.filterTags.push(new TagModel(`Type: ${this.typeFilOptns[this.typeValueIndx]}`, "typeValueIndx"));
    }
    if (this.sizeValueIndx > 0) {
      this.filterTags.push(new TagModel(`Size: ${this.sizeFilOptns[this.sizeValueIndx]}`, "sizeValueIndx"));
    }
    if (this.dLakeIndx > 0) {
      this.filterTags.push(new TagModel(`Datalake: ${this.dlFilOptns[this.dLakeIndx]}`, "dLakeIndx"));
    }
    if (this.ownerIndx > 0) {
      this.filterTags.push(new TagModel(`Owner: ${this.ownerFilOptn[this.ownerIndx]}`, "ownerIndx"));
    }
  }

  onFilterOptionChange() {
    this._fillFilterTags();
    const tmp = this.typeValueIndx, enm = AssetTypeEnum;
    this.queryObj.type = (tmp == 0) ? enm.ALL : ((tmp == 1) ? enm.HIVE : ((tmp == 2) ? enm.HDFS : enm.ALL));
    // this.notificationEmitter.emit("");
  }

  removeFilter(deletedTagObj: TaggingWidgetTagModel) {
    this[deletedTagObj.data] = 0;
    this.onFilterOptionChange();
  }

  toggleFilterCont() {
    this.filterStateFlag = !this.filterStateFlag;
    (thisObj => setTimeout(() => thisObj.heightEmitter.emit(thisObj.outerCont.nativeElement.offsetHeight), 0))(this);

  }
}
