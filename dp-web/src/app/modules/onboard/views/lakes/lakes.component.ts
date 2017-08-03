import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, Observable } from 'rxjs/Rx';

import { Lake } from '../../../../models/lake';
import { Location } from '../../../../models/location';
import { LakeService } from '../../../../services/lake.service';
import { ClusterService } from '../../../../services/cluster.service';
import { LocationService } from '../../../../services/location.service';

import {Alerts} from '../../../../shared/utils/alerts';
import {StringUtils} from '../../../../shared/utils/stringUtils';

@Component({
  selector: 'dp-onboard-lakes',
  templateUrl: './lakes.component.html',
  styleUrls: ['./lakes.component.scss']
})
export class LakesComponent {

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

  locationFormatter(location:Location) : string{
    return `${location.city}${location.province ? ', ' + location.province : ''}, ${location.country}`;
  }

  getLocations(searchTerm){
      return this.locationService.retrieveOptions(searchTerm);
  }

  onSelectLocation(location: Location) {
    this.lake.location = location.id;
  }

  doVerifyCluster(event) {
    this._isClusterValidateInProgress = true;
    this.lakeService.validate(StringUtils.cleanupUri(this.lake.ambariUrl)).subscribe(
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

  onCreate() {
    const lake = Object.assign({}, this.lake, {
      state: 'TO_SYNC',
      ambariurl: StringUtils.cleanupUri(this.lake.ambariUrl)
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
