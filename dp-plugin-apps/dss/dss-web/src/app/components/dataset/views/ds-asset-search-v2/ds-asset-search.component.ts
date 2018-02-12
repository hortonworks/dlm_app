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
 
import {Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit} from "@angular/core";
import {AssetSetQueryModel, DsAssetList, AssetListActionsEnum} from "../ds-assets-list/ds-assets-list.component";
import {AdvanceQueryEditor} from "../ds-asset-search/queryEditors/advance/advance-query-editor.component";
import {DsAssetsService} from "../../services/dsAssetsService";

@Component({
	selector: "asset-search",
	styleUrls: ["./ds-asset-search.component.scss"],
	templateUrl: "./ds-asset-search.component.html"
})
export class DsAssetSearch implements OnInit {

	@Input() clusterId:number;
	@Input() showBelongsToColumn = false;

	@Output("doneNotification") doneNotificationEmitter: EventEmitter<AssetSetQueryModel> = new EventEmitter<AssetSetQueryModel>();
	@Output("cancelNotification") cancelNotificationEmitter: EventEmitter<null> = new EventEmitter<null>();

	@ViewChild("dsAssetList") dsAssetList: DsAssetList;

	queryModel: AssetSetQueryModel = new AssetSetQueryModel([]);
	searchText:string = "";
	ownerName:string = "";
	dbName:string = "";
	selectedTag:string = ""
	tagOptions:string[] = [];
	hideActionButtonCont :boolean=false;
	showQueryResults: boolean = false;
	resultStartIndx:number=0;
	resultEndIndx:number=0;
	allSelected:boolean=false;
	cherryPicked:number=0;
	cherryDroped:number=0;

	constructor(private assetService: DsAssetsService) {}

	ngOnInit() {
		this.assetService.tagsQuery(this.clusterId).subscribe(tags => {
			this.tagOptions = tags;
		});
	}

	freshFetch() {
		if(this.queryModel.filters.length == 0) {
			this.cherryPicked = this.cherryDroped = 0; 
			this.allSelected=false;
			return this.showQueryResults = false;
		}
		this.showQueryResults = true;
		this.resultStartIndx = 0;
		setTimeout(()=>this.dsAssetList.freshFetch(), 100);
	}

	onSearchTextChange(e:any) {
		this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "name");
		if(this.searchText){
			this.queryModel.filters.push({column: "name", operator: "contains", value: this.searchText, dataType:"string"});
		}
		this.freshFetch();
	}
	onOwnerNameChange(e) {
		this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "owner");
		if(this.ownerName){
			this.queryModel.filters.push({column: "owner", operator: "contains", value: this.ownerName, dataType:"string"});
		}
		this.freshFetch();
	}
	clearOwnerName() {
		this.ownerName="";
		this.onOwnerNameChange(null);
	}
	onDbNameChange(e) {
		this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "db.name");
		if(this.dbName){
			this.queryModel.filters.push({column: "db.name", operator: "contains", value: this.dbName, dataType:"string"});
		}
		this.freshFetch();
	}
	clearDbName() {
		this.dbName="";
		this.onDbNameChange(null);
	}
	onTagSelectionChange (e) {
		console.log(this.selectedTag);
		this.queryModel.filters = this.queryModel.filters.filter(fil => fil.column != "tag");
		if(this.dbName){
			this.queryModel.filters.push({column: "tag", operator: "contains", value: this.dbName, dataType:"tag"});
		}
		this.freshFetch();
	}
	clearTag() {
		this.selectedTag="";
		this.onTagSelectionChange(null);
	}

	onListAction (action) {
		switch (action) {
			case AssetListActionsEnum.RELOADED :
					this.resultStartIndx = this.dsAssetList.pageStartIndex;
					this.resultEndIndx = this.dsAssetList.pageEndIndex;
					break;	

			case AssetListActionsEnum.SELECTIONCHANGE :
					this.cherryPicked = this.cherryDroped = 0; this.allSelected=false;
					if(this.dsAssetList.selectState !== this.dsAssetList.selStates.CHECKSOME)
						(this.allSelected = true) && (this.cherryDroped = this.dsAssetList.selExcepList.length)
					else
						this.cherryPicked = this.dsAssetList.selExcepList.length
		}
	}
	onAddAssetToList () {
		if(!this.allSelected && !this.cherryPicked && !this.cherryDroped) return this.onCancel();
		this.hideActionButtonCont = true;
    	this.dsAssetList.updateQueryModels();
    	this.doneNotificationEmitter.emit(this.queryModel);
	}

	onCancel () {
		this.cancelNotificationEmitter.emit();
	}
}