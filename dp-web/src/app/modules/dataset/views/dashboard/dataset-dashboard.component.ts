import {Component, OnInit} from "@angular/core";
import {DatasetTag} from "../../../../models/dataset-tag";
import {ViewsEnum} from "../../../../shared/utils/views";


@Component({
  selector: 'dp-dataset-dashboard',
  templateUrl: './dataset-dashboard.component.html',
  styleUrls: ['./dataset-dashboard.component.scss'],
})

export class DatasetDashboardComponent implements OnInit {

  public currentDsTag :DatasetTag = null;
  public views = ViewsEnum;
  currentView : ViewsEnum;
  // constructor(){}

  ngOnInit () {
    this.currentView = this.views.list;
  }

  onTagChange (tagObj:DatasetTag){
    this.currentDsTag = tagObj;
  }

  onViewChange(view){
    this.currentView = view;
  }
}
