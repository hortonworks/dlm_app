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
  @Input() clusterId: string;
  @Input() guid: string;
  rowCount: string = 'NA';

  constructor(private assetService: AssetService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['assetDetails'] || !this.assetDetails) {
      return;
    }
    this.assetProperties = this.extractAssetProperties(this.assetDetails.entity);
    this.assetTags = this.extractTags(this.assetDetails.entity.classifications);
    if (this.assetDetails.entity.attributes.profileData && this.assetDetails.entity.attributes.profileData.attributes) {
      this.rowCount = this.assetDetails.entity.attributes.profileData.attributes.rowCount;
    }
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
      if (referredEntities[key].typeName !== 'hive_column' || referredEntities[key].status === 'DELETED') {
        return;
      }
      let attributes = referredEntities[key].attributes;
      let schema: AssetSchema = new AssetSchema();
      schema.name = attributes.name;
      schema.type = attributes.type;
      schema.comment = attributes.comment;
      let profileData = attributes.profileData ? attributes.profileData.attributes : null;
      if (profileData) {
        this.populateProfileData(schema, profileData)
      }
      assetSchemas.push(schema);
    });
    return assetSchemas;
  }

  private populateProfileData(schema: AssetSchema, profileData: any) {
    let type = schema.type.toLowerCase();
    if (type.indexOf('int') >= 0 || type.indexOf('decimal') >= 0 || type.indexOf('long') >= 0 || type.indexOf('float') >= 0 || type.indexOf('double') >= 0) {
      schema.min = profileData.minValue;
      schema.max = profileData.maxValue;
      schema.mean = profileData.meanValue;
    }
    schema.noOfUniques = profileData.cardinality;
    schema.noOfNulls = this.rowCount !== 'NA' ? (parseInt(this.rowCount, 10) - profileData.nonNullData).toString() : 'NA';
  }

  private extractAssetProperties(properties) {
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
