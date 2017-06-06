import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {AssetService} from '../../../services/asset.service';
import {TabStyleType} from '../../../shared/tabs/tabs.component';
import {AssetDetails, AssetProperty} from '../../../models/asset-property';


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

  assetDetails: AssetDetails;

  clusterId: string;
  guid: string;
  tableName: string;
  summary: AssetProperty[] = [];

  constructor(private route: ActivatedRoute, private assetService: AssetService) {
  }

  ngOnInit() {
    this.clusterId = this.route.snapshot.params['id'];
    this.guid = this.route.snapshot.params['guid'];
    this.assetService.getDetails(this.clusterId, this.guid).subscribe(details => {
      if (details.entity['typeName'] && details.entity['typeName'] !== 'hive_table') {
        return;
      }
      this.assetDetails = details;
      this.summary = this.extractSummary(details.entity);
    });
  }

  private extractSummary(entity) {
    let summary: AssetProperty[] = [];
    let qualifiedName = entity.attributes.qualifiedName;
    this.tableName = qualifiedName.slice(qualifiedName.indexOf('.') + 1, qualifiedName.indexOf('@'));
    summary.push(new AssetProperty('Datalake', qualifiedName.slice(qualifiedName.indexOf('@') + 1, qualifiedName.length)));
    summary.push(new AssetProperty('Database', qualifiedName.slice(0, qualifiedName.indexOf('.'))));
    let rowCount = 'NA';
    if (entity.attributes.profileData && entity.attributes.profileData.attributes) {
      rowCount = entity.attributes.profileData.attributes.rowCount;
    }
    summary.push(new AssetProperty('# of Rows', rowCount));

    return summary;
  }

}
