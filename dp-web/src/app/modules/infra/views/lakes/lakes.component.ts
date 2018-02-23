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
  showError = false;


  constructor(private router: Router,
              private lakeService: LakeService,
              private locationService: LocationService,
              private clusterService: ClusterService) {
  }

  ngOnInit() {
    this.lakeService.clusterDeleteFailed$.subscribe(() => {
      this.showError = true;
      window.scrollTo(0, 0);
    });
    this.lakeService.clusterDeleted$.subscribe((lakeId) => {
      this.mapSet.delete(lakeId);
      this.mapData = Array.from(this.mapSet.values());
      this.getClusters();
    });
    this.mapSize = MapSize.EXTRALARGE;
    this.getClusters();
  }

  getClusters() {
    this.showError = false;
    let unSyncedLakes = [];
    this.lakeService.listWithClusters()
      .subscribe(lakes => {
        this.lakes = lakes;
        this.lakes.forEach((lake) => {
          let locationObserver;
          let isWaiting: boolean;
          lake.data.isWaiting = true;
          if (lake.data.state === this.SYNCED || lake.data.state === this.SYNC_ERROR) {
            isWaiting = false;
            if (lake.data.state === this.SYNCED || (lake.data.state === this.SYNC_ERROR && lake.clusters && lake.clusters.length > 0)) {
              locationObserver = this.getLocationInfoWithStatus(lake.data.location, lake.clusters[0].id, lake.data.id, lake.data.ambariUrl);
            } else {
              locationObserver = this.getLocationInfo(lake.data.location);
            }
          } else {
            isWaiting = true;
            unSyncedLakes.push(lake);
            locationObserver = this.getLocationInfo(lake.data.location);
          }
          this.updateHealth(lake, locationObserver, isWaiting);
        });
        this.updateUnSyncedLakes(unSyncedLakes);
      });
  }

  updateUnSyncedLakes(unSyncedLakes) {
    unSyncedLakes.forEach((unSyncedlake) => {
      let count = 1;
      this.lakeService
        .retrieve(unSyncedlake.data.id)
        .delay(this.DELAY_IN_MS)
        .repeat(this.MAXCALLS)
        .skipWhile((lake) => lake.state !== this.SYNCED && lake.state !== this.SYNC_ERROR && count++ < this.MAXCALLS)
        .first()
        .subscribe(lake => {
          let locationObserver;
          if (lake.state === this.SYNCED || lake.state === this.SYNC_ERROR) {
            unSyncedlake.data = lake;
            this.clusterService.listByLakeId({lakeId: lake.id}).subscribe(clusters => {
              unSyncedlake.clusters = clusters;
              if (clusters && clusters.length > 0) {
                locationObserver = this.getLocationInfoWithStatus(unSyncedlake.data.location, unSyncedlake.clusters[0].id, unSyncedlake.data.id, unSyncedlake.data.ambariUrl);
              } else {
                locationObserver = this.getLocationInfo(unSyncedlake.data.location);
              }
              this.updateHealth(unSyncedlake, locationObserver, false);
            });
          } else {
            locationObserver = this.getLocationInfo(unSyncedlake.data.location);
            this.updateHealth(unSyncedlake, locationObserver, false);
          }
        });
    });
  }

  updateHealth(lake, locationObserver: Observable<any>, isWaiting: boolean) {
    locationObserver.subscribe(locationInfo => {
      lake.data.isWaiting = isWaiting;
      if (lake.data.state === this.SYNCED || lake.data.state === this.SYNC_ERROR) {
        lake.data.ambariUrl = locationInfo.ambariUrl;
      }
      this.health.set(lake.data.id, locationInfo);
      this.health = new Map(this.health.entries());
      this.mapSet.set(lake.data.id, new MapData(this.extractMapPoints(locationInfo, lake)));
      let mapPoints = [];
      this.mapSet.forEach(mapData => {
        mapPoints.push(mapData)
      });
      this.mapData = mapPoints;
    }, error => {
      lake.data.isWaiting = isWaiting;
      this.health = new Map(this.health.entries());
    });
  }

  private getLocationInfoWithStatus(locationId, clusterId, lakeId, ambariUrl): Observable<any> {
    return Observable.forkJoin(
      this.locationService.retrieve(locationId).map((res) => res).catch(err => {
        return Observable.of(null);
      }),
      this.clusterService.retrieveHealth(clusterId, lakeId).map((res) => res).catch(err => {
        return Observable.of(null);
      }),
      this.getAmbariUrl(clusterId, ambariUrl)
      , (location, health, ambariUrl) => ({location, health, ambariUrl}));
  }

  private getAmbariUrl(clusterId, ambariUrl): Observable<string> {
    let parsedAmbariUrl = new URL(ambariUrl);
    let validIpAddressRegex = new RegExp('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');
    if (!validIpAddressRegex.test(parsedAmbariUrl.hostname)) {
      return Observable.of(ambariUrl);
    }
    let parsedIpAddress = new URL(ambariUrl);
    return this.clusterService.getHostName(clusterId, parsedIpAddress.hostname)
      .map(response => {
        if (response && response.length) {
          let host = response[0].host;
          return `${parsedIpAddress.protocol}//${host}:${parsedIpAddress.port}`;
        } else {
          return ambariUrl;
        }
      })
      .catch(() => Observable.of(ambariUrl));
  }

  private getLocationInfo(locationId) {
    return this.locationService.retrieve(locationId)
      .map(location => ({
        location: location
      }));
  }

  private extractMapPoints(locationInfo, lake) {
    if (!locationInfo.health && locationInfo.location) {
      return new Point(locationInfo.location.latitude, locationInfo.location.longitude, MapConnectionStatus.NA, lake.data.name, lake.data.dcName, `${locationInfo.location.city}, ${locationInfo.location.country}`)
    } else if (locationInfo.health && locationInfo.location) {
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
      this.updateHealth(lakeInfo, this.getLocationInfoWithStatus(lakeInfo.data.location, lakeInfo.clusters[0].id, lakeId, lakeInfo.data.ambariUrl), false);
    } else {
      this.updateUnSyncedLakes([lakeInfo]);
    }
  }

}
