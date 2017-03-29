import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { LakeService } from '../../services/lake.service';
import { ClusterService } from '../../services/cluster.service';

import { Lake } from '../../models/lake';
import { Cluster, ClusterHealth } from '../../models/cluster';

@Component({
  selector: 'dp-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  lakes: {
    lake: Lake,
    clustersWithHealth: {
      cluster: Cluster,
      health: ClusterHealth
    }[]
  }[];

  constructor(
    private router: Router,
    private lakeService: LakeService,
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
              ...clusters.map(cCluster => {
                return this.clusterService
                  .retrieveHealth(cCluster.id)
                  .map(cClusterHealth => ({
                    cluster: cCluster,
                    health: cClusterHealth
                  }));
              }),
              (lake, ...clustersWithHealth) => ({
                lake,
                clustersWithHealth
              })
            ));
        })
      ))
      .subscribe(data => {
        this.lakes = data;
      })
  }

}
