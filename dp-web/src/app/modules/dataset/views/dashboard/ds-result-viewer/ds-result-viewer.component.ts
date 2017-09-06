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

import {Component, Input, ViewChild, OnInit, SimpleChange, ElementRef} from "@angular/core";
import {DatasetTag} from "../../../../../models/dataset-tag";
import {ViewsEnum} from "../../../../../shared/utils/views";
import {RichDatasetModel} from "../../../models/richDatasetModel";
import {RichDatasetService} from "../../../services/RichDatasetService";
import {DataSetService} from "../../../../../services/dataset.service";

@Component({
  selector: "ds-nav-result-viewer",
  styleUrls: ["./ds-result-viewer.component.scss"],
  templateUrl: "./ds-result-viewer.component.html",
})
export class DsNavResultViewer {

  @Input() currentDsTag: DatasetTag;
  @Input() view;
  @Input() dsNameSearch:string = "";
  @ViewChild('dialogConfirm') dialogConfirm: ElementRef;

  _datasetToDelete: RichDatasetModel;
  _deleteWasSuccessful = false;

  datasetModels: RichDatasetModel[] = null;
  views = ViewsEnum;
  start: number = 1;
  limit: number = 10;

  private currentPage: number = 1;

  constructor(
    private dataSetService: DataSetService,
    private richDatasetService: RichDatasetService,
  ) {
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if ((changes["dsNameSearch"] && !changes["dsNameSearch"].firstChange)
      || changes["currentDsTag"] && !changes["currentDsTag"].firstChange) {
      this.getDataset();
    }
  }

  getDataset() {
    this.datasetModels = null;
    this.richDatasetService.listByTag(this.currentDsTag.name, this.dsNameSearch, this.start-1, this.limit)
      .subscribe(result => this.datasetModels = result);
  }

  onPageChange(start) {
    this.start = start;
    this.getDataset();
  }

  onSizeChange(limit) {
    this.start = 1;
    this.limit = limit;
    this.getDataset();
  }

  onDeleteDataset(datasetId: number) {
    this._datasetToDelete = this.datasetModels.find(cDataset => cDataset.id === datasetId);
    this.dialogConfirm.nativeElement.showModal();
  }

  doConfirmDelete() {
    const delete$ = this.dataSetService.delete(this._datasetToDelete.id).share();

    delete$.subscribe(() => this.getDataset());
    delete$
      .do(() => this._deleteWasSuccessful = true)
      .delay(2000)
      .subscribe(() => {
        this._datasetToDelete = null;
        this._deleteWasSuccessful = false;

        this.dialogConfirm.nativeElement.close();
      });
  }

  doCancelDelete() {
    this.dialogConfirm.nativeElement.close();
  }
}
