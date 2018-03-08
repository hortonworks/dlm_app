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

import {Component, OnInit, ViewChild, ElementRef} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {DatasetTag} from "../../../../models/dataset-tag";
import {ViewsEnum} from "../../../../shared/utils/views";
import {NavTagPanel} from "./nav-tag-panel/nav-tag-panel.component";

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
  bookmarkFilter  = false;

  @ViewChild('tagViewer') tagViewer: NavTagPanel;

  constructor(private router: Router,
              private route: ActivatedRoute) {
    this.route.data.subscribe( params => {
      this.bookmarkFilter = (params['filter'] && params['filter'] === 'bookmark'); //currently this filter ,if present, is always 'bookmark' filter
    });
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
    this.router.navigate(["dss/collections/add"]);
  }

  dsNameSearchChange(event) {
    this.dsNameSearch = event.target.value;
  }

  onViewRefresh() {
    this.tagViewer && this.tagViewer.fetchList();
  }

  clearSearch(){
    this.dsNameSearch = '';
  }
}
