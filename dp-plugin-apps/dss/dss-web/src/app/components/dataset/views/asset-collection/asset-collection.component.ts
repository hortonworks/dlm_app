import { Component, OnInit } from '@angular/core';
import {RichDatasetService} from '../../services/RichDatasetService';
import {ActivatedRoute} from '@angular/router';
import {RichDatasetModel} from "app/components/dataset/models/richDatasetModel";

declare var d3: any;
declare var nv: any;

export enum Tabs {
  OVERVIEW, ASSETS, POLICIES, PROFILERS
}

@Component({
  selector: 'dss-asset-collection',
  templateUrl: './asset-collection.component.html',
  styleUrls: ['./asset-collection.component.scss']
})

export class AssetCollectionComponent implements OnInit {

  tabEnum = Tabs;
  selectedTab = Tabs.OVERVIEW;
  dsModel = new RichDatasetModel();

  constructor(private richDatasetService: RichDatasetService,
              private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activeRoute.params.subscribe(params => {
      const assetCollectionId = params["id"];
      this.richDatasetService.getById(assetCollectionId).subscribe(dsObj => this.dsModel = dsObj);
    });
  }

}
