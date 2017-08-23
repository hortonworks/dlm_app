import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AddOnAppService} from '../../../../services/add-on-app.service';
import {AddOnAppInfo, EnabledAppInfo} from '../../../../models/add-on-app';
import {LakeService} from '../../../../services/lake.service';
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

  showNotification = false;

  serviceNameParams: any;

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
    this.addOnAppService.serviceEnabled$.subscribe((name) => {
      this.serviceNameParams = {
        serviceName: name
      };
      this.showNotification = true;
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
    let enabledApp = this.enabledAppDetails.find((enabledApp: EnabledAppDetails) => enabledApp.service.skuName === serviceName);
    Observable.forkJoin(
      this.addOnAppService.getServiceDependencies(serviceName),
      this.lakeService.listWithClusters()).subscribe(responses => {
      let serviceDependency = responses[0];
      let lakes = responses[1];
      lakes.forEach((lake) => {
        this.extractClusterInfo(serviceName, lake, serviceDependency.dependencies).subscribe(clusterInfo => {
          clusters.push(clusterInfo);
          enabledApp.clustersInfo = clusters;
          enabledApp.isOpen = true;
          clusterInfo.syncInProgress = true;
          this.clusterService.syncCluster(lake.data.id).subscribe(response => {
            if (response._body === 'false') {
              clusterInfo.synced = false;
              clusterInfo.syncInProgress = false;
              return;
            }
            this.lakeService.retrieve(lake.data.id.toString())
              .delay(2000)
              .repeat(15)
              .skipWhile((lake) => lake.state !== 'SYNCED' && lake.state !== 'SYNC_ERROR' && ++count < 10)
              .first().subscribe(lakeUpdated => {
              if (lakeUpdated.state === 'SYNC_ERROR') {
                clusterInfo.synced = false;
                clusterInfo.syncInProgress = false;
                return;
              }
              this.extractClusterInfo(serviceName, lake, serviceDependency.dependencies).subscribe(info => {
                clusterInfo.lastUpdated = DateUtils.toReadableDate(new Date().getTime() - new Date(lakeUpdated.updated).getTime());
                clusterInfo.syncInProgress = false;
                clusterInfo.synced = true;
                clusterInfo.dependenciesMet = info.dependenciesMet;
              });
            });
          });
        });
      });
    });
  }

  extractClusterInfo(serviceName, lake, dependencies): Observable<any> {
    return Observable.create(observer => {
      let services = Object.keys(lake.clusters[0].properties.desired_service_config_versions);
      this.lakeService.getDiscoveredServices(lake.data.id).subscribe(discoveredServices => {
        let dependenciesMet = true;
        dependencies.forEach(dependency => {
          if (!services.find(key => key === dependency) && !discoveredServices.find(service => service.servicename === dependency)) {
            dependenciesMet = false;
          }
        });
        return observer.next({
          dpClusterId: lake.data.id,
          name: lake.data.name,
          lastUpdated: DateUtils.toReadableDate(new Date().getTime() - new Date(lake.data.updated).getTime()),
          dependenciesMet: dependenciesMet
        });
      }, error => {

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
  showAll: boolean = false;
}
