import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AddOnAppService} from '../../../../services/add-on-app.service';
import {AddOnAppInfo, EnabledAppInfo} from '../../../../models/add-on-app';
import {LakeService} from '../../../../services/lake.service';
import {Cluster} from '../../../../models/cluster';
import {Lake} from '../../../../models/lake';
import {Observable} from 'rxjs/Observable';
import {ClusterService} from '../../../../services/cluster.service';
import {DateUtils} from '../../../../shared/utils/date-utils';

@Component({
  selector: 'dp-service-management',
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.scss']
})
export class ServiceManagementComponent implements OnInit {

  clusters: any[] = [];

  allServices: AddOnAppInfo[] = [];
  availableServices: AddOnAppInfo[] = [];
  enabledAppDetails: EnabledAppDetails[] = [];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private addOnAppService: AddOnAppService,
              private lakeService: LakeService,
              private clusterService: ClusterService) {
  }

  ngOnInit() {
    this.addOnAppService.getAllServices().subscribe((services) => {
      this.allServices = services;
      this.availableServices = this.allServices.filter(service => service.enabled === false);
    });
    this.addOnAppService.getEnabledServices().subscribe((services) => {
      services.forEach(service => {
        this.enabledAppDetails.push(new EnabledAppDetails(service, [], false));
      });
    });
  }

  getClusters(enbaledApp: EnabledAppDetails) {
    enbaledApp.isOpen = !enbaledApp.isOpen;
    if (enbaledApp.isOpen) {
      this.lisClusters(enbaledApp.service.skuName);
    } else {
      enbaledApp.clustersInfo = [];
    }
  }

  lisClusters(serviceName) {
    let clusters = [];
    let count = 0;
    this.lakeService.listWithClusters().subscribe(lakes => {
      lakes.forEach((lake) => {
        this.clusterService.syncCluster(lake.data.id).subscribe((response) => {

        });
        if (lake.data && lake.clusters && lake.clusters.length > 0) {
          this.extractClusterInfo(serviceName, lake).subscribe(clusterInfo => {
            if (clusterInfo.enable) {
              clusters.push(clusterInfo);
            }
            let enabledApp = this.enabledAppDetails.find((enabledApp: EnabledAppDetails) => enabledApp.service.skuName === serviceName);
            enabledApp.clustersInfo = clusters;
            enabledApp.isOpen = true;
          });
        }
      });
    });
  }

  extractClusterInfo(serviceName, lake): Observable<any> {
    return Observable.create(observer => {
      let services = Object.keys(lake.clusters[0].properties.desired_service_config_versions);
      let dependencies = this.addOnAppService.getServiceDependencies(serviceName);
      let discoveredServices = [];
      this.lakeService.getDiscoveredServices(lake.data.id).subscribe(clusterServices => {
        discoveredServices = clusterServices;
        let enable = false;
        dependencies.forEach(dependency => {
          if (!services.find(key => key === dependency) && !discoveredServices.find(service => service.servicename === dependency)) {
            enable = true;
          }
        });
        return observer.next({
          dpClusterId: lake.data.id,
          name: lake.data.name,
          lastUpdated: DateUtils.toReadableDate(new Date().getTime() - new Date(lake.data.updated).getTime()),
          enable: enable
        });
      });
    });

  }

  enableServiceOnCluster(dpClusterId, service) {
    this.router.navigate(['/infra/services/install'], {
      queryParams: {
        id: dpClusterId,
        name: service.skuName
      }
    });
  }

  onSort(e) {

  }

  enableService(service: AddOnAppInfo) {
    this.router.navigate(['verify', service.skuName], {relativeTo: this.route})
  }

}

export class EnabledAppDetails {
  constructor(service: EnabledAppInfo,
              clustersInfo: any[],
              isOpen: boolean) {

    this.service = service;
    this.clustersInfo = clustersInfo ? clustersInfo : [];
    this.isOpen = isOpen;

  }

  dpClusterId: number;
  service: EnabledAppInfo;
  clustersInfo: any[] = [];
  isOpen: boolean;
}
