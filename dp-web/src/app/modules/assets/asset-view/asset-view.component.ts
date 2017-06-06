import { Component, OnInit } from '@angular/core';
import {TabStyleType} from '../../../shared/tabs/tabs.component';
import {Router, ActivatedRoute, Params} from '@angular/router';


export enum TopLevelTabs {
  DETAILS, LINEAGE, AUDIT, REPLICATION
}

@Component({
  selector: 'dp-asset-view',
  templateUrl: './asset-view.component.html',
  styleUrls: ['./asset-view.component.scss']
})

export class AssetViewComponent implements OnInit {
  tabType = TabStyleType;
  topLevelTabs = TopLevelTabs;

  selectedTopLevelTabs = TopLevelTabs.DETAILS;

  clusterId: string;
  guid: string;

  constructor( private route: ActivatedRoute) { }

  ngOnInit() {
    this.clusterId = this.route.snapshot.params['id'];
    this.guid = this.route.snapshot.params['guid'];
  }

}
