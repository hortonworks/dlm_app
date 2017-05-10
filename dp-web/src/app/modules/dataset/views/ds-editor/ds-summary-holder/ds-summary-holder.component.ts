import {Component, Input, OnInit} from "@angular/core";
import {RichDatasetModel} from "../../../models/richDatasetModel";

@Component({
  selector: 'ds-summary-holder',
  templateUrl: './ds-summary-holder.component.html',
  styleUrls: ['./ds-summary-holder.component.scss'],
  providers:[RichDatasetModel]
})
export class DsSummaryHolder implements OnInit {

  @Input() dsModel: RichDatasetModel;
  @Input() tags:string[] = [];

  constructor () {}
  ngOnInit() {}
}
