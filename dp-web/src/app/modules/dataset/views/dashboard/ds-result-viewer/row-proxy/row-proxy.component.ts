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

import {Component, Input, Output, EventEmitter} from "@angular/core";
import {Router} from "@angular/router";
import {RichDatasetModel} from "../../../../models/richDatasetModel";

@Component({
  selector: "ds-row-proxy",
  styleUrls: ["./row-proxy.component.scss"],
  templateUrl: "./row-proxy.component.html"
})
export class DsRowProxy {

  @Input() datasetModels: RichDatasetModel[];
  @Output() onDeleteDataset: EventEmitter<number> = new EventEmitter();
  hoveredIndex: number;

  constructor(private router: Router) {
  }

  showFullView(dsModel) {
    this.router.navigate([`datasteward/dataset/full-view/${dsModel.id}`]);
  }

  deleteDataset(datasetId: number) {
    this.onDeleteDataset.emit(datasetId);
  }
}
