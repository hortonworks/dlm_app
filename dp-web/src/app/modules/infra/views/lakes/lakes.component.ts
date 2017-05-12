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
import { Status } from '../../../../models/map-data';
import { Point } from '../../../../models/map-data';

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

  constructor(
    private router: Router,
    private lakeService: LakeService,
    private locationService: LocationService,
    private clusterService : ClusterService
  ) { }

  ngOnInit() {
    this.lakeService.listWithClusters()
      .subscribe(lakes => {
        this.lakes = lakes;
        let locations = []
        this.lakes.forEach((lake) => {
          let locationObserver = Observable.create();
         if(lake.data.location && lake.clusters && lake.clusters.length > 0){
            locationObserver = this.getLocationInfoWithStatus(lake.data.location, lake.clusters[0].id);
         }else{
           locationObserver = this.getLocationInfo(lake.data.location);
         }
         locationObserver.subscribe(lakeLocation=> {
           locations.push(new MapData(lakeLocation));
           this.mapData = locations.slice();
         });
         /***** MOCK CONNECTIONS ****/

        //  locationObserver.subscribe(lakeLocation=> {
        //    this.lakeService.getPairsMock(lakes, lake.data.id).subscribe((pairedLake)=>{
        //      if(pairedLake !== null){
        //         this.getLocationInfoWithStatus(pairedLake.data.location, pairedLake.clusters[0].id).subscribe((pairedLakeLocation=>{
        //           locations.push({start:lakeLocation, end:pairedLakeLocation});
        //           this.mapData = locations.slice();
        //         }));
        //      }else{
        //         locations.push({start:lakeLocation});
        //         this.mapData = locations.slice();
        //      }
        //    });                      
        //  });
        });
      });
  }

  getLocationInfoWithStatus(locationId, clusterId){
     return Observable.forkJoin(
              this.locationService.retrieve(locationId).map((res) => res),
              this.clusterService.retrieveHealth(clusterId).map((res) => res),
          ).map(response => {
            let location = response[0];
            let health = response[1];
            let status;
            if(health.status.state ==='STARTED'){
              status = Status.UP;
            }else if(health.status.state ==='NOT STARTED'){
              status = Status.DOWN;
            }else{
              status = Status.NA;
            }
            return new Point(location.latitude, location.longitude, status);
      });
  }

  getLocationInfo(locationId){
     return this.locationService.retrieve(locationId).map(location => {
            return new Point(location.latitude, location.longitude, Status.NA);
      });
  }
}
