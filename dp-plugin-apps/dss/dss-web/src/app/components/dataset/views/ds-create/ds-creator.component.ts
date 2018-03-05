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
import {LakeService} from "../../../../services/lake.service";
import {Lake} from "../../../../models/lake";
import {RichDatasetService} from "../../services/RichDatasetService";
import {AssetSetQueryFilterModel, AssetSetQueryModel} from "../ds-assets-list/ds-assets-list.component";
import {DataSetAndCategories, DataSetAndTags} from "../../../../models/data-set";

@Component({
  providers: [RichDatasetModel],
  selector: "ds-creator",
  styleUrls: ["./ds-creator.component.scss"],
  templateUrl: "./ds-creator.component.html"
})

export class DsCreator implements OnInit {

	dsModel = new RichDatasetModel();
	tags: string[] = [];
	availableTags = [];
	lakes: Lake[];
	@ViewChild("fillMandatoryMsg") fillMandatoryMsg: ElementRef;

	constructor(
		private lakeService: LakeService,
        private richDatasetService: RichDatasetService,
        private tagService: DsTagsService,
        private router: Router,
        private activeRoute: ActivatedRoute) {
  	}

	ngOnInit() {
	    !this.dsModel.datalakeId && (this.dsModel.datalakeId=0);
	    this.lakeService.listWithClusters('lake').subscribe(objs => {
	      this.lakes =[];
	      objs.forEach(obj => {
	        obj.clusters.length && (obj.data.clusterId = obj.clusters[0].id);
	        this.lakes.push(obj.data as Lake);
	      })
	    });
	    this.dsModel.sharedStatus = 1;
  	}

  	onLakeSelectionChange() {
		const selectedLake = this.lakes.filter(lake => lake.id == this.dsModel.datalakeId)[0];
		this.dsModel.datalakeName = (selectedLake)?selectedLake.name:"";
		this.dsModel.clusterId = (selectedLake)?selectedLake.clusterId:null;
	}

	onTagSearchChange(text: string) {
		this.availableTags = [];
		text && this.tagService.list(text, 5).subscribe(tags => this.availableTags = tags);
	}

	onNewTagAddition(text: string) {
    	this.tags.push(text);
	}

	onStatusChange(){
    	this.dsModel.sharedStatus = (this.dsModel.sharedStatus % 2) + 1;
	}

	actionCancel() {
		this.router.navigate(["dss/collections"]);
	}

	actionNext () {
		if (!(this.dsModel.name && this.dsModel.description && this.dsModel.datalakeId)) {
			this.fillMandatoryMsg.nativeElement.style.display="block";
			setTimeout(()=>this.fillMandatoryMsg.nativeElement.style.display="none", 3000);
			return;
    	}
    	this.richDatasetService
		.saveDataset(this.getDataSetAndTags())
		.subscribe(rDataSet => {
			this.dsModel = rDataSet
			this.router.navigate([`dss/collections/${rDataSet.id}`]);
		})
	}

	getDataSetAndTags() : DataSetAndTags {
	    const rData:RichDatasetModel = this.dsModel, tags=this.tags;
	    return {
	      dataset : {
	        "id": rData.id || 0,
	        "name": rData.name,
	        "description": rData.description,
	        "dpClusterId": parseInt(rData.datalakeId as any),
	        "createdBy": rData.creatorId || 0,
	        "createdOn": rData.createdOn,
	        "lastModified": rData.lastModified,
	        "active": true,
	        "version": 1,
	        "sharedStatus": rData.sharedStatus
	      },
	      tags : tags
	    } as DataSetAndTags;
	}
}