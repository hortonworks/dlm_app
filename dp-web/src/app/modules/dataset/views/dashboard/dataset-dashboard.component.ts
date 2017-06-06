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
    this.router.navigate(["dataset/add"]);
  }
}
