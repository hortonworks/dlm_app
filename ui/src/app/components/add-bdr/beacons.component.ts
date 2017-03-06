import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import * as Rx from 'rxjs';
import {DataCenter} from '../../models/data-center';
import {CityNames} from '../../shared/utils/city-names';
import {DataCenterDetails} from '../../models/data-center-details';
import {Ambari} from '../../models/ambari';
import {BackupPolicy} from '../../models/backup-policy';
import {Location} from '../../models/location';
import {DataCenterService} from '../../services/data-center.service';
import {AmbariService} from '../../services/ambari.service';
import {BackupPolicyService} from '../../services/backup-policy.service';

import {Environment} from '../../environment';

import {DataFilter} from '../../models/data-filter';
import {DataFilterWrapper} from '../../models/data-filter-wrapper';
import {SearchQueryService} from '../../services/search-query.service';
import {SearchParam} from '../../shared/data-plane-search/search-param';
import {DataSet} from '../../models/data-set';
import {SearchQuery} from '../../models/search-query';
import {SearchParamWrapper} from '../../shared/data-plane-search/search-param-wrapper';

declare var Datamap:any;
declare var d3:any;
declare var moment: any;

@Component({
    selector: 'add-bdr',
    templateUrl: './beacons.component.html',
    styleUrls: ['./beacons.component.scss', './beacons.overrides.scss']
})
export class BeaconsComponent implements OnInit, AfterViewInit {

  pageMode: string = 'CREATE';
  viewMode: string = 'create';
  isAdvanceEnabled: boolean = false;
  dcSuperOptions: any[] = [];
  otherResourceId: string = '';

  label: string = '';
  source: {
    dataCenter?: DataCenter,
    cluster?: Ambari,
    resourceId?: string,
    resourceType?: string
  } = {
    resourceId: '',
    resourceType: 'hive'
  };
  target: {
    dataCenter?: DataCenter,
    cluster?: Ambari
  } = {};
  status: {
    isEnabled: boolean,
    since?: string,
    tSince?: string
  } = {
    isEnabled: false
  };
  schedule: {
    scheduleType?: string,
    frequency?: string,
  } = {
    scheduleType: 'hourly',
    frequency: '',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dcService: DataCenterService,
    private ambariService: AmbariService,
    private policyService: BackupPolicyService,
    private environment: Environment,
    private searchQueryService: SearchQueryService
  ) {
    //
  }

  ngOnInit() {
    const rxInit = this.activatedRoute.params;

    const [rxCreateInit, rxEditInit] = rxInit.partition(() => this.activatedRoute.snapshot.queryParams.hasOwnProperty('create'));

    const rxCreate =
        rxCreateInit
          .map(params => this.activatedRoute.snapshot.queryParams)
          .map(queryParams => ({
            dataCenterId: queryParams['dataCenter'] as string,
            clusterId: queryParams['cluster'] as string,
            resourceId: queryParams['resourceId'] as string,
            resourceType: queryParams['resourceType'] as string,
          }))
          .flatMap(
            ({dataCenterId, clusterId, resourceId, resourceType}) => Rx.Observable.forkJoin(
              this.dcService.getById(dataCenterId),
              clusterId ? this.ambariService.getById(clusterId) : Rx.Observable.of(undefined),
              Rx.Observable.of(resourceId),
              Rx.Observable.of(resourceType),
              (dataCenter, cluster, tableId) => ({
                dataCenter,
                cluster,
                resourceId,
                resourceType
              })
            )
          )
          .subscribe(source => {
            this.pageMode = 'CREATE';
            this.source = source;

            if(!this.source.resourceId) {
              this.source.resourceId = 'all';
            }

            this.otherResourceId = this.source.resourceId;
          });

      const rxEdit =
        rxEditInit
          .map(params => params['key'] as string)
          .flatMap(policyId => this.policyService.getById(policyId))
          .subscribe(
            policy => {
              this.pageMode = 'EDIT';

              this.label = policy.label;
              this.source = policy.source;
              this.target = policy.target;
              this.schedule = policy.schedule;

              this.otherResourceId = policy.source.resourceId;
            }
          );

      const rxDataCenters = this.dcService.get();

      const rxClusters = this.ambariService.get();

      Rx
        .Observable
        .forkJoin(rxDataCenters, rxClusters, (dcs, clusters) => dcs.map(cDC => ({
          key: cDC.name,
          dataCenter: cDC,
          clusters: clusters.filter(cCluster => cCluster.dataCenter === cDC.name)
        })))
        .subscribe(superDCs => {
          this.dcSuperOptions = superDCs;
          if(!this.source.cluster) {
            this.source.cluster = superDCs.find(cDC => cDC.key === this.source.dataCenter.name).clusters[0];
          }
        });


  }

  ngAfterViewInit() {
    //
  }

  doSelectViewMode(viewMode: string) {
    this.viewMode = viewMode;
  }

  doSetScheduleMode(scheduleType: string) {
    this.schedule.scheduleType = scheduleType;
  }

  doToggleAdvanced() {
    this.isAdvanceEnabled = !this.isAdvanceEnabled;
  }

  doUpdateTargetCluster() {
    const clusterOptions = this.dcSuperOptions.find(cDC => cDC.key === this.target.dataCenter.name);
    this.target.cluster = clusterOptions && clusterOptions.clusters[0];
  }

  doSave() {
    const policy = new BackupPolicy();
    policy.label = this.label;
    policy.source = {
      dataCenterId: this.source.dataCenter.name,
      clusterId: this.source.cluster.host,
      resourceId: this.source.resourceId,
      resourceType: this.source.resourceType
    };
    policy.target = {
      dataCenterId: this.target.dataCenter.name,
      clusterId: this.target.cluster.host
    };
    policy.status = this.status;
    policy.schedule = this.schedule;

    this.policyService.create(policy)
      .subscribe(
        () => this.router.navigate(['/dashboard'])
      );
  }

  doCancel() {
    if(this.source && this.source.dataCenter.name && this.source.cluster) {
      this.router.navigate([`/view-data/${this.source.dataCenter.name}`], {
          queryParams : {
            host: this.source.cluster.host
          }
      });
      return;
    }
    if(this.source && this.source.dataCenter.name) {
      this.router.navigate([`/data-lake/${this.source.dataCenter.name}`]);
      return;
    }
    this.router.navigate(['/dashboard']);
  }
}
