import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subject, Observable } from 'rxjs/Rx';

import { Lake } from '../../models/lake';
import { Location } from '../../models/location';
import { LakeService } from '../../services/lake.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'dp-lake-add',
  templateUrl: './lake-add.component.html',
  styleUrls: ['./lake-add.component.scss']
})
export class LakeAddComponent implements OnInit {

  lake: Lake = new Lake();
  location: Location = new Location();
  isClusterVerified: boolean = false;

  _isLocationInFocus: boolean = false;
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
      .filter(cLocationQuery => cLocationQuery.length >= 1)
      .do(() => this._isLocationFetchInProgress = true)
      .flatMap(query => this.locationService.retrieveOptions(query))
      .finally(() => this._isLocationFetchInProgress = false)
      .subscribe(
        locations => {
          this.locationOptions = locations;
        }
      );
  }

  onUpdateLocation(query) {
    this.rxLocationOptions.next(query);
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
