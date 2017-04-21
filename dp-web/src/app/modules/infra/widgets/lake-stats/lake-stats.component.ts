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
      this.clusterService.retrieveHealth(this.cCluster.id)
        .subscribe(health => this.cHealth = health);
    }

    this.locationService.retrieve(this.lake.location)
      .subscribe(location => this.location = location);
  }

  doGetUptime(since: number) {
    return moment.duration(since).humanize();
  }

}
