import {Component, OnInit, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {Cluster, ClusterDetails} from '../../../../models/cluster';
import {Lake} from '../../../../models/lake';
import {Location} from '../../../../models/location';

import {LakeService} from '../../../../services/lake.service';
import {ClusterService} from '../../../../services/cluster.service';
import {LocationService} from '../../../../services/location.service';
import {StringUtils} from '../../../../shared/utils/stringUtils';
import {IdentityService} from '../../../../services/identity.service';
import {DateUtils} from '../../../../shared/utils/date-utils';

@Component({
  selector: 'dp-cluster-details',
  templateUrl: './cluster-details.component.html',
  styleUrls: ['./cluster-details.component.scss']
})
export class ClusterDetailsComponent implements OnInit, AfterViewInit {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private lakeService: LakeService,
              private clusterService: ClusterService,
              private locationService: LocationService,
              private identityService: IdentityService) {
  }

  lake: Lake = new Lake();
  clusters: Cluster[];
  cluster: any;
  clusterHealth: any;
  rmHealth: any;
  clusterDetails: ClusterDetails = new ClusterDetails();
  location: Location = new Location();
  user: any;
  @ViewChild('hdfsProgress') hdfsProgress: ElementRef;
  @ViewChild('rmHeapProgress') rmHeapProgress: ElementRef;
  @ViewChild('heapProgress') heapProgress: ElementRef;
  hdfsProgressObservable: Observable<boolean> = Observable.create();
  heapProgressObservable: Observable<boolean> = Observable.create();
  rmHeapProgressObservable: Observable<boolean> = Observable.create();
  rmHeapPercent: string;
  hdfsPercent: string;
  heapPercent: string;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.fetchClusterDetails(params['id']);
    });
  }

  fetchClusterDetails(lakeId) {
    this.lakeService.retrieve(lakeId).subscribe((lake: Lake) => {
      this.lake = lake;
      this.clusterService.listByLakeId({lakeId: this.lake.id}).subscribe(clusters => {
        this.clusters = clusters;
        if (this.clusters && this.clusters.length) {
          this.cluster = clusters[0];
          this.getClusterWithLocation(this.lake.location, this.cluster.id, this.cluster.userid).subscribe(clusterInfo => {
            this.clusterHealth = clusterInfo.health;
            this.location = clusterInfo.location;
            this.user = clusterInfo.user;
            this.rmHealth = clusterInfo.rmhealth;
            this.clusterDetails = this.getClusterDetails();
            this.processProgressbarInfo();
          });
        }
      });
    });
  }

  ngAfterViewInit() {
    let self = this;
    this.hdfsProgress.nativeElement.addEventListener('mdl-componentupgraded', function () {
      this.MaterialProgress.setProgress(0);
      self.hdfsProgressObservable = Observable.create(observer => {
        observer.next(true);
      });
    });
    this.heapProgress.nativeElement.addEventListener('mdl-componentupgraded', function () {
      this.MaterialProgress.setProgress(0);
      self.heapProgressObservable = Observable.create(observer => {
        observer.next(true);
      });
    });
    this.rmHeapProgress.nativeElement.addEventListener('mdl-componentupgraded', function () {
      this.MaterialProgress.setProgress(0);
      self.rmHeapProgressObservable = Observable.create(observer => {
        observer.next(true);
      });
    });
  }

  processProgressbarInfo() {
    this.hdfsProgressObservable.subscribe(() => {
      let percent = this.getPercent(this.clusterHealth.nameNodeInfo.CapacityUsed, this.clusterHealth.nameNodeInfo.CapacityTotal);
      this.hdfsPercent = `${percent}%`;
      this.updateProgess(this.hdfsProgress, percent);
    });
    this.heapProgressObservable.subscribe(() => {
      let percent = this.getPercent(this.clusterHealth.nameNodeInfo.HeapMemoryUsed, this.clusterHealth.nameNodeInfo.HeapMemoryMax);
      this.heapPercent = `${percent}%`;
      this.updateProgess(this.heapProgress, percent);
    });
    this.rmHeapProgressObservable.subscribe(() => {
      let percent = this.getPercent(this.rmHealth.metrics.jvm.HeapMemoryUsed, this.rmHealth.metrics.jvm.HeapMemoryMax);
      this.rmHeapPercent = `${percent}%`;
      this.updateProgess(this.rmHeapProgress, percent);
    });
  }

  updateProgess(element, progress) {
    element.nativeElement.MaterialProgress.setProgress(progress);
  }

  getPercent(used, total) {
    return ((parseInt(used) / parseInt(total)) * 100).toFixed(2);
  }

  getClusterDetails() {
    let clusterDetails: ClusterDetails = new ClusterDetails();
    clusterDetails.status = this.clusterHealth.nameNodeInfo.state;
    clusterDetails.hdfsUsed = StringUtils.humanizeBytes(this.clusterHealth.nameNodeInfo.CapacityUsed);
    clusterDetails.hdfsTotal = StringUtils.humanizeBytes(this.clusterHealth.nameNodeInfo.CapacityTotal);
    clusterDetails.securityType = this.cluster.properties['security_type'];
    clusterDetails.noOfSerices = Object.keys(this.cluster.properties['desired_service_config_versions']).length;
    clusterDetails.nodes = this.cluster.properties.total_hosts;
    clusterDetails.healthyNodes = this.cluster.properties.health_report['Host/host_state/HEALTHY'];
    clusterDetails.unhealthyNodes = this.cluster.properties.health_report['Host/host_state/UNHEALTHY'];
    clusterDetails.heapSizeTotal = StringUtils.humanizeBytes(this.clusterHealth.nameNodeInfo.HeapMemoryMax);
    clusterDetails.heapSizeUsed = StringUtils.humanizeBytes(this.clusterHealth.nameNodeInfo.HeapMemoryUsed);
    clusterDetails.location = `${this.location.city}, ${this.location.country}`;
    clusterDetails.hdpVersion = this.cluster.properties.version;
    clusterDetails.uptime = DateUtils.toReadableDate(new Date().getTime() - this.clusterHealth.nameNodeInfo.StartTime);
    let tags = '';
    this.lake.properties.tags.forEach(tag => {
      tags = `${tags}${tags.length ? ', ' : ''}${tag.name}`;
    });
    clusterDetails.tags = tags;
    if(this.rmHealth && this.rmHealth.ServiceComponentInfo && this.rmHealth.metrics){
      clusterDetails.nodeManagersActive = this.rmHealth.ServiceComponentInfo.rm_metrics.cluster.activeNMcount;
      clusterDetails.nodeManagersInactive = this.rmHealth.ServiceComponentInfo.rm_metrics.cluster.unhealthyNMcount;
      clusterDetails.rmHeapTotal = StringUtils.humanizeBytes(this.rmHealth.metrics.jvm.HeapMemoryMax);
      clusterDetails.rmHeapUsed =  StringUtils.humanizeBytes(this.rmHealth.metrics.jvm.HeapMemoryUsed);
      clusterDetails.rmUptime = DateUtils.toReadableDate(new Date().getTime() - this.rmHealth.metrics.runtime.StartTime);
    }
    return clusterDetails;
  }

  private getClusterWithLocation(locationId, clusterId, userId) {
    return Observable.forkJoin(
      this.locationService.retrieve(locationId).map((res) => res),
      this.clusterService.retrieveDetailedHealth(clusterId).map((res) => res),
      this.identityService.getUserById(userId).map((res) => res),
      this.clusterService.retrieveResourceMangerHealth(clusterId).map(res => res)
    ).map(response => {
      return {
        location: response[0],
        health: response[1],
        user: response[2],
        rmhealth : response[3]
      };
    });
  }

  goToClusters() {
    this.router.navigate(['/infra']);
  }

}
