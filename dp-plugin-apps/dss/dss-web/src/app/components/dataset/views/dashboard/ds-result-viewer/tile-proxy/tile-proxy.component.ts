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
  selector: "ds-tile-proxy",
  styleUrls: ["./tile-proxy.component.scss"],
  templateUrl: "./tile-proxy.component.html"
})

export class DsTileProxy {

  @Input() dsModel: RichDatasetModel;
  @Output() onDeleteDataset: EventEmitter<number> = new EventEmitter();

  constructor(private router: Router) {
  }

  getID() {
    return `dropDownIcon_${this.dsModel.id}`;
  }

  showFullView($event) {
    if ($event.target.tagName != "I") {
      this.router.navigate(['dss/collections', this.dsModel.id]);
    }
  }

  preventEvent($event) {
    $event.stopPropagation();
  }

  deleteDataset(datasetId: number) {
    this.onDeleteDataset.emit(datasetId);
  }
}
