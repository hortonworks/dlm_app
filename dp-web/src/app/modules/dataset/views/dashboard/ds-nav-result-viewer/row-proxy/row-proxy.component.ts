import {Component, Input, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../../../models/richDatasetModel";
import {Router} from "@angular/router";

@Component({
  selector: 'ds-row-proxy',
  templateUrl: './row-proxy.component.html',
  styleUrls: ['./row-proxy.component.scss'],
})
export class DsRowProxy implements OnInit {

  @Input() datasetModels : RichDatasetModel[];
  constructor (private router: Router) {}

  ngOnInit () {}
  
  hoveredIndex:number;

  showFullView (dsModel) {
    this.router.navigate(['dataset/full-view/' + dsModel.id]);
  }
}
