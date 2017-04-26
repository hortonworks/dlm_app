import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, Observable } from 'rxjs/Rx';

import { Lake } from '../../../../models/lake';
import { Location } from '../../../../models/location';
import { LakeService } from '../../../../services/lake.service';
import { ClusterService } from '../../../../services/cluster.service';
import { LocationService } from '../../../../services/location.service';

import {Alerts} from '../../../../shared/utils/alerts';

@Component({
  selector: 'dp-onboard-lakes',
  templateUrl: './lakes.component.html',
  styleUrls: ['./lakes.component.scss']
})
export class LakesComponent implements OnInit {

  lake: Lake = new Lake();
  location: Location;
  isClusterVerified: boolean = false;

  _isClusterValidateInProgress: boolean = false;
  _isClusterValidateSuccessful: boolean = false;

  rxClusterValidate: Subject<string> = new Subject();

  constructor(
    private router: Router,
    private lakeService: LakeService,
    private clusterService: ClusterService,
    private locationService: LocationService,
  ) { }

  ngOnInit() {
    this.rxClusterValidate
      .do(() => {
        this._isClusterValidateInProgress = true;
        this._isClusterValidateSuccessful = false;
      })
      .map(this.doCleanClusterUri)
      .flatMap(clusterUrl => this.lakeService.validate(clusterUrl))
      .subscribe(
        response => {
          this._isClusterValidateInProgress = false;
          if(response.ambariStatus === 200){
            this._isClusterValidateSuccessful = true;
          }else{
            this._isClusterValidateSuccessful = false;
          }
        },
        () => {
          this._isClusterValidateSuccessful = false;
          this._isClusterValidateInProgress = false;
        }
      );
  }

  locationFormatter(location:Location) : string{
    return `${location.city}, ${location.country}`;
  }

  getLocations(searchTerm){
      return this.locationService.retrieveOptions(searchTerm);
  }

  onSelectLocation(location: Location) {
    this.lake.location = location.id;
  }

  doVerifyCluster() {
    this.rxClusterValidate.next(this.lake.ambariUrl);
  }

  onUpdateCluster(event) {
    this.doVerifyCluster();
  }

  doCleanClusterUri(clusterUri: string): string {
    console.log("cluster uri in cleanup -->", clusterUri);
    // http://stackoverflow.com/a/26434126/640012
    //  create an anchor element (note: no need to append this element to the document)
    let link = document.createElement('a');
    //  set href to any path
    link.setAttribute('href', clusterUri);

    const cleanedUri = `${link.protocol || 'http:'}//${link.hostname}:${link.port || '80'}`;
    // cleanup for garbage collection
    // prevent leaks
    link = null;

    return clusterUri;
  }

  onCreate() {
    const lake = Object.assign({}, this.lake, {
      state: 'TO_SYNC',
      ambariurl: this.doCleanClusterUri(this.lake.ambariUrl)
    });
    if(!this._isClusterValidateSuccessful && !this._isClusterValidateInProgress){
      Alerts.showErrorMessage("Cluster url is invalid");
      return;
    }else if(!this._isClusterValidateSuccessful && this._isClusterValidateInProgress){
      Alerts.showErrorMessage("Cluster Validation is in progress");
      return;
    }
    this.lakeService.insert(lake)
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

  onCancel() {
    this.router.navigate(['infra']);
  }

}
