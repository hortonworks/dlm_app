import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, Observable } from 'rxjs/Rx';

import { Lake } from '../../models/lake';
import { Location } from '../../models/location';
import { Cluster } from '../../models/cluster';
import { LakeService } from '../../services/lake.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'dp-lake-add',
  templateUrl: './lake-add.component.html',
  styleUrls: ['./lake-add.component.scss']
})
export class LakeAddComponent implements OnInit {

  lake: Lake = new Lake();
  cluster: Cluster = new Cluster();
  location: Location = new Location();
  isClusterVerified: boolean = false;

  _isLocationInFocus: boolean = false;
  locationQueryString: string = '';

  _isLocationFetchInProgress: boolean = false;
  _isLocationFetchSuccessful: boolean = false;
  locationOptions: Location[] = [];

  rxLocationOptions: Subject<string> = new Subject();


  constructor(
    private router: Router,
    private lakeService: LakeService,
    private locationService: LocationService,
  ) { }

  ngOnInit() {
    this.rxLocationOptions
      .debounce(() => Observable.timer(250))
      .filter(cLocationQuery => cLocationQuery.length >= 3)
      .do(() => {
        this._isLocationFetchInProgress = true;
        this._isLocationFetchSuccessful = false;
      })
      .flatMap(query => this.locationService.retrieveOptions(query))
      .finally(() => {
        this._isLocationFetchInProgress = false;
      })
      .subscribe(
        locations => {
          this._isLocationFetchInProgress = false;
          this._isLocationFetchSuccessful = true;
          this.locationOptions = locations;
        },
        () => {
          this._isLocationFetchSuccessful = false;
        }
      );
  }

  onUpdateLocation(event) {
    console.log(event.target.value)
    this.rxLocationOptions.next(event.target.value);
  }

  onFocusLocation(event) {
    this._isLocationInFocus = true;
    this.rxLocationOptions.next(event.target.value);
  }

  onBlurLocation(event) {
      this._isLocationInFocus = false;
  }

  onSelectLocation(location: Location) {
    this.location = location;
    this.lake.location = location.id;
    this.locationQueryString = `${location.city}, ${location.country}`;
  }

  doVerifyCluster() {

  }

  onUpdateCluster() {

  }

  onCreate() {
    this.lakeService.insert(this.lake)
      .subscribe(
        () => this.router.navigate(['dashboard']),
        error => {

        }
      );
  }

  onCancel() {

  }

}
