import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AddOnAppService} from '../../../../../services/add-on-app.service';
import {ClusterService} from '../../../../../services/cluster.service';
import {LakeService} from '../../../../../services/lake.service';
import {Observable} from 'rxjs/Observable';
import {Cluster} from '../../../../../models/cluster';
import {SKU} from '../../../../../models/add-on-app';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'dp-manual-install-check',
  templateUrl: './manual-install-check.component.html',
  styleUrls: ['./manual-install-check.component.scss']
})
export class ManualInstallCheckComponent implements OnInit {

  private service: string;
  private dpClusterId: string;
  private cluster: Cluster;
  private sku: SKU;

  checkInProgress = false;
  verificationComplete = false;
  installSuccessful = true;
  verificationChecked = false;
  descriptionParams: any;
  clusterNameParams: any;
  failedServices: string[] = [];
  successfulServices: string[] = [];
  dependentServices: string[] = [];
  discoveredServices: any[] = [];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private addOnAppService: AddOnAppService,
              private clusterService: ClusterService,
              private lakeService: LakeService,
              private translateService: TranslateService) {
  }


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.service = params['name'];
      this.dpClusterId = params['id'];
      Observable.forkJoin(
        this.clusterService.listByLakeId({lakeId: this.dpClusterId}),
        this.addOnAppService.getServiceByName(this.service),
        this.addOnAppService.getServiceDependencies(this.service),
        this.lakeService.getDiscoveredServices(this.dpClusterId)
      ).subscribe(responses => {
        let cluster: Cluster = responses[0][0];
        let sku = responses[1];
        this.descriptionParams = {
          serviceName: `${sku.description}`,
          clusterName: cluster.name
        };
        this.clusterNameParams = {
          clusterName: cluster.name
        }
        let services = Object.keys(cluster.properties.desired_service_config_versions);
        this.dependentServices = responses[2].dependencies;
        this.discoveredServices = responses[3];
        this.dependentServices.forEach(dependency => {
          if (!services.find(key => key === dependency) && !this.discoveredServices.find(service => service.servicename === dependency)) {
            this.failedServices.push(dependency);
          } else {
            this.successfulServices.push(dependency);
          }
        });
      });

    });
  }

  verify() {
    if (!this.verificationChecked) {
      return;
    }
    let count = 0;
    this.checkInProgress = true;
    this.clusterService.syncCluster(this.dpClusterId).subscribe((response) => {
      this.lakeService.retrieve(this.dpClusterId)
        .delay(2000)
        .repeat(15)
        .skipWhile((lake) => lake.state !== 'SYNCED' && ++count < 10)
        .first().subscribe(lake => {
        this.checkServices();
      });
    });
  }

  checkServices() {
    this.failedServices = [];
    this.successfulServices = [];
    Observable.forkJoin(
      this.clusterService.listByLakeId({lakeId: this.dpClusterId}),
      this.lakeService.getDiscoveredServices(this.dpClusterId)).subscribe(responses => {
      let cluster = responses[0][0];
      let discoveredService: any[] = responses[1];
      let services: string[] = Object.keys(cluster.properties.desired_service_config_versions);
      let installSuccessful = true;
      this.dependentServices.forEach(dependency => {
        if (!services.find(key => key === dependency) && !discoveredService.find(service => service.servicename === dependency)) {
          this.failedServices.push(dependency);
          installSuccessful = false;
        } else {
          this.successfulServices.push(dependency);
        }
      });
      this.verificationComplete = true;
      this.installSuccessful = installSuccessful;
      if (!installSuccessful) {
        this.verificationChecked = false;
      }
      this.checkInProgress = false;
    });

  }

  next() {
    this.router.navigate(['/infra/services']);
  }

  cancel() {
    this.router.navigate(['/infra/services']);
  }

}
