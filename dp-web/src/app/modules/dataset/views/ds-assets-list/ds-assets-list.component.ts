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
import {DsAssetModel} from "../../models/dsAssetModel";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {DsAssetsService} from "../../services/dsAssetsService";
import {Router} from "@angular/router";

export enum AssetTypeEnum { ALL, HIVE, HDFS}

export let AssetTypeEnumString = ["all", "hive", "file"];
export enum AssetListActionsEnum {EDIT, REMOVE, ADD}
export class AssetSetQueryFilterModel {
  constructor(public column: string, public operator: string, public value: (string | number | boolean), public dataType: string) {
  }
}
class ASQFM extends AssetSetQueryFilterModel {}

export class AssetSetQueryModel {
  constructor(public filters: AssetSetQueryFilterModel[]) {
  }
}
class ASQM extends AssetSetQueryModel {}

enum ResultState { LOADING, LOADED, EMPTY, NOMORE}
@Component({
  selector: "ds-assets-list",
  styleUrls: ["./ds-assets-list.component.scss"],
  templateUrl: "./ds-assets-list.component.html",
})
export class DsAssetList implements OnInit {

  @Input() dsModel: RichDatasetModel;
  @Input() applicableActions: AssetListActionsEnum[];
  @Input() hideTabs: boolean = false;
  @Input() hideSearch: boolean = false;
  @Input() innerListScrollable: boolean = false;
  @Input() selectionAllowed: boolean = true;
  @Input() queryModels: (ASQM | ASQM[]);
  @Input() avoidLoadingOnInit: boolean = false;
  @Input() searchText: string = "";
  @Input() typeFilter: AssetTypeEnum = AssetTypeEnum.ALL;
  @Input() clusterId:number;
  @Input() allowAssetNavigation : boolean = true;
  @Input() showBelongsToColumn : boolean = false;

  @ViewChild("table") table: ElementRef;
  @ViewChild("outerCont") outerCont: ElementRef;
  @ViewChild("listCont") listCont: ElementRef;

  @Output("onAction")
  actionEmitter: EventEmitter<AssetListActionsEnum> = new EventEmitter<AssetListActionsEnum>();

  pageSizeOptions: number[] = [10, 15, 20, 50, 100, 150, 200];
  pageSize: number = 20;
  pageStartIndex: number = 1;
  assetsCount: number = 0;
  dsAssets: DsAssetModel[] = [];
  tab = AssetTypeEnum;
  actionEnum = AssetListActionsEnum;
  resultState:ResultState = ResultState.LOADED;
  resultStates = ResultState;
  private tableHeight: number = 0;
  private totalPages: number = 1;
  private initDone: boolean = false;

  constructor(private dsAssetsService: DsAssetsService
  ,           private router: Router) {
  }
  ngOnInit() {
    if (this.innerListScrollable) {
      this.outerCont.nativeElement.classList.add("innerListScrollable");
    }
    this.setTableHeight();
    if(!this.avoidLoadingOnInit) {
      this.fetchAssets();
    }
    this.initDone = true;
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if(this.initDone && (changes["dsModel"] || changes["searchText"] || changes["queryModels"] || changes["pageSize"])) {
      this.fetchAssets();
    }
  }

  setFirstPage() {
    this.pageStartIndex = 1;
  }

  clearResults() {
    this.dsAssets = [];
    this.totalPages = this.assetsCount = 0;
  }

  fetchAssets() {
    this.dsAssets = [];
    let asqms = this.getQueryModelsForAssetService(true);
    const tab = this.tab, tpfltr = this.typeFilter;
    this.resultState = this.resultStates.LOADING
    if(this.dsModel && this.dsModel.counts) {
      this.assetsCount = this.dsModel.counts.hiveCount + this.dsModel.counts.filesCount;
      this.totalPages = Math.ceil(this.assetsCount / this.pageSize);
    }
    else
      this.totalPages = this.assetsCount = Infinity;

    //TODO there must be a separate count query with all filters instead of hard coding assetsCount
    asqms = this.getQueryModelsForAssetService(false);
    this.dsAssetsService.list(asqms, Math.ceil(this.pageStartIndex / this.pageSize), this.pageSize, this.clusterId)
      .subscribe(assets => {
        this.dsAssets = assets;
        setTimeout(() => this.setTableHeight(), 0);
        this.resultState = (this.dsAssets.length)?this.resultStates.LOADED:(this.pageStartIndex==1)?this.resultStates.EMPTY:this.resultStates.NOMORE;
      });
  }

  calcTableHeight() {
    let heightAboveTable = this.table.nativeElement.offsetTop - this.listCont.nativeElement.offsetTop;
    const paginationHeight = this.listCont.nativeElement.offsetHeight - this.table.nativeElement.offsetHeight - heightAboveTable;
    heightAboveTable = this.table.nativeElement.offsetTop - this.outerCont.nativeElement.offsetTop;
    return this.tableHeight = this.outerCont.nativeElement.offsetHeight - heightAboveTable - paginationHeight;
  }

  setTableHeight() {
    this.table.nativeElement.style.height = "auto";
    this.table.nativeElement.style.height =
      `${((this.innerListScrollable) ? this.calcTableHeight() : this.table.nativeElement.offsetHeight)}px`;
  }

  resize() {
    this.tableHeight = 0;
    this.setTableHeight();
  }

  onPageSizeChange(size: number) {
    this.setFirstPage();
    this.pageSize = size;
    this.fetchAssets();
  }

  onPageChange(index: number) {
    if(this.pageStartIndex < index && this.dsAssets.length < this.pageSize) {
      this.pageStartIndex = index;
      setTimeout(()=>this.pageStartIndex = index-this.pageSize, 0);
      return;
    }
    this.pageStartIndex = index;
    this.fetchAssets();
  }

  actionAddMore() {
    this.actionEmitter.emit(this.actionEnum.ADD);
  }

  actionRemove() {
    this.actionEmitter.emit(this.actionEnum.REMOVE);
  }

  actionEdit() {
    this.actionEmitter.emit(this.actionEnum.EDIT);
  }

  getQueryModelsForAssetService(countQuery: boolean) {
    const asqms: ASQM[] = [], asqmsClone: ASQM[] = [], qmdls = this.queryModels;
    if(qmdls) { // make sure its an array of asqm
      asqms.push.apply(asqms, (qmdls.constructor.name == "Array") ? qmdls : [qmdls]);
    }
    if (!asqms.length) { // make sure its not empty
      asqms.push(new ASQM([]));
    }
    asqms.forEach(asqm => {
      const newAsqm = new ASQM([]);
      newAsqm.filters.push.apply(newAsqm.filters, asqm.filters);
      if (!this.hideSearch && this.searchText) {
        newAsqm.filters.push({column: "name", operator: "contains", value: this.searchText, dataType:"string"});
      }
      // if (!this.hideTabs && !countQuery) {
      //   newAsqm.filters.push({column: "asset.source", operator: "==", value: AssetTypeEnumString[this.typeFilter], dataType:"-"});
      // }
      asqmsClone.push(newAsqm);
    });
    return asqmsClone;
  }
  onAssetClick(id:any, clusterId:number) {
    // console.log(id, clusterId);
    if(this.allowAssetNavigation && clusterId) {
      this.router.navigate([`datasteward/clusters/${clusterId}/assets/${id}`]);
    }
  }

  get showStarMessage() {
    return this.dsAssets.filter(ass=>ass.dsName).length;
  }
}
