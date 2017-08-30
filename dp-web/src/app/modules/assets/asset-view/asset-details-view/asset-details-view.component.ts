/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TabStyleType} from '../../../../shared/tabs/tabs.component';
import {AssetService} from '../../../../services/asset.service';
import {AssetProperty} from '../../../../models/asset-property';
import {AssetTag} from '../../../../models/asset-tag';
import {AssetSchema} from '../../../../models/asset-schema';
import {DateUtils} from '../../../../shared/utils/date-utils';
import {StringUtils} from "../../../../shared/utils/stringUtils";

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
  colGuid : string = "";

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
      schema.guid = key;
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
    schema.noOfNulls = this.rowCount !== 'NA' ? (parseInt(this.rowCount, 10) - profileData.nonNullCount).toString() : 'NA';
  }

  private extractAssetProperties(properties) {
    let assetProps: AssetProperty[] = [];
    let attributes = properties.attributes;
    Object.keys(attributes).forEach(key => {
      if (key === 'columns' || key === 'sd' || key === 'parameters') {
        return;
      }
      let value = attributes[key];
      if (attributes[key] && typeof attributes[key] === 'object' || Array.isArray(attributes[key])) {
        value = StringUtils.getFlattenedObjects(value);
      }
      if (key === 'lastAccessTime' || key === 'createTime' || key === 'endTime' || key === 'startTime') {
        value = DateUtils.formatDate(attributes[key], 'DD MMM YYYY hh:mm:ss A');
      } else if (key === 'db') {
        value = attributes.qualifiedName.slice(0, attributes.qualifiedName.indexOf('.'));
      }
      let property = new AssetProperty(key, value);
      assetProps.push(property);
    });
    return assetProps;
  }
  get colVisualData() {
    var ret = {};
    if(!this.colGuid || !this.assetDetails.referredEntities[this.colGuid].attributes.profileData) return ret;
    ret = this.assetDetails.referredEntities[this.colGuid].attributes.profileData.attributes;
    ret['name'] = this.assetDetails.referredEntities[this.colGuid].attributes.name;
    ret['type'] = this.assetDetails.referredEntities[this.colGuid].attributes.type;
    return ret;
  }

}
