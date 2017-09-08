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

import {Component, OnInit, ViewChild,ElementRef} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {RichDatasetModel} from "../../models/richDatasetModel";
import {RichDatasetService} from "../../services/RichDatasetService";
import {DataSetService} from "../../../../services/dataset.service";
import {
  AssetListActionsEnum,
  AssetSetQueryFilterModel,
  AssetSetQueryModel
} from "../ds-assets-list/ds-assets-list.component";

@Component({
  selector: "ds-full-view",
  styleUrls: ["./ds-full-view.component.scss"],
  templateUrl: "./ds-full-view.component.html",
})
export class DsFullView implements OnInit {

  @ViewChild('dialogConfirm') dialogConfirm: ElementRef;
  dsModel: RichDatasetModel = null;
  applicableListActions: AssetListActionsEnum[] = [];//[AssetListActionsEnum.EDIT];
  dsAssetQueryModel: AssetSetQueryModel;

  constructor(private richDatasetService: RichDatasetService,
              private dataSetService: DataSetService,
              private router: Router,
              private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.params
      .subscribe(params => {
        this.richDatasetService
          .getById(+params["id"])
          .subscribe(dsObj => this.dsModel = dsObj);
        this.dsAssetQueryModel = new AssetSetQueryModel([
          new AssetSetQueryFilterModel("dataset.id", "=", +params["id"], "-")
        ]);
      });
  }

  private onEdit(action: AssetListActionsEnum) {
    this.router.navigate([`datasteward/dataset/edit/${this.dsModel.id}`]);
  }

  onDeleteDataset() {
    this.dialogConfirm.nativeElement.showModal();
  }

  doConfirmDelete() {
    const delete$ = this.dataSetService.delete(this.dsModel.id).share();
    delete$
      .subscribe(() => {
        this.dialogConfirm.nativeElement.close();

        this.router.navigate([`datasteward/dataset`]);
      });
  }

  doCancelDelete() {
    this.dialogConfirm.nativeElement.close();
  }

}
