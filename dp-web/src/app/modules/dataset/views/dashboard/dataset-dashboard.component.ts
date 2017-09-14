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

import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {DatasetTag} from "../../../../models/dataset-tag";
import {ViewsEnum} from "../../../../shared/utils/views";

@Component({
  selector: "dp-dataset-dashboard",
  styleUrls: ["./dataset-dashboard.component.scss"],
  templateUrl: "./dataset-dashboard.component.html",
})

export class DatasetDashboardComponent implements OnInit {

  currentDsTag: DatasetTag = null;
  dsNameSearch : string = "";
  views = ViewsEnum;
  currentView: ViewsEnum;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.currentView = this.views.list;
  }

  onTagChange(tagObj: DatasetTag) {
    this.currentDsTag = tagObj;
  }

  onViewChange(view) {
    this.currentView = view;
  }

  actionAddNewDataset() {
    this.router.navigate(["datasteward/dataset/add"]);
  }

  dsNameSearchChange(event) {
    this.dsNameSearch = event.target.value;
  }

  clearSearch(){
    this.dsNameSearch = '';
  }
}
