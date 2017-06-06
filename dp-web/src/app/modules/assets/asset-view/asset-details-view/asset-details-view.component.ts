import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TabStyleType} from '../../../../shared/tabs/tabs.component';
import {AssetService} from '../../../../services/asset.service';
import {AssetProperty} from '../../../../models/asset-property';
import {AssetTag} from '../../../../models/asset-tag';
import {AssetSchema} from '../../../../models/asset-schema';
import {DateUtils} from '../../../../shared/utils/date-utils';

export enum DetailsTabs {
  PROPERTIES, TAGS, SCHEMA
}

@Component({
  selector: 'dp-asset-details-view',
  templateUrl: './asset-details-view.component.html',
  styleUrls: ['./asset-details-view.component.scss']
})
export class AssetDetailsViewComponent implements OnChanges {

  tabType = TabStyleType;
  detailsTabs = DetailsTabs;
  selectedDetailsTabs = DetailsTabs.PROPERTIES;
  assetProperties: AssetProperty[] = [];
  assetTags: AssetTag[] = [];
  assetSchemas: AssetSchema[] = [];
  @Input() assetDetails;
  @Input() clusterId: string = '1989';
  @Input() guid: string = '1cb2fd1e-03b4-401f-a587-2151865d375a';

  constructor(private assetService: AssetService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['assetDetails'] || !this.assetDetails) {
      return;
    }
    this.assetProperties = this.extractAssetProperties(this.assetDetails.entity);
    this.assetTags = this.extractTags(this.assetDetails.entity.classifications);
    this.assetSchemas = this.extractSchema(this.assetDetails.referredEntities);
  }

  private extractTags(classifications) {
    let assetTags: AssetTag[] = [];
    classifications.forEach(classification => {
      let tag = new AssetTag();
      tag.name = classification.typeName;
      tag.attributes = classification.attributes ? classification.attributes : 'NA';
      assetTags.push(tag);
    });
    return assetTags;
  }

  private extractSchema(referredEntities) {
    let assetSchemas: AssetSchema[] = [];
    Object.keys(referredEntities).forEach(key => {
      if (referredEntities[key].typeName !== 'hive_column') {
        return;
      }
      let schema: AssetSchema = new AssetSchema();
      let attributes = referredEntities[key].attributes;
      schema.name = attributes.name;
      schema.owner = attributes.owner;
      schema.description = attributes.description;
      schema.type = attributes.type;
      schema.comment = attributes.comment;
      assetSchemas.push(schema);
    });
    return assetSchemas;
  }

  private extractAssetProperties(properties){
    let assetProps: AssetProperty[] = [];
    let attributes = properties.attributes;
    Object.keys(attributes).forEach(key => {
      if (key === 'columns' || key === 'sd' || key === 'parameters') {
        return;
      }
      let property = new AssetProperty(key);
      property.value = attributes[key];
      if (key === 'profileData' && attributes[key]) {
        let rowCount = attributes[key].attributes['rowCount'];
        property.value = `Row Count: ${rowCount}`;
      } else if (key === 'db') {
        property.value = attributes.qualifiedName.slice(0, attributes.qualifiedName.indexOf('.'));
      } else if (key === 'lastAccessTime' || key === 'createTime') {
        property.value = DateUtils.formatDate(attributes[key], 'DD MMM YYYY hh:mm:ss A');
      }
      assetProps.push(property);
    });
    return assetProps;
  }
}
