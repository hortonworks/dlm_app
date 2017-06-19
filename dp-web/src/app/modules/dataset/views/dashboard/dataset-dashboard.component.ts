import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {DatasetTag} from "../../../../models/dataset-tag";
import {ViewsEnum} from "../../../../shared/utils/views";
import {CollapsibleNavService} from '../../../../services/collapsible-nav.service';

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

  constructor(private router: Router,
              private collapsibleNavService: CollapsibleNavService) {
  }

  ngOnInit() {
    this.currentView = this.views.list;
    this.collapsibleNavService.collpaseSideNav.next(true);
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

  dsNameSearchChange(event) {
    this.dsNameSearch = event.target.value;
  }
}
