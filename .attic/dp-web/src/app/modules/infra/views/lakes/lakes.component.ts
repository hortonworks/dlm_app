import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';

import { LakeService } from '../../../../services/lake.service';
import { LocationService } from '../../../../services/location.service';
import { ClusterService } from '../../../../services/cluster.service';

import { Lake } from '../../../../models/lake';
import { Location } from '../../../../models/location';
import { Cluster, ClusterHealthSummary } from '../../../../models/cluster';

@Component({
  selector: 'dp-lakes',
  templateUrl: './lakes.component.html',
  styleUrls: ['./lakes.component.scss']
})
export class LakesComponent implements OnInit {

  lakes: {
    lake: Lake,
    location: Location,
    clustersWithHealth: {
      cluster: Cluster,
      health: ClusterHealthSummary
    }[]
  }[];

  constructor(
    private router: Router,
    private lakeService: LakeService,
    private locationService: LocationService,
    private clusterService: ClusterService,
  ) { }

  ngOnInit() {
    const rxLakes = this.lakeService.list();

    rxLakes
      .flatMap(lakes => Observable.zip(
        ...lakes.map(cLake => {
          return this.clusterService
            .list({lakeId: cLake.id})
            .flatMap(clusters => Observable.zip(
              Observable.of(cLake),
              this.locationService.retrieve(cLake.location),
              ...clusters.map(cCluster => {
                return this.clusterService
                  .retrieveHealth(cCluster.id)
                  .map(cClusterHealth => ({
                    cluster: cCluster,
                    health: cClusterHealth
                  }));
              }),
              (lake, location, ...clustersWithHealth) => ({
                lake,
                location,
                clustersWithHealth
              })
            ));
        })
      ))
      .subscribe(data => {
        this.lakes = data.filter(cLake => cLake.clustersWithHealth.length === 1);
      })
  }

  doGetUptime(since: number) {
    return moment.duration(since).humanize();
  }

}
