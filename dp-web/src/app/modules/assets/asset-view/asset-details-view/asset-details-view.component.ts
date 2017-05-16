import { Component, OnInit } from '@angular/core';
import {TabStyleType} from '../../../../shared/tabs/tabs.component';

export enum DetailsTabs {
  PROPERTIES, TAGS, AUDITS, SCHEMA
}

@Component({
  selector: 'dp-asset-details-view',
  templateUrl: './asset-details-view.component.html',
  styleUrls: ['./asset-details-view.component.scss']
})
export class AssetDetailsViewComponent implements OnInit {

  tabType = TabStyleType;
  detailsTabs = DetailsTabs;
  selectedDetailsTabs = DetailsTabs.PROPERTIES;

  ngOnInit() {
  }
}
