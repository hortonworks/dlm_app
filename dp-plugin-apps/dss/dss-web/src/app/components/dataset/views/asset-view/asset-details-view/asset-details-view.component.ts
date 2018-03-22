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
import {TabStyleType} from '../../../../../shared/tabs/tabs.component';
import {AssetService} from '../../../../../services/asset.service';
import {AssetDetails, AssetProperty} from '../../../../../models/asset-property';
import {AssetTag} from '../../../../../models/asset-tag';
import {AssetSchema} from '../../../../../models/asset-schema';
import {DateUtils} from '../../../../../shared/utils/date-utils';
import {StringUtils} from '../../../../../shared/utils/stringUtils';
import {Observable} from 'rxjs/Observable';

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
  assetSchemas: AssetSchema[] = [];
  @Input() assetDetails;
  @Input() clusterId: string;
  @Input() guid: string;
  rowCount = 'NA';
  colGuid = '';

  constructor(private assetService: AssetService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['assetDetails'] || !this.assetDetails) {
      return;
    }
    if (this.assetDetails.entity.attributes.profileData && this.assetDetails.entity.attributes.profileData.attributes) {
      this.rowCount = this.assetDetails.entity.attributes.profileData.attributes.rowCount;
    }
    this.assetSchemas = this.extractSchema(this.assetDetails.referredEntities);
  }

  setColGuid(guid) {
    this.colGuid === guid ? this.colGuid = '' : this.colGuid = guid;
  }

  private extractSchema(referredEntities) {
    const assetSchemas: AssetSchema[] = [];
    Object.keys(referredEntities).forEach(key => {
      if (referredEntities[key].typeName !== 'hive_column' || referredEntities[key].status === 'DELETED') {
        return;
      }
      const attributes = referredEntities[key].attributes;
      const schema: AssetSchema = new AssetSchema();
      schema.name = attributes.name;
      schema.type = attributes.type;
      schema.guid = key;
      schema.comment = attributes.comment;
      const profileData = attributes.profileData ? attributes.profileData.attributes : null;
      if (profileData) {
        this.populateProfileData(schema, profileData);
      }
      assetSchemas.push(schema);
    });
    return assetSchemas;
  }

  private populateProfileData(schema: AssetSchema, profileData: any) {
    const type = schema.type.toLowerCase();
    if (type.indexOf('int') >= 0 || type.indexOf('decimal') >= 0 || type.indexOf('long') >= 0 ||
          type.indexOf('float') >= 0 || type.indexOf('double') >= 0) {
      schema.min = profileData.minValue;
      schema.max = profileData.maxValue;
      schema.mean = profileData.meanValue;
    }
    schema.noOfUniques = profileData.cardinality;
    schema.noOfNulls = this.rowCount !== 'NA' ? (parseInt(this.rowCount, 10) - profileData.nonNullCount).toString() : 'NA';
  }

  get colVisualData() {
    let ret = {};
    if (!this.colGuid || !this.assetDetails.referredEntities[this.colGuid].attributes.profileData) {
      return ret;
    }
    ret = this.assetDetails.referredEntities[this.colGuid].attributes.profileData.attributes;
    ret['name'] = this.assetDetails.referredEntities[this.colGuid].attributes.name;
    ret['type'] = this.assetDetails.referredEntities[this.colGuid].attributes.type;
    try {
      const profilerInfo = this.assetDetails.entity.attributes.profileData.attributes;
      if (!profilerInfo.sampleTime || !profilerInfo.samplePercent) {
        throw new Error('sampleTime or samplePercent not available');
      }
      let td = Math.floor((Date.now() - parseInt(profilerInfo.sampleTime, 10)) / 60000); // in minutes
      let displayText = '';
      if (td / 60 < 1) {
        displayText = td + ((td === 1) ? ' minute ' : ' minutes ') + 'ago';
      } else {
        displayText = (td = Math.floor(td / 60)) + ((td === 1) ? ' hour ' : ' hours ') + 'ago';
      }
      ret['profilerInfo'] = `Profiled : ${profilerInfo.samplePercent}% rows, ${displayText}`;

    } catch (err) {/*console.log(err)*/}

    return ret;
  }

  getIconClass(colGuid) {
    const ent = this.assetDetails.referredEntities[colGuid];
    if (!ent || !ent.attributes.profileData) {
      return null;
    }
    const data = ent.attributes.profileData.attributes;
    if (!data || !data.histogram && !data.quartiles) {
      return null;
    }
    if (data.cardinality < 11) {
      return 'fa fa-pie-chart pointer';
    }
    return 'fa fa-bar-chart pointer';
  }

}
