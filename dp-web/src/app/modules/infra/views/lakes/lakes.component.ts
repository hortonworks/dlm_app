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

  constructor(private router: Router,
              private lakeService: LakeService,
              private locationService: LocationService,
              private clusterService: ClusterService) {
  }

  ngOnInit() {
    this.mapSize = MapSize.EXTRALARGE;
    this.lakeService.listWithClusters()
      .subscribe(lakes => {
        this.lakes = lakes;
        this.lakes.forEach((lake) => {
          let locationObserver = Observable.create();
          if (lake.data.location && lake.clusters && lake.clusters.length > 0) {
            locationObserver = this.getLocationInfoWithStatus(lake.data.location, lake.clusters[0].id);
          } else {
            locationObserver = this.getLocationInfo(lake.data.location);
          }
          this.updateHealth(lake, locationObserver);
          /***** MOCK CONNECTIONS ****/

           // locationObserver.subscribe(locationInfo=> {
           //   this.lakeService.getPairsMock(lakes, lake.data.id).subscribe((pairedLake)=>{
           //     if(pairedLake !== null){
           //        this.getLocationInfoWithStatus(pairedLake.data.location, pairedLake.clusters[0].id).subscribe((pairedLocationInfo=>{
           //           this.mapData.push({start:this.extractMapPoints(locationInfo), end:this.extractMapPoints(pairedLocationInfo)});
           //          this.mapData = this.mapData.slice();
           //        }));
           //     }else{
           //         this.mapData.push({start:this.extractMapPoints(locationInfo)});
           //        this.mapData = this.mapData.slice();
           //     }
           //   });
           // });
        });
      });
  }

  updateHealth(lake, locationObserver: Observable<any>){
    locationObserver.subscribe(locationInfo => {
      this.health.set(lake.data.id, locationInfo);
      this.health = new Map(this.health.entries());
      this.mapSet.set(lake.data.id, new MapData(this.extractMapPoints(locationInfo)));
      let mapPoints = [];
        this.mapSet.forEach(mapData => {
          mapPoints.push(mapData)
        });
      this.mapData = mapPoints;
    });
  }

  private getLocationInfoWithStatus(locationId, clusterId): Observable<any> {
    return Observable.forkJoin(
      this.locationService.retrieve(locationId).map((res) => res),
      this.clusterService.retrieveHealth(clusterId).map((res) => res)
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

  private extractMapPoints(locationInfo) {
    if (!locationInfo.health) {
      return new Point(locationInfo.location.latitude, locationInfo.location.longitude, MapConnectionStatus.NA)
    } else {
      let health = locationInfo.health;
      let location = locationInfo.location;
      let status;
      if (health && health.status && health.status.state === 'STARTED') {
        status = MapConnectionStatus.UP;
      } else if (health && health.status && health.status.state === 'NOT STARTED') {
        status = MapConnectionStatus.DOWN;
      } else {
        status = MapConnectionStatus.NA;
      }
      return new Point(location.latitude, location.longitude, status);
    }
  }

  onRefresh(lakeId){
    let lakeInfo = this.lakes.find(lake => lake.data.id === lakeId);
    if(lakeInfo.clusters && lakeInfo.clusters.length > 0){
      this.updateHealth(lakeInfo, this.getLocationInfoWithStatus(lakeInfo.data.location, lakeInfo.clusters[0].id));
    }else{
      this.clusterService.listByLakeId({lakeId: lakeInfo.data.id}).subscribe(clusters=> {
        lakeInfo.clusters = clusters;
        this.updateHealth(lakeInfo, this.getLocationInfoWithStatus(lakeInfo.data.location, lakeInfo.clusters[0].id));
      });
    }
  }

}
