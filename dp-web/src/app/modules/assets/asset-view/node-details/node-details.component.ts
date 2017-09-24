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

import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from '@angular/router';
import {AssetService} from "../../../../services/asset.service";
import {AssetDetails, AssetProperty} from "../../../../models/asset-property";
import {DateUtils} from "../../../../shared/utils/date-utils";
import {StringUtils} from "../../../../shared/utils/stringUtils";

@Component({
  selector: 'dp-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss']
})

export class NodeDetailsComponent implements OnInit {

  guid: string;
  clusterId: string;
  assetProperties: AssetProperty[] = [];
  assetDetails: AssetDetails;
  name: string;
  iconSrc: string;
  fetchInProgress = true;

  readonly entityState = {
    'ACTIVE': false,
    'DELETED': true,
    'STATUS_ACTIVE': false,
    'STATUS_DELETED': true
  };

  constructor(private route: ActivatedRoute, private assetService: AssetService, private router: Router) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.fetchInProgress = true;
      this.clusterId = this.route.parent.snapshot.params['clusterId'];
      this.guid = this.route.snapshot.params['guidOfNode'];
      this.assetService.getDetails(this.clusterId, this.guid).subscribe(details => {
        this.assetDetails = details;
        this.assetProperties = this.extractAssetProperties(details.entity);
        this.name = details.entity['attributes'].name;
        this.iconSrc = this.getIcon();
        this.fetchInProgress = false;
      }, (error => {
        this.fetchInProgress = false;
      }));
    });
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

  backToLineage() {
    this.router.navigate(['../'], {relativeTo: this.route, skipLocationChange: true});
  }


  getIcon() {
    let status = this.assetDetails.entity.status;
    if (this.assetDetails.entity.typeName.toLowerCase().indexOf('process') >= 0) {
      if (this.entityState[status]) {
        return 'assets/images/icon-gear-delete.png';
      } else if (this.assetDetails.entity.id == this.guid) {
        return 'assets/images/icon-gear-active.png';
      } else {
        return 'assets/images/icon-gear.png';
      }
    } else {
      if (this.entityState[status]) {
        return 'assets/images/icon-table-delete.png';
      } else if (this.assetDetails.entity.id == this.guid) {
        return 'assets/images/icon-table-active.png';
      } else {
        return 'assets/images/icon-table.png';
      }
    }
  }
}
