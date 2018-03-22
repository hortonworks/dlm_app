import {Component, Input, isDevMode, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AssetDetails, AssetEntityClassification} from '../../../../../models/asset-property';
import {AssetTag} from '../../../../../models/asset-tag';
import {StringUtils} from '../../../../../shared/utils/stringUtils';

@Component({
  selector: 'dss-asset-view-aside-summary',
  templateUrl: './asset-view-aside-summary.component.html',
  styleUrls: ['./asset-view-aside-summary.component.scss']
})
export class AssetViewAsideSummaryComponent implements OnChanges {
  showProperties = true;
  showTags = true;
  showProfilers = true;
  assetPrefix = isDevMode() ? ' ' : 'dss';
  assetTags: AssetTag[] = [];

  @Input() assetDetails = new AssetDetails();

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.assetTags = this.extractTags(this.assetDetails.entity.classifications);
  }

  private extractTags(classifications: AssetEntityClassification[]) {
    const assetTags: AssetTag[] = [];
    classifications.forEach(classification => {
      const tag = new AssetTag();
      tag.name = classification.typeName;
      tag.attributes = classification.attributes ? (typeof classification.attributes === 'object' ?
        StringUtils.getFlattenedObjects(classification.attributes) : classification.attributes) : 'NA';
      assetTags.push(tag);
    });
    return assetTags;
  }

  togglePane(val: boolean) {
    val = !val;
  }

}
