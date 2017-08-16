import {Component, ElementRef, ViewChild, OnInit, HostListener} from '@angular/core';
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
export class ClusterEditComponent implements OnInit {

  @ViewChild('ambariInput') ambariInputContainer: ElementRef;
  @ViewChild('clusterForm') clusterForm: NgForm;
  @ViewChild('config') private config: ConfigDialogComponent;

  mapData: MapData[] = [];
  cluster: Cluster = new Cluster();
  searchTerm: string;
  dcName: string;

  dpRequiredServices = ['ATLAS'];

  showNotification = false;
  showError = false;
  errorMessage = '';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private lakeService: LakeService,
              private clusterService: ClusterService,
              private locationService: LocationService,
              private  translateService: TranslateService) {
  };

  get dLFoundMessage() {
    let services = `${' ' + this.dpRequiredServices.join(', ')}`;
    return this.translateService.instant('pages.infra.description.datalake', {serviceNames: services});
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.status && params.status === 'success') {
        this.showNotification = true;
      }
    });
  }

  closeNotification() {
    this.showNotification = false;
  }

  closeError() {
    this.showError = false;
  }

  getClusterInfo(event) {
    this.showError = false;
    this.showNotification = false;
    let cleanedUri = StringUtils.cleanupUri(this.cluster.ambariurl);
    this.lakeService.validate(cleanedUri).subscribe(
      response => {
        if (response.ambariApiStatus === 200) {
          //TODO - Padma/Babu/Hemanth/Rohit :Display that Knox was detected
          let detailRequest = new ClusterDetailRequest();
          this.requestClusterInfo(detailRequest, cleanedUri);
          this.removeValidationError();
        }
        else {
          if(this.ambariInputContainer.nativeElement.className.indexOf('validation-error') === -1){
            this.ambariInputContainer.nativeElement.className += ' validation-error';
          }
        }
      },
      () => {
        this.onError();
      }
    );
  }

  private removeValidationError() {
    this.ambariInputContainer.nativeElement.className = this.ambariInputContainer.nativeElement.className.replace('validation-error', '');
  }

  private requestClusterInfo(detailRequest: ClusterDetailRequest, cleanedUri: string) {
    this.clusterService.getClusterInfo(detailRequest).subscribe(clusterInfo => {
      this.extractClusterInfo(clusterInfo);
      this.cluster.ambariurl = cleanedUri;
    }, (error) => {
      this.onError();
    });
  }

  private onError() {
    this.showError = true;
    this.errorMessage = this.translateService.instant('pages.infra.description.connectionFailed');
  }

  private extractClusterInfo(clusterInfo) {
    this.cluster.name = clusterInfo[0].clusterName;
    this.cluster.services = clusterInfo[0].services;
    // TEMP FIX : Should come from backend
    let urlParts = this.cluster.ambariurl.split('/');
    this.cluster.ipAddress = urlParts.length ? urlParts[2].substr(0, urlParts[2].indexOf(':')) : '';
  }

  get isDataLake() {
    for (let name of this.dpRequiredServices) {
      if (this.cluster.services.indexOf(name) === -1) {
        return false;
      }
    }
    return true;
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
    }
  }

  onSelectLocation(location: Location) {
    this.mapData = [];
    let point = new Point(location.latitude, location.longitude, MapConnectionStatus.UP);
    this.mapData = [new MapData(point)];
    this.cluster.location = location;
  }

  onNewTagAddition(text: string) {
    this.cluster.tags.push(text);
  }

  onCreate() {
    this.showError = false;
    if(!this.isFormValid()){
      return;
    }
    this.createCluster()
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

  isFormValid(){
    if (!this.clusterForm.form.valid) {
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

  onKeyPress(event) {
    if (event.keyCode === 13) {
      this.getClusterInfo(event);
    }
  }

  createCluster() {
    let lake = new Lake();
    lake.dcName = this.cluster.dcName;
    lake.description = this.cluster.description;
    let properties = {tags: []};
    this.cluster.tags.forEach(tag => properties.tags.push({'name': tag}));
    lake.properties = properties;
    return this.lakeService.insert(lake);
  }

  onCancel() {
    this.router.navigate(['infra']);
  }

  onCreateAndAdd() {
    this.showError = false;
    if(!this.isFormValid()){
      return;
    }
    this.createCluster().subscribe(
      () => {
        this.cluster = new Cluster();
        this.router.navigate(['infra/add', {
          status: 'success'
        }]);
      },
      error => {
        this.handleError(error);
      }
    );
  }
}
