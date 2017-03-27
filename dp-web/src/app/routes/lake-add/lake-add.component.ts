import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  lake: Lake;
  isClusterVerified: boolean = false;
  locationInput: string = '';
  locationOptions: Location[] = [];

  constructor(
    private router: Router,
    private lakeService: LakeService,
    private locationService: LocationService,
  ) { }

  ngOnInit() {
  }

  doVerifyCluster() {

  }

  onUpdateLocation() {

  }

  onUpdateCluster() {
    this.locationService.retrieveOptions(this.locationInput)
      .subscribe(
        locations => {
          this.locationOptions = locations;
        }
      );

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
