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
  selector: 'dp-cluster-add',
  templateUrl: './cluster-add.component.html',
  styleUrls: ['./cluster-add.component.scss']
})
export class ClusterAddComponent implements OnInit {

  @ViewChild('ambariInput') ambariInputContainer: ElementRef;
  @ViewChild('clusterForm') clusterForm: NgForm;
  @ViewChild('config') private config: ConfigDialogComponent;

  @HostListener('keydown', ['$event', '$event.target'])
  public onKeyDown($event: KeyboardEvent, targetElement: HTMLElement): void {
    const code = $event.which || $event.keyCode;
    if (code === 27 && this.showConfig) {
      this.closeConfig();
    }
  }


  _isClusterValidateInProgress = false;
  _isClusterValidateSuccessful = false;
  _clusterState: ClusterState = new ClusterState();
  _isClusterValid;
  showConfig = false;

  mapData: MapData[] = [];
  cluster: Cluster = new Cluster();
  searchTerm: string;
  dcName: string;

  dpRequiredServices = ['ATLAS'];

  showNotification = false;
  showError = false;
  errorMessage = '';
  isInvalidAmbariUrl = false;

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

  get reasons() {
    let reasons: string[] = [];
    if (this._isClusterValidateSuccessful && !this._isClusterValid && !this._clusterState.alreadyExists) {
      let reasonsTranslation = this.translateService.instant('pages.infra.description.connectionFailureReasons');
      Object.keys(reasonsTranslation).forEach(key => {
        reasons.push(reasonsTranslation[key]);
      });
    } else if (this._clusterState.alreadyExists) {
      let reasonsTranslation = this.translateService.instant('pages.infra.description.clusterAlreadyExists');
      reasons.push(reasonsTranslation);
    } else if (this.isInvalidAmbariUrl) {
      let reasonsTranslation = this.translateService.instant('pages.infra.description.invalidAmbariUrl');
      reasons.push(reasonsTranslation);
    }

    return reasons;
  }

  ngOnInit() {
    this.lakeService.clusterAdded$.subscribe(() => {
      this.showNotification = true;
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
    this.isInvalidAmbariUrl = false;
    this.showNotification = false;
    this._isClusterValidateInProgress = true;
    this._isClusterValidateSuccessful = false;
    this._clusterState = new ClusterState();
    let cleanedUri = StringUtils.cleanupUri(this.cluster.ambariurl);
    if (!cleanedUri) {
      this.isInvalidAmbariUrl = true;
      this._isClusterValidateInProgress = false;
      this.applyErrorClass();
      return;
    }
    this.lakeService.validate(cleanedUri).subscribe(
      response => {
        this._clusterState = response as ClusterState;
        if (response.ambariApiStatus === 200) {
          //TODO - Padma/Babu/Hemanth/Rohit :Display that Knox was detected
          let detailRequest = new ClusterDetailRequest();
          this.createDetailRequest(detailRequest, cleanedUri);
          this.requestClusterInfo(detailRequest, cleanedUri);
          this.removeValidationError();
        } else if (response.requestAmbariCreds) {
          this.showConfig = true;
        } else if (response.requestKnoxURL) {
          this.showConfig = true;
        }
        else {
          this._isClusterValidateInProgress = false;
          this._isClusterValidateSuccessful = true;
          this._isClusterValid = false;
          this.applyErrorClass();
        }
      },
      () => {
        this.onError();
      }
    );
  }

  applyErrorClass() {
    if (this.ambariInputContainer.nativeElement.className.indexOf('validation-error') === -1) {
      this.ambariInputContainer.nativeElement.className += ' validation-error';
    }
  }

  getConfigs(detailRequest: any) {
    detailRequest.url = this.cluster.ambariurl;
    detailRequest.knoxUrl = this._clusterState.knoxUrl;
    detailRequest.knoxDetected = this._clusterState.knoxDetected;
    this.requestClusterInfo(detailRequest, this.cluster.ambariurl);
    this.removeValidationError();
    this.closeConfig();
  }

  closeConfig() {
    this._isClusterValidateInProgress = false;
    this.showConfig = false;
  }

  private removeValidationError() {
    this.ambariInputContainer.nativeElement.className = this.ambariInputContainer.nativeElement.className.replace('validation-error', '');
  }

  private requestClusterInfo(detailRequest: ClusterDetailRequest, cleanedUri: string) {
    this._isClusterValidateInProgress = true;
    this.clusterService.getClusterInfo(detailRequest).subscribe(clusterInfo => {
      this._isClusterValidateInProgress = false;
      this._isClusterValidateSuccessful = true;
      this._isClusterValid = true;
      this.extractClusterInfo(clusterInfo);
      this.cluster.ambariurl = cleanedUri;
      if (this._clusterState.knoxDetected) {
        // Update cluster state with the final knox URL - determined by
        this._clusterState.knoxUrl = clusterInfo[0].knoxUrl
      }
    }, (error) => {
      this.onError();
    });
  }

  private createDetailRequest(detailRequest: ClusterDetailRequest, cleanedUri: string) {
    detailRequest.url = cleanedUri;
    detailRequest.knoxDetected = this._clusterState.knoxDetected;
    detailRequest.knoxUrl = this._clusterState.knoxUrl;

  }

  private onError() {
    this._isClusterValidateSuccessful = false;
    this._isClusterValidateInProgress = false;
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

  get showClusterDetails() {
    return this._isClusterValidateSuccessful && this._isClusterValid;
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
    if (!this.isFormValid()) {
      return;
    }
    this.createCluster()
      .subscribe(
        () => {
          this.router.navigate(['infra']).then(() => {

          });
        },
        error => {
          this.handleError(error);
        }
      );
  }

  isFormValid() {
    if (!this.clusterForm.form.valid) {
      this.errorMessage = this.translateService.instant('common.defaultRequiredFields');
      this.showError = true;
      window.scrollTo(0, 0);
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
    lake.dcName = this.dcName;
    lake.ambariUrl = this.cluster.ambariurl;
    lake.location = this.cluster.location.id;
    lake.isDatalake = this.isDataLake;
    lake.name = this.cluster.name;
    lake.description = this.cluster.description;
    lake.dcName = this.cluster.dcName;
    lake.state = 'TO_SYNC';
    if (this._clusterState.knoxDetected) {
      lake.knoxEnabled = true;
      lake.knoxUrl = this._clusterState.knoxUrl;
    }
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
    if (!this.isFormValid()) {
      return;
    }
    this.createCluster().subscribe(
      () => {
        this.cluster = new Cluster();
        this._isClusterValid = false;
        this._isClusterValidateSuccessful = false;
        this.router.navigate(['infra/add']).then(() => {
          this.lakeService.clusterAdded.next();
        });
      },
      error => {
        this.handleError(error);
      }
    );
  }
}
