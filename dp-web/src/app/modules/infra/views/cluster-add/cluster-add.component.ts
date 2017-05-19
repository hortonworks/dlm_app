import {Component, ElementRef, ViewChild} from "@angular/core";
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs/Rx';

import { Cluster } from '../../../../models/cluster';
import { Lake } from '../../../../models/lake';
import { Location } from '../../../../models/location';
import { Point } from '../../../../models/map-data';
import { MapData } from '../../../../models/map-data';
import { MapConnectionStatus } from '../../../../models/map-data';



import { LakeService } from '../../../../services/lake.service';
import { ClusterService } from '../../../../services/cluster.service';
import { LocationService } from '../../../../services/location.service';


import {StringUtils} from '../../../../shared/utils/stringUtils';

@Component({
  selector: 'dp-cluster-add',
  templateUrl: './cluster-add.component.html',
  styleUrls: ['./cluster-add.component.scss']
})
export class ClusterAddComponent {

  constructor(
    private router: Router,
    private lakeService: LakeService,
    private clusterService: ClusterService,
    private locationService: LocationService,
  ) { }

  @ViewChild('ambariInput') ambariInputContainer: ElementRef;


  _isClusterValidateInProgress: boolean = false;
  _isClusterValidateSuccessful: boolean = false;

  _isClusterValid;

  mapData: MapData[] = [];
  cluster:Cluster = new Cluster();

  altasServiceName:string = "ATLAS";
  rangerServiceName:string = "RANGER";

  reasons:string[] = ['Check if the Ambari server is up and running in the given url',
             'Make sure that you have right access rights to the mbari server']


  doVerifyCluster(event) {
    this._isClusterValidateInProgress = true;
    this.lakeService.validate(StringUtils.cleanupUri(this.cluster.ambariurl)).subscribe(
      response => {
        this._isClusterValidateInProgress = false;
        if(response.ambariStatus === 200){
          this._isClusterValidateSuccessful = true;
          this._isClusterValid = true;
          this.clusterService.getClusterInfo(this.cluster.ambariurl).subscribe(clusterInfo =>{
            this.cluster = clusterInfo;
          });
          let classes = this.ambariInputContainer.nativeElement.className.replace("validation-error",'');
          this.ambariInputContainer.nativeElement.className = classes;
        }else{
          this._isClusterValidateSuccessful = true;
          this._isClusterValid = false;
          this.ambariInputContainer.nativeElement.className += " validation-error";
        }
      },
      () => {
        this._isClusterValidateSuccessful = false;
        this._isClusterValidateInProgress = false;
      }
    );
  }

  get showClusterDetails(){
    return this._isClusterValidateSuccessful && this._isClusterValid;
  }

  get isDataLake(){
    return this.cluster.services.indexOf(this.altasServiceName) > 0 && this.cluster.services.indexOf(this.rangerServiceName) > 0;
  }

  locationFormatter(location:Location) : string{
    return `${location.city}, ${location.country}`;
  }

  getLocations(searchTerm){
    return this.locationService.retrieveOptions(searchTerm);
  }

  onSelectLocation(location: Location) {
    this.mapData = [];
    let point = new Point(location.latitude, location.longitude, MapConnectionStatus.UP)
    this.mapData = [new MapData(point)];
    this.cluster.location = location;
  }
  onNewTagAddition(text:string){
    this.cluster.tags.push(text);
  }

  onCreate() {

    this.createCluster()
      .subscribe(
        () => {
          this.router.navigate(['infra', {
            message: 'Lake successfully added.'
          }]);
        },
        error => {
        }
      );
  }

  createCluster(){
    let lake = new Lake()
    lake.ambariUrl = this.cluster.ambariurl;
    lake.location = this.cluster.location.id;
    lake.name = this.cluster.name;
    lake.description = this.cluster.description;
    lake.state = 'TO_SYNC';
    return this.lakeService.insert(lake);
  }

  onCancel() {
    this.router.navigate(['infra']);
  }

  onCreateAndAdd(){
    this.createCluster().subscribe(
      () => {
        this.cluster = new Cluster();
        this._isClusterValid = false;
        this._isClusterValidateSuccessful = false;
        this.router.navigate(['infra/add', {
          message: 'Lake successfully added.'
        }]);
      },
      error => {
      }
    );
  }
}
