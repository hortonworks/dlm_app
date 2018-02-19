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

import {Component, Input, Output, OnInit, SimpleChange, EventEmitter} from "@angular/core";
import {Lake} from "../../../../../models/lake";
import {LakeService} from "../../../../../services/lake.service";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {DsTagsService} from "../../../services/dsTagsService";

@Component({
  providers: [RichDatasetModel],
  selector: "ds-info-holder",
  styleUrls: ["./ds-info-holder.component.scss"],
  templateUrl: "./ds-info-holder.component.html"
})
export class DsInfoHolder implements OnInit {

  @Input() dsModel = new RichDatasetModel();
  @Input() tags: string[] = [];
  availableTags = [];
  lakes: Lake[];

  @Output('onNext') nextEE: EventEmitter<void> = new EventEmitter<void>();
  @Output('onCancel') cancelEE: EventEmitter<void> = new EventEmitter<void>();

  constructor(private lakeService: LakeService,
              private tagService: DsTagsService) {
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

  onTagSearchChange(text: string) {
    this.availableTags = [];
    text && this.tagService.list(text, 5).subscribe(tags => this.availableTags = tags);
  }

  onNewTagAddition(text: string) {
    this.tags.push(text);
  }

  onLakeSelectionChange() {
    const selectedLake = this.lakes.filter(lake => lake.id == this.dsModel.datalakeId)[0];
    this.dsModel.datalakeName = (selectedLake)?selectedLake.name:"";
    this.dsModel.clusterId = (selectedLake)?selectedLake.clusterId:null;
  }

  onStatusChange(){
    this.dsModel.sharedStatus = (this.dsModel.sharedStatus % 2) + 1;
  }
  onNext() {
    this.nextEE.emit();
  }

  onCancel() {
    this.cancelEE.emit();
  }

}
