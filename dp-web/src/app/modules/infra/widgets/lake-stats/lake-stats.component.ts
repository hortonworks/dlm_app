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

import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

import { LocationService } from '../../../../services/location.service';
import { ClusterService } from '../../../../services/cluster.service';

import { Lake } from '../../../../models/lake';
import { Location } from '../../../../models/location';
import { Cluster, ClusterHealthSummary } from '../../../../models/cluster';

@Component({
  selector: 'dp-lake-stats',
  templateUrl: './lake-stats.component.html',
  styleUrls: ['./lake-stats.component.scss'],
})
export class LakeStatsComponent implements OnInit {

  @Input('lake')
  lake: Lake;
  @Input('clusters')
  clusters: Cluster[];

  location: Location;

  cCluster: Cluster;
  cHealth: ClusterHealthSummary;

  constructor(
    private clusterService: ClusterService,
    private locationService: LocationService,
  ) { }

  ngOnInit() {
    this.cCluster = this.clusters[0];
    if(!this.cCluster) {
      this.cCluster = new Cluster();
      this.cCluster.ambariurl = this.lake.ambariUrl;
    }

    if(this.cCluster && this.cCluster.id) {
      this.clusterService
        .retrieveHealth(this.cCluster.id, this.lake.id)
        .subscribe(health => this.cHealth = health);
    }

    this.locationService
      .retrieve(this.lake.location)
      .subscribe(location => this.location = location);
  }

  doGetUptime(since: number) {
    if(since === 0){
      return 'NA';
    }
    return moment.duration(since).humanize();
  }

}
