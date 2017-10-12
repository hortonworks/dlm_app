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

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Rx';

import {LakeService} from '../../../../services/lake.service';
import {LocationService} from '../../../../services/location.service';
import {ClusterService} from '../../../../services/cluster.service';

import {Lake} from '../../../../models/lake';
import {Cluster} from '../../../../models/cluster';
import {MapData} from '../../../../models/map-data';
import {MapConnectionStatus} from '../../../../models/map-data';
import {Point} from '../../../../models/map-data';
import {MapSize} from '../../../../models/map-data';

@Component({
  selector: 'dp-infra-lakes',
  templateUrl: './lakes.component.html',
  styleUrls: ['./lakes.component.scss']
})
export class LakesComponent implements OnInit {

  lakes: {
    data: Lake,
    clusters: Cluster[]
  }[];

  mapData: MapData[] = [];
  mapSet = new Map();
  health = new Map();
  mapSize: MapSize;
  private SYNCED = 'SYNCED';
  private SYNC_ERROR = 'SYNC_ERROR';
  private MAXCALLS = 10;
  private DELAY_IN_MS = 2000;


  constructor(private router: Router,
              private lakeService: LakeService,
              private locationService: LocationService,
              private clusterService: ClusterService) {
  }

  ngOnInit() {
    this.lakeService.clusterDeleted$.subscribe((lakeId) => {
      this.mapSet.delete(lakeId);
      let mapPoints = [];
      this.mapSet.forEach(mapData => {
        mapPoints.push(mapData)
      });
      this.mapData = mapPoints;
      this.getClusters();
    });
    this.mapSize = MapSize.EXTRALARGE;
    this.getClusters();
  }

  getClusters(){
    let unSyncedLakes = [];
    this.lakeService.listWithClusters()
      .subscribe(lakes => {
        this.lakes = lakes;
        this.lakes.forEach((lake) => {
          let locationObserver;
          lake.data.isWaiting = true;
          if (lake.data.state === this.SYNCED || lake.data.state === this.SYNC_ERROR) {
            if (lake.data.state === this.SYNCED || (lake.data.state === this.SYNC_ERROR && lake.clusters && lake.clusters.length > 0)) {
              locationObserver = this.getLocationInfoWithStatus(lake.data.location, lake.clusters[0].id, lake.data.id);
            } else {
              locationObserver = this.getLocationInfo(lake.data.location);
            }
          } else {
            unSyncedLakes.push(lake);
            locationObserver = this.getLocationInfo(lake.data.location);
          }
          this.updateHealth(lake, locationObserver);
        });
        this.updateUnSyncedLakes(unSyncedLakes);
      });
  }

  updateUnSyncedLakes(unSyncedLakes) {
    unSyncedLakes.forEach((unSyncedlake) => {
      let count = 1;
      this.lakeService.retrieve(unSyncedlake.data.id).delay(this.DELAY_IN_MS).repeat(this.MAXCALLS).skipWhile((lake) => lake.state !== this.SYNCED && lake.state !== this.SYNC_ERROR && count++ < this.MAXCALLS).first().subscribe(lake => {
        let locationObserver;
        if (lake.state === this.SYNCED || lake.state === this.SYNC_ERROR) {
          unSyncedlake.data = lake;
          this.clusterService.listByLakeId({lakeId: lake.id}).subscribe(clusters => {
            unSyncedlake.clusters = clusters;
            if (clusters && clusters.length > 0) {
              locationObserver = this.getLocationInfoWithStatus(unSyncedlake.data.location, unSyncedlake.clusters[0].id, unSyncedlake.data.id);
            } else {
              locationObserver = this.getLocationInfo(unSyncedlake.data.location);
            }
            this.updateHealth(unSyncedlake, locationObserver);
          });
        } else {
          locationObserver = this.getLocationInfo(unSyncedlake.data.location);
          unSyncedlake.data.isWaiting = false;
          this.updateHealth(unSyncedlake, locationObserver);
        }
      });
    });
  }

  updateHealth(lake, locationObserver: Observable<any>) {
    locationObserver.subscribe(locationInfo => {
      if (lake.data.state === this.SYNCED || lake.data.state === this.SYNC_ERROR) {
        lake.data.isWaiting = false;
      }
      this.health.set(lake.data.id, locationInfo);
      this.health = new Map(this.health.entries());
      this.mapSet.set(lake.data.id, new MapData(this.extractMapPoints(locationInfo, lake)));
      let mapPoints = [];
      this.mapSet.forEach(mapData => {
        mapPoints.push(mapData)
      });
      this.mapData = mapPoints;
    });
  }

  private getLocationInfoWithStatus(locationId, clusterId, lakeId): Observable<any> {
    return Observable.forkJoin(
      this.locationService.retrieve(locationId).map((res) => res),
      this.clusterService.retrieveHealth(clusterId, lakeId).map((res) => res)
    ).map(response => {
      return {
        location: response[0],
        health: response[1]
      };

    });
  }

  private getLocationInfo(locationId) {
    return this.locationService.retrieve(locationId).map(location => {
      return {
        location: location
      };
    });
  }

  private extractMapPoints(locationInfo, lake) {
    if (!locationInfo.health) {
      return new Point(locationInfo.location.latitude, locationInfo.location.longitude, MapConnectionStatus.NA, lake.data.name, lake.data.dcName, `${locationInfo.location.city}, ${locationInfo.location.country}`)
    } else {
      let health = locationInfo.health;
      let location = locationInfo.location;
      let status;
      if (health && health.status && health.status.state === 'STARTED') {
        status = MapConnectionStatus.UP;
      } else if (health && health.status && (health.status.state === 'NOT STARTED' || health.status.state === this.SYNC_ERROR)) {
        status = MapConnectionStatus.DOWN;
      } else {
        status = MapConnectionStatus.NA;
      }
      return new Point(location.latitude, location.longitude, status, lake.data.name, lake.data.dcName, `${locationInfo.location.city}, ${locationInfo.location.country}`);
    }
  }

  onRefresh(lakeId) {
    let lakeInfo = this.lakes.find(lake => lake.data.id === lakeId);
    if (lakeInfo.data.state === this.SYNCED) {
      this.updateHealth(lakeInfo, this.getLocationInfoWithStatus(lakeInfo.data.location, lakeInfo.clusters[0].id, lakeId));
    } else {
      this.updateUnSyncedLakes([lakeInfo]);
    }
  }

}
