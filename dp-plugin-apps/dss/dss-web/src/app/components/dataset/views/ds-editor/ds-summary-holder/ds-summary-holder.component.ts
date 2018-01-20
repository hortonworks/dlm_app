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

import {Component, Input, Output, OnInit, EventEmitter} from "@angular/core";
import {RichDatasetModel} from "../../../models/richDatasetModel";

@Component({
  providers: [RichDatasetModel],
  selector: "ds-summary-holder",
  styleUrls: ["./ds-summary-holder.component.scss"],
  templateUrl: "./ds-summary-holder.component.html"
})
export class DsSummaryHolder {
  @Input() dsModel: RichDatasetModel;
  @Input() tags: string[] = [];

  @Output('onSave') saveEE: EventEmitter<void> = new EventEmitter<void>();
  @Output('onCancel') cancelEE: EventEmitter<void> = new EventEmitter<void>();

  onSave() {
    this.saveEE.emit();
  }

  onCancel() {
    this.cancelEE.emit();
  }
}
