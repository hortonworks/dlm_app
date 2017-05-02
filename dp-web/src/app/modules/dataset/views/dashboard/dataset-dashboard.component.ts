import {Component, OnInit} from "@angular/core";
import {DatasetTag} from "../../../../models/dataset-tag";

@Component({
  selector: 'dp-dataset-dashboard',
  templateUrl: './dataset-dashboard.component.html',
  styleUrls: ['./dataset-dashboard.component.scss'],
})
export class DatasetDashboardComponent implements OnInit {

  public currentDsTag :DatasetTag = null;
  public static GRID_VIEW : string = "grid";
  public static LIST_VIEW : string = "list"
  currentView : string;
  // constructor(){}

  ngOnInit () {
    this.currentView = DatasetDashboardComponent.GRID_VIEW;
  }

  onTagChange (tagObj:DatasetTag){
    this.currentDsTag = tagObj;
  }

  onViewChange(view){
    this.currentView = view;
  }
}
