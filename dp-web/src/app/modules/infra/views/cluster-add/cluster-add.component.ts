import {Component, ElementRef, ViewChild, OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

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
export class ClusterAddComponent implements OnInit{

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
  searchTerm: string;

  dpRequiredServices = ['ATLAS'];
  dLFoundMessage = `This cluster has been indentified as a Datalake since it has data management services,  ${' ' + this.dpRequiredServices.join(', ')} running.`;

  showNotification = false;

  reasons:string[] = ['Check if the Ambari server is up and running in the given url',
             'Make sure that you have right access rights to the mbari server'];

  ngOnInit(){
    this.route.params.subscribe(params =>{
      if(params.status && params.status === 'success'){
        this.showNotification = true;
      }
    });
  }
  closeNotification(){
    this.showNotification = false;
  }
  doVerifyCluster(event) {
    this._isClusterValidateInProgress = true;
    let cleanedUri = StringUtils.cleanupUri(this.cluster.ambariurl);
    this.clusterService.getClusterInfo(cleanedUri).subscribe(
      response => {
        if(this.cluster.ambariurl){
          this.clusterService.getClusterInfo(cleanedUri).subscribe(clusterInfo =>{
            this._isClusterValidateInProgress = false;
            this._isClusterValidateSuccessful = true;
            this._isClusterValid = true;
            this.extractClusterInfo(clusterInfo)
          },() => {
            this.onError();
          });
          let classes = this.ambariInputContainer.nativeElement.className.replace('validation-error','');
          this.ambariInputContainer.nativeElement.className = classes;
        }else{
          this._isClusterValidateInProgress = false;
          this._isClusterValidateSuccessful = true;
          this._isClusterValid = false;
          this.ambariInputContainer.nativeElement.className += ' validation-error';
        }
      },
      () => {
        this.onError();
      }
    );
  }

  private onError(){
    this._isClusterValidateSuccessful = false;
    this._isClusterValidateInProgress = false;
  }

  private extractClusterInfo(clusterInfo){
    this.cluster.name = clusterInfo[0].clusterName;
    this.cluster.services = clusterInfo[0].services;
    // TEMP FIX : Should come from backend
    let urlParts = this.cluster.ambariurl.split('/');
    this.cluster.ipAddress = urlParts.length ? urlParts[2].substr(0, urlParts[2].indexOf(':')) : '';
  }

  get showClusterDetails(){
    return this._isClusterValidateSuccessful && this._isClusterValid;
  }

  get isDataLake(){
    for (let name of this.dpRequiredServices) {
      if (this.cluster.services.indexOf(name) === -1) {
        return false;
      }
    }
    return true;
  }

  locationFormatter(location:Location) : string{
    return `${location.city}, ${location.country}`;
  }

  getLocations(searchTerm){
    return this.locationService.retrieveOptions(searchTerm);
  }

  checkLocation(){
    if(this.searchTerm.length === 0){
      this.mapData = [];
    }
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
            status: 'success'
          }]);
        },
        error => {
        }
      );
  }

  onKeyPress(event){
    if(event.keyCode === 13){
      this.doVerifyCluster(event);
    }
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
          status: 'success'
        }]);
      },
      error => {
      }
    );
  }
}
