import {Component, ElementRef, ViewChild, OnInit, AfterViewChecked, HostListener} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs/Observable';

import {Cluster} from '../../../../models/cluster';
import {Lake} from '../../../../models/lake';
import {Location} from '../../../../models/location';
import {Point} from '../../../../models/map-data';
import {MapData} from '../../../../models/map-data';
import {MapConnectionStatus} from '../../../../models/map-data';
import {ClusterState, ClusterDetailRequest} from '../../../../models/cluster-state';

import {LakeService} from '../../../../services/lake.service';
import {ClusterService} from '../../../../services/cluster.service';
import {LocationService} from '../../../../services/location.service';


import {StringUtils} from '../../../../shared/utils/stringUtils';
import {NgForm} from '@angular/forms';
import {ConfigDialogComponent} from '../../widgets/config-dialog/config-dialog.component';

@Component({
  selector: 'dp-cluster-edit',
  templateUrl: './cluster-edit.component.html',
  styleUrls: ['./cluster-edit.component.scss']
})
export class ClusterEditComponent implements OnInit, AfterViewChecked {

  @ViewChild('clusterForm') clusterForm: NgForm;

  mapData: MapData[] = [];
  cluster: Cluster = new Cluster();
  searchTerm: string;
  dcName: string;
  lake: Lake;
  location: Location;
  isDOMReady: boolean = false;
  isLocationValid: boolean = true;

  showNotification = false;
  showError = false;
  errorMessage = '';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private lakeService: LakeService,
              private clusterService: ClusterService,
              private locationService: LocationService,
              private translateService: TranslateService) {
  };

  ngOnInit() {
    const rxLake =
      this.route.params
        .map(params => params['id'])
        .flatMap(lakeId => this.lakeService.retrieve(lakeId));

    rxLake
      .subscribe(lake => this.lake = lake);

    rxLake
      .flatMap(lake => this.locationService.retrieve(lake.location))
      .subscribe(location => {
        this.location = location;
        this.updateMap();
      });
  }

  ngAfterViewChecked() {
    this.isDOMReady = true;
    this.updateMap();
  }

  updateMap() {
    if(this.isDOMReady && this.location) {
      this.onSelectLocation(this.location);
    }
  }

  closeError() {
    this.showError = false;
  }

  private onError() {
    this.showError = true;
    this.errorMessage = this.translateService.instant('pages.infra.description.connectionFailed');
  }

  locationFormatter(location: Location): string {
    return `${location.city}${location.province ? ', ' + location.province : ''}, ${location.country}`;
  }

  getLocations(searchTerm) {
    return this.locationService.retrieveOptions(searchTerm);
  }

  checkLocation() {
    if (this.searchTerm.length === 0) {
      this.mapData = [];
      this.cluster.location = null;
    }
  }

  checkLocationValidity(location : Location){
    this.isLocationValid = true;
    if(!location || !location.id){
      this.isLocationValid = false;
    }
  }

  onSelectLocation(location: Location) {
    if(location.id) {
      this.mapData = [];
      let point = new Point(location.latitude, location.longitude, MapConnectionStatus.UP);
      this.mapData = [new MapData(point)];

      this.lake.location = location.id;
    }
  }

  onNewTagAddition(text: string) {
    this.lake.properties = this.lake.properties ? this.lake.properties : {};
    this.lake.properties.tags = this.lake.properties.tags ? this.lake.properties.tags : [];
    this.lake.properties.tags.push({
      name: text
    });
  }

  onTagDelete(tagDeleted) {
    this.lake.properties.tags = this.lake.properties.tags.filter(cTag => cTag.name !== tagDeleted);
  }

  isFormValid(){
    if (!this.clusterForm.form.valid || !this.isLocationValid) {
      this.errorMessage = this.translateService.instant('common.defaultRequiredFields');
      this.showError = true;
      window.scrollTo(0,0);
      return false;
    }
    return true;
  }

  handleError(error) {
    this.showError = true;
    if (error._body.indexOf('unique_name_and_dc_name_constraint') >= 0) {
      this.errorMessage = this.translateService.instant('pages.infra.description.duplicateDataCenter');
    } else {
      this.errorMessage = this.translateService.instant('pages.infra.description.clusterAddError');
    }
  }

  doGetTagsAsStringArray(tags: any[] = []) {
    return tags.map(cTag => cTag.name);
  }

  onUpdate() {
    this.showError = false;
    if(!this.isFormValid()){
      return;
    }
    this.lakeService.update(this.lake)
      .subscribe(
        () => {
          this.router.navigate(['infra', {
            status: 'success'
          }]);
        },
        error => {
          this.handleError(error);
        }
      );
  }

  onCancel() {
    this.router.navigate(['infra']);
  }
}
