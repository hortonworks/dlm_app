import {Component, OnInit} from "@angular/core";
import {DatasetTag} from "../../../../models/dataset-tag";

@Component({
  selector: 'dp-dataset-dashboard',
  templateUrl: './dataset-dashboard.component.html',
  styleUrls: ['./dataset-dashboard.component.scss'],
})
export class DatasetDashboardComponent implements OnInit {

  private currentDsTag :DatasetTag = null;
  // constructor(){}

  ngOnInit () {

  }

  onTagChange (tagObj:DatasetTag){
    this.currentDsTag = tagObj;
  }
}
