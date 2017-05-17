import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs/Rx';

import { LakeService } from '../../../../services/lake.service';
import { LocationService } from '../../../../services/location.service';
import { ClusterService } from '../../../../services/cluster.service';

import { Lake } from '../../../../models/lake';
import { Cluster } from '../../../../models/cluster';
import { Location } from '../../../../models/location';
import { MapData } from '../../../../models/map-data';
import { MapConnectionStatus } from '../../../../models/map-data';
import { Point } from '../../../../models/map-data';
import { MapSize } from '../../../../models/map-data';


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

  private locations : any[] = [];
  mapData : MapData[] = [];
  health = new Map();
  mapSize: MapSize;

  constructor(
    private router: Router,
    private lakeService: LakeService,
    private locationService: LocationService,
    private clusterService : ClusterService
  ) { }

  ngOnInit() {
    this.mapSize = MapSize.EXTRALARGE;
    this.lakeService.listWithClusters()
      .subscribe(lakes => {
        this.lakes = lakes;
        let locations = [];
        let health = new Map();
        this.lakes.forEach((lake) => {
          let locationObserver = Observable.create();
          if(lake.data.location && lake.clusters && lake.clusters.length > 0){
              locationObserver = this.getLocationInfoWithStatus(lake.data.location, lake.clusters[0].id);
          }else{
            locationObserver = this.getLocationInfo(lake.data.location);
          }
         locationObserver.subscribe(locationInfo=> {
           health.set(lake.data.id, locationInfo.health);
           this.health = new Map(health.entries());
           locations.push(new MapData(this.extractMapPoints(locationInfo)));
           this.mapData = locations.slice();
         });
         /***** MOCK CONNECTIONS ****/

        //  locationObserver.subscribe(locationInfo=> {
        //    this.lakeService.getPairsMock(lakes, lake.data.id).subscribe((pairedLake)=>{
        //      if(pairedLake !== null){
        //         this.getLocationInfoWithStatus(pairedLake.data.location, pairedLake.clusters[0].id).subscribe((pairedLocationInfo=>{
        //           locations.push({start:this.extractMapPoints(locationInfo), end:this.extractMapPoints(pairedLocationInfo)});
        //           this.mapData = locations.slice();
        //         }));
        //      }else{
        //         locations.push({start:this.extractMapPoints(locationInfo)});
        //         this.mapData = locations.slice();
        //      }
        //    });
        //  });
        });
      });
  }

  private getLocationInfoWithStatus(locationId, clusterId){
     return Observable.forkJoin(
              this.locationService.retrieve(locationId).map((res) => res),
              this.clusterService.retrieveHealth(clusterId).map((res) => res)
          ).map(response => {
            return {
              location :  response[0],
              health :  response[1]
            }

      });
  }

  private getLocationInfo(locationId){
     return this.locationService.retrieve(locationId).map(location => {
       return {
         location : location
       }
    });
  }

  private extractMapPoints(locationInfo){
    if(!locationInfo.health){
      return new Point(locationInfo.location.latitude, locationInfo.location.longitude, MapConnectionStatus.NA)
    } else {
      let health = locationInfo.health;
      let location = locationInfo.location;
      let status;
        if(health.status.state ==='STARTED'){
          status = MapConnectionStatus.UP;
        }else if(health.status.state ==='NOT STARTED'){
          status = MapConnectionStatus.DOWN;
        }else{
          status = MapConnectionStatus.NA;
        }
       return new Point(location.latitude, location.longitude, status);
    }
  }
}
