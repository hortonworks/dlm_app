import { Component, OnInit } from '@angular/core';
import {TabStyleType} from '../../../shared/tabs/tabs.component';

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

  constructor() { }

  ngOnInit() {
  }

}
